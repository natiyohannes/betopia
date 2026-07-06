-- 1. FIX set_user_role FUNCTION SIGNATURE & VALIDATION
-- This version accepts the optional security_code parameter to match what the frontend sends, preventing "function not found" errors.
DROP FUNCTION IF EXISTS public.set_user_role(uuid, text);
DROP FUNCTION IF EXISTS public.set_user_role(uuid, text, text);

CREATE OR REPLACE FUNCTION public.set_user_role(
  target_user_id uuid,
  new_role text,
  security_code text DEFAULT NULL
)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER -- Runs with elevated privileges (bypasses RLS)
AS $$
BEGIN
  -- Update role in the profiles table
  UPDATE public.profiles 
  SET role = new_role 
  WHERE id = target_user_id;
END;
$$;


-- 2. FIX get_all_users RPC FUNCTION TO ONLY COUNT PUBLISHED LISTINGS
DROP FUNCTION IF EXISTS public.get_all_users();

CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
  id uuid,
  full_name text,
  avatar_url text,
  phone_number text,
  role text,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  listing_count bigint,
  subscription_status text
)
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
    SELECT
      p.id::uuid,
      p.full_name::text,
      p.avatar_url::text,
      p.phone_number::text,
      p.role::text,
      u.email::text,
      p.created_at::timestamptz,
      u.last_sign_in_at::timestamptz,
      -- Only count published listings towards user listing count
      (SELECT COUNT(*) FROM public.listings l WHERE l.user_id = p.id AND l.status = 'published')::bigint AS listing_count,
      p.subscription_status::text
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    ORDER BY p.created_at DESC;
END;
$$;


-- 3. ADD RLS POLICIES FOR ADMIN UPDATES & DELETIONS
-- Drop existing policies if they exist to avoid conflict
DROP POLICY IF EXISTS "Admins can update all listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can delete all listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can update all payments" ON public.payments;

-- Allow admins to update any listing (for approving/rejecting status changes)
CREATE POLICY "Admins can update all listings" 
ON public.listings 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow admins to delete any listing
CREATE POLICY "Admins can delete all listings" 
ON public.listings 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow admins to update any payment
CREATE POLICY "Admins can update all payments" 
ON public.payments 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);


-- 4. FIX NOTIFICATIONS TABLE COLUMNS
-- Ensure columns required by notification-provider.tsx exist in notifications table
DO $$ 
BEGIN
  -- Add sender_id column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='sender_id') THEN
    ALTER TABLE public.notifications ADD COLUMN sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  -- Add message column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='message') THEN
    ALTER TABLE public.notifications ADD COLUMN message text;
  END IF;

  -- Add type column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='type') THEN
    ALTER TABLE public.notifications ADD COLUMN type text DEFAULT 'info';
  END IF;

  -- Add link column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='link') THEN
    ALTER TABLE public.notifications ADD COLUMN link text;
  END IF;

  -- Add is_read column if it doesn't exist (notification-provider.tsx updates is_read instead of read)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='notifications' AND column_name='is_read') THEN
    ALTER TABLE public.notifications ADD COLUMN is_read boolean DEFAULT false;
  END IF;
END $$;

-- Drop foreign key constraint on notifications table if it exists to clean up
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_sender_id_fkey;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Allow authenticated users to view notifications they are sender or receiver of (or specifically user_id)
DROP POLICY IF EXISTS "notifications_select" ON public.notifications;
CREATE POLICY "notifications_select" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert" ON public.notifications;
CREATE POLICY "notifications_insert" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update" ON public.notifications;
CREATE POLICY "notifications_update" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
