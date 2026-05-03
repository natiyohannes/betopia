const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://lyzjtjawcqwotnajwrrr.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5emp0amF3Y3F3b3RuYWp3cnJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjExMTAsImV4cCI6MjA5MDMzNzExMH0.NT9pt-kA4GsZlxPWRf4u8OZbrVRHmSCWciuQTfHFob0');

async function check() {
    const { data, error } = await supabase.from('listings').select('id, title, status, user_id');
    if (error) console.error(error);
    else console.log('Total listings:', data.length, data);
}
check();
