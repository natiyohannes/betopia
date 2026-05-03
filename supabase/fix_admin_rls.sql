-- RUN THIS IN YOUR SUPABASE SQL EDITOR TO FIX THE ADMIN PANEL
-- This will allow users with the 'admin' role to see all listings regardless of status.

-- 1. Create a policy for Admins to view all listings
CREATE POLICY "Admins can view all listings" 
ON public.listings 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- 2. Create a secure RPC function to fetch all listings (Alternative if RLS is tricky)
CREATE OR REPLACE FUNCTION get_all_listings_admin()
RETURNS TABLE (
    id uuid,
    user_id uuid,
    title text,
    status public.listing_status,
    price numeric,
    location_city text,
    created_at timestamptz,
    images text[],
    property_type public.property_type,
    full_name text,
    email text,
    phone_number text
) 
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS
AS $$
BEGIN
  -- Security Check: Ensure only admins can call this
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can fetch global listings.';
  END IF;

  RETURN QUERY 
  SELECT 
    l.id, 
    l.user_id, 
    l.title, 
    l.status, 
    l.price, 
    l.location_city, 
    l.created_at, 
    l.images, 
    l.property_type,
    p.full_name,
    p.email,
    p.phone_number
  FROM listings l
  LEFT JOIN profiles p ON l.user_id = p.id
  ORDER BY l.created_at DESC;
END;
$$;
