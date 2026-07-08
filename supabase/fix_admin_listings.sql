-- FIX ADMIN LISTINGS TO HIDE REJECTED PAYMENTS
-- Modify the RPC functions to filter out rejected listings

DROP FUNCTION IF EXISTS public.get_all_listings_admin();
CREATE OR REPLACE FUNCTION public.get_all_listings_admin()
RETURNS TABLE (
  id uuid,
  title text,
  status text,
  price numeric,
  location_city text,
  property_type text,
  is_rent boolean,
  views_count int,
  created_at timestamptz,
  user_id uuid,
  full_name text,
  avatar_url text,
  phone_number text,
  transaction_id text,
  payment_provider text,
  payment_amount numeric,
  payment_status text
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
    SELECT
      l.id::uuid,
      l.title::text,
      l.status::text,
      l.price::numeric,
      l.location_city::text,
      l.property_type::text,
      l.is_rent::boolean,
      l.views_count::int,
      l.created_at::timestamptz,
      p.id::uuid AS user_id,
      p.full_name::text,
      p.avatar_url::text,
      p.phone_number::text,
      pay.transaction_id::text,
      pay.provider::text AS payment_provider,
      pay.amount::numeric AS payment_amount,
      pay.status::text AS payment_status
    FROM public.listings l
    JOIN public.profiles p ON p.id = l.user_id
    LEFT JOIN public.payments pay ON pay.listing_id = l.id
    WHERE l.status != 'rejected'
    ORDER BY l.created_at DESC;
END;
$$;

DROP FUNCTION IF EXISTS public.get_user_listings_admin(uuid);
CREATE OR REPLACE FUNCTION public.get_user_listings_admin(target_user_id uuid)
RETURNS TABLE (
  id uuid,
  title text,
  status text,
  price numeric,
  location_city text,
  property_type text,
  is_rent boolean,
  views_count int,
  created_at timestamptz,
  transaction_id text,
  payment_provider text,
  payment_amount numeric,
  payment_status text
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
    SELECT
      l.id::uuid,
      l.title::text,
      l.status::text,
      l.price::numeric,
      l.location_city::text,
      l.property_type::text,
      l.is_rent::boolean,
      l.views_count::int,
      l.created_at::timestamptz,
      pay.transaction_id::text,
      pay.provider::text AS payment_provider,
      pay.amount::numeric AS payment_amount,
      pay.status::text AS payment_status
    FROM public.listings l
    LEFT JOIN public.payments pay ON pay.listing_id = l.id
    WHERE l.user_id = target_user_id AND l.status != 'rejected'
    ORDER BY l.created_at DESC;
END;
$$;
