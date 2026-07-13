-- ─── DAILY STATS TABLE & VISITOR TRACKING RPC ──────────────────────────────
-- This creates a database table to store daily visitor statistics and
-- a function to increment the visitor count for the current day.
-- Execute this script in your Supabase SQL editor.

CREATE TABLE IF NOT EXISTS public.daily_stats (
  date date PRIMARY KEY DEFAULT current_date,
  visitor_count integer DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- Allow select access to everyone
DROP POLICY IF EXISTS "daily_stats_select" ON public.daily_stats;
CREATE POLICY "daily_stats_select" ON public.daily_stats FOR SELECT USING (true);

-- RPC Function to safely increment daily visitor count
CREATE OR REPLACE FUNCTION public.increment_daily_visitors()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Bypasses RLS to allow any website landing session to increment
AS $$
BEGIN
  INSERT INTO public.daily_stats (date, visitor_count)
  VALUES (current_date, 1)
  ON CONFLICT (date)
  DO UPDATE SET visitor_count = public.daily_stats.visitor_count + 1;
END;
$$;
