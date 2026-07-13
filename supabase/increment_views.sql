-- ─── INCREMENT LISTING VIEWS FUNCTION ───────────────────────────────────────
-- This database function increments a listing's views count, bypassing RLS.
-- Execute this script in your Supabase SQL editor.

CREATE OR REPLACE FUNCTION public.increment_listing_views(target_listing_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with high privileges to bypass RLS for non-owners
AS $$
BEGIN
  UPDATE public.listings
  SET views_count = COALESCE(views_count, 0) + 1
  WHERE id = target_listing_id;
END;
$$;
