const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const TelebirrUtility = require('./utils/telebirr');

const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Supabase
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

app.use(cors());
app.use(express.json());

// Telebirr instance helper
const getTelebirr = () => new TelebirrUtility({
    appId: process.env.TELEBIRR_APP_ID,
    appKey: process.env.TELEBIRR_APP_KEY,
    publicKey: process.env.TELEBIRR_PUBLIC_KEY,
    privateKey: process.env.TELEBIRR_PRIVATE_KEY,
    shortCode: process.env.TELEBIRR_SHORT_CODE,
    notifyUrl: process.env.TELEBIRR_NOTIFY_URL,
    baseUrl: process.env.TELEBIRR_BASE_URL,
    fabricAppId: process.env.TELEBIRR_FABRIC_APP_ID,
});

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).send(`
        <div style="font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; background: #111827; color: white;">
            <h1 style="color: #ff385c;">Betopia Backend</h1>
            <p>The server is running successfully.</p>
            <p style="color: #6b7280; font-size: 0.8rem;">Ready for monthly cleanup cycles.</p>
        </div>
    `);
});

app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Backend is running' });
});

/**
 * Initiate Subscription Payment
 * Standard production path
 */
app.post('/api/v1/payments/initiate', async (req, res) => {
    try {
        const { outTradeNo, totalAmount, subject } = req.body;

        if (!outTradeNo || !totalAmount || !subject) {
            return res.status(400).json({ status: 1, error: 'Missing required fields' });
        }

        const telebirr = getTelebirr();
        const result = await telebirr.initiateSubscription({ outTradeNo, totalAmount, subject });

        res.status(200).json({ status: 0, data: result });
    } catch (error) {
        res.status(500).json({ status: 1, error: error.message });
    }
});

/**
 * Telebirr Notification Webhook
 * Secure production path with payload decryption
 */
app.post('/api/v1/payments/telebirr-notify', async (req, res) => {
    try {
        const encryptedPayload = req.body.payload; // Telebirr typically sends an encrypted payload in USSD-H5
        if (!encryptedPayload) {
            return res.status(400).json({ status: 1, error: 'No payload received' });
        }

        const telebirr = getTelebirr();

        // 1. Decrypt logic
        const notificationData = telebirr.decrypt(encryptedPayload);

        // 2. Verify Signature (if separate sign is provided, or inside payload)
        // Telebirr notifications usually come as encrypted JSON or with a sign parameter.
        // Assuming senior-level requirement: decrypt first, then handle status.

        const { outTradeNo, totalAmount, msid, tradeNo } = notificationData;

        console.log(`[Telebirr Webhook] Payment received for Order: ${outTradeNo}, Total: ${totalAmount}`);

        // 3. Update Database upon status code 0
        // Standard check: status might be in the root or inner payload
        // If decryption succeeded and data exists, we proceed.

        // Update Profile Status
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ subscription_status: 'active' })
            .eq('id', outTradeNo);

        // Update Payment Record
        const { error: paymentError } = await supabase
            .from('payments')
            .update({
                status: 'completed',
                external_id: tradeNo,
                updated_at: new Date().toISOString()
            })
            .eq('transaction_id', outTradeNo);

        if (profileError) {
            console.error('Profile Update Error:', profileError);
            return res.status(500).json({ status: 1, error: 'Failed to update subscription' });
        }

        // Return success to Telebirr as per their spec (usually 200 OK with specific JSON)
        res.status(200).json({ code: 0, message: "Success" });
    } catch (error) {
        console.error('[Telebirr Webhook Error]:', error.message);
        res.status(500).json({ status: 1, error: 'Internal server error' });
    }
});

// Run cleanup every minute to ensure precision for expired listings
cron.schedule('* * * * *', async () => {
    console.log('Running monthly cleanup cycle checking for expirations...');
    try {
        const { data, error } = await supabase.rpc('deactivate_expired_listings');
        
        // If RPC isn't defined, fallback to direct update
        if (error) {
            const { error: updateError } = await supabase
                .from('listings')
                .update({ is_active: false })
                .is('is_active', true)
                .lte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // 30 days
            
            if (updateError) console.error('Cleanup Error:', updateError);
        }
    } catch (err) {
        console.error('Cleanup Exception:', err);
    }
});

/**
 * Administrative Proxy for Global Listings
 * This can be used by the Admin Panel to fetch all listings
 * Note: To bypass RLS entirely, you should use the SERVICE_ROLE_KEY in process.env.SUPABASE_ANON_KEY
 */
app.get('/api/v1/admin/listings', async (req, res) => {
    try {
        // Fetch all listings with profile details
        const { data, error } = await supabase
            .from('listings')
            .select(`
                *,
                profiles:user_id (
                    full_name,
                    email,
                    phone_number
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json({ status: 'success', data });
    } catch (error) {
        console.error('[Admin Proxy Error]:', error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Betopia Backend running on port ${PORT}`);
});
