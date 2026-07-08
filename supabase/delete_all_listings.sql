-- ─── DELETE ALL LISTINGS AND RELATED DATA ─────────────────────────────────────
-- This will delete every listing in the database along with all related data
-- (payments, messages, saved_listings, notifications tied to listings)

-- 1. Delete all notifications linked to listings
DELETE FROM public.notifications
WHERE listing_id IS NOT NULL;

-- 2. Delete all messages linked to listings
DELETE FROM public.messages
WHERE listing_id IS NOT NULL;

-- 3. Delete all saved listings
DELETE FROM public.saved_listings;

-- 4. Delete all payments linked to listings
DELETE FROM public.payments;

-- 5. Delete all listings
DELETE FROM public.listings;

-- Verify
SELECT COUNT(*) AS remaining_listings FROM public.listings;
