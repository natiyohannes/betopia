const crypto = require('crypto');
const axios = require('axios');

/**
 * Production-Ready Telebirr Integration Utility
 */
class TelebirrUtility {
    constructor(config) {
        this.appId = config.appId;
        this.appKey = config.appKey;
        this.publicKey = config.publicKey; // Telebirr Public Key (for encryption)
        this.privateKey = config.privateKey; // Merchant Private Key (for signing/decryption)
        this.notifyUrl = config.notifyUrl;
        this.shortCode = config.shortCode;
        this.fabricAppId = config.fabricAppId;
        this.apiEndpoint = config.apiEndpoint || 'https://app.telebirr.com/proxypay/applyFabToken';
        this.baseUrl = config.baseUrl;
    }

    /**
     * RSA Encryption using Telebirr's Public Key
     */
    encrypt(data) {
        const buffer = Buffer.from(JSON.stringify(data));
        const encrypted = crypto.publicEncrypt(
            {
                key: `-----BEGIN PUBLIC KEY-----\n${this.publicKey}\n-----END PUBLIC KEY-----`,
                padding: crypto.constants.RSA_PKCS1_PADDING,
            },
            buffer
        );
        return encrypted.toString('base64');
    }

    /**
     * RSA Decryption using Merchant's Private Key (for Webhooks)
     */
    decrypt(encryptedData) {
        try {
            const buffer = Buffer.from(encryptedData, 'base64');
            const decrypted = crypto.privateDecrypt(
                {
                    key: `-----BEGIN PRIVATE KEY-----\n${this.privateKey}\n-----END PRIVATE KEY-----`,
                    padding: crypto.constants.RSA_PKCS1_PADDING,
                },
                buffer
            );
            return JSON.parse(decrypted.toString());
        } catch (error) {
            console.error('Decryption Error:', error.message);
            throw new Error('Failed to decrypt Telebirr payload');
        }
    }

    /**
     * Create Signature Generator using SHA256 (Parameters + AppKey)
     */
    generateSignature(data) {
        const sortedData = Object.keys(data)
            .sort()
            .map(key => `${key}=${data[key]}`)
            .join('&');

        const signingString = `${sortedData}&appKey=${this.appKey}`;

        const signer = crypto.createSign('SHA256');
        signer.update(signingString);
        signer.end();

        return signer.sign(
            `-----BEGIN PRIVATE KEY-----\n${this.privateKey}\n-----END PRIVATE KEY-----`,
            'base64'
        );
    }

    /**
     * Build initiateSubscription function
     */
    async initiateSubscription({ outTradeNo, totalAmount, subject }) {
        try {
            const timestamp = Date.now().toString();
            const content = {
                appId: this.appId,
                outTradeNo: outTradeNo,
                totalAmount: totalAmount.toString(),
                subject: subject,
                notifyUrl: this.notifyUrl,
                shortCode: this.shortCode,
                timestamp: timestamp,
                receiveName: "Betopia Properties",
                timeoutExpress: "30",
                nonceStr: crypto.randomBytes(16).toString('hex')
            };

            const signature = this.generateSignature(content);

            const payload = {
                appid: this.appId,
                sign: signature,
                ussd: this.encrypt(content)
            };

            const response = await axios.post(this.apiEndpoint, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 5000 // Handle timeout
            });

            // Return the toPayUrl from Telebirr response
            return response.data;
        } catch (error) {
            console.error('Telebirr Subscription Error:', error.response?.data || error.message);
            throw new Error('Failed to initiate Telebirr subscription');
        }
    }

    /**
     * Verify Webhook Signature
     */
    verifySignature(data) {
        const { sign, ...payload } = data;
        if (!sign) return false;

        const sortedData = Object.keys(payload)
            .sort()
            .map(key => `${key}=${payload[key]}`)
            .join('&');

        const signingString = `${sortedData}&appKey=${this.appKey}`;

        const verifier = crypto.createVerify('SHA256');
        verifier.update(signingString);
        verifier.end();

        return verifier.verify(
            `-----BEGIN PUBLIC KEY-----\n${this.publicKey}\n-----END PUBLIC KEY-----`,
            sign,
            'base64'
        );
    }
}

module.exports = TelebirrUtility;
