-- BETOCH DATABASE SEED SCRIPT
-- RUN THIS IN YOUR SUPABASE SQL EDITOR

-- 1. Create initial Pricing Plans
DELETE FROM pricing_plans; -- Clean start

INSERT INTO pricing_plans (name, price, duration_days, description, is_featured, active)
VALUES 
('Standard', 500, 30, 'Listing stays active for 30 days. Standard ranking in search results.', false, true),
('Premium', 1200, 60, 'Listing stays active for 60 days. Featured placement and higher ranking.', true, true),
('Infinite (Admin Only)', 0, 9999, 'Internal use for long-term partners or system listings.', false, true);

-- 2. Verify and Update RLS for testing (Optional but recommended for dev)
-- Uncomment if you want to allow anonymous reads for testing Browse Homes
-- ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow anyone to read published listings" ON listings FOR SELECT USING (status = 'published');

-- 3. (Optional) Example User Listing for testing split-pane messages
-- Note: Replace UUIDs with actual user IDs from your auth table if testing manually
-- INSERT INTO listings (title, description, price, location_city, status) 
-- VALUES ('Example Luxury Apartment', 'Beautiful 3-bedroom apartment in Bole.', 15000, 'Addis Ababa', 'published');
