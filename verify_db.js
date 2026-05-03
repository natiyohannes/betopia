const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://nujnunsareitpcaegbcu.supabase.co';
const supabaseAnonKey = 'sb_publishable_IBwnUC53bP7Y-oA6RwWgJA_WnuRDJoj';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkConnection() {
    console.log('Testing connection to Supabase...');
    try {
        // Just try to fetch the pricing plans as a health check
        const { data, error } = await supabase
            .from('pricing_plans')
            .select('name')
            .limit(1);

        if (error) {
            console.error('❌ Database connection failed:', error.message);
            if (error.message.includes('relation "pricing_plans" does not exist')) {
                console.log('💡 Note: The connection is technically working, but you haven\'t run the schema yet. Please run the SQL in supabase/schema.sql!');
            }
        } else {
            console.log('✅ Success! Database is connected and reachable.');
            console.log('Fetched data:', data);
        }
    } catch (err) {
        console.error('💥 An unexpected error occurred:', err.message);
    }
}

checkConnection();
