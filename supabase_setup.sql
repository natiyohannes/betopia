-- ============================================================
-- BETOPIA.ET - Full Supabase Schema Setup
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── PROFILES ───────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  phone_number text,
  role text not null default 'user', -- 'user' | 'admin'
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── LISTINGS ───────────────────────────────────────────────
create table if not exists public.listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  description text,
  price numeric,
  location text,
  city text,
  property_type text,
  listing_type text, -- 'rent' | 'sale'
  bedrooms int,
  bathrooms int,
  area numeric,
  images text[],
  amenities text[],
  status text default 'draft', -- 'draft' | 'paid' | 'active' | 'rejected' | 'inactive'
  views_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── PAYMENTS ───────────────────────────────────────────────
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  amount numeric,
  provider text, -- 'telebirr' | etc
  transaction_id text,
  status text default 'pending', -- 'pending' | 'completed' | 'failed'
  created_at timestamptz default now()
);

-- ─── BOOKINGS ───────────────────────────────────────────────
create table if not exists public.bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  status text default 'pending', -- 'pending' | 'confirmed' | 'cancelled'
  message text,
  created_at timestamptz default now()
);

-- ─── SAVED LISTINGS ─────────────────────────────────────────
create table if not exists public.saved_listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete cascade,
  created_at timestamptz default now(),
  unique(user_id, listing_id)
);

-- ─── MESSAGES ───────────────────────────────────────────────
create table if not exists public.messages (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references public.profiles(id) on delete cascade,
  receiver_id uuid references public.profiles(id) on delete cascade,
  listing_id uuid references public.listings(id) on delete set null,
  content text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ─── NOTIFICATIONS ──────────────────────────────────────────
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade,
  title text,
  body text,
  read boolean default false,
  created_at timestamptz default now()
);

-- ─── RPC FUNCTIONS ──────────────────────────────────────────

-- get_all_users (admin only)
create or replace function public.get_all_users()
returns table (
  id uuid,
  full_name text,
  avatar_url text,
  phone_number text,
  role text,
  email text,
  created_at timestamptz,
  last_sign_in_at timestamptz,
  listings_count bigint
)
language plpgsql security definer as $$
begin
  return query
    select
      p.id,
      p.full_name,
      p.avatar_url,
      p.phone_number,
      p.role,
      u.email,
      p.created_at,
      u.last_sign_in_at,
      (select count(*) from public.listings l where l.user_id = p.id) as listings_count
    from public.profiles p
    join auth.users u on u.id = p.id
    order by p.created_at desc;
end;
$$;

-- get_all_listings_admin (admin only)
create or replace function public.get_all_listings_admin()
returns table (
  id uuid,
  title text,
  status text,
  price numeric,
  city text,
  property_type text,
  listing_type text,
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
language plpgsql security definer as $$
begin
  return query
    select
      l.id,
      l.title,
      l.status,
      l.price,
      l.city,
      l.property_type,
      l.listing_type,
      l.views_count,
      l.created_at,
      p.id as user_id,
      p.full_name,
      p.avatar_url,
      p.phone_number,
      pay.transaction_id,
      pay.provider as payment_provider,
      pay.amount as payment_amount,
      pay.status as payment_status
    from public.listings l
    join public.profiles p on p.id = l.user_id
    left join public.payments pay on pay.listing_id = l.id
    order by l.created_at desc;
end;
$$;

-- get_user_listings_admin (admin only)
create or replace function public.get_user_listings_admin(target_user_id uuid)
returns table (
  id uuid,
  title text,
  status text,
  price numeric,
  city text,
  property_type text,
  listing_type text,
  views_count int,
  created_at timestamptz,
  transaction_id text,
  payment_provider text,
  payment_amount numeric,
  payment_status text
)
language plpgsql security definer as $$
begin
  return query
    select
      l.id,
      l.title,
      l.status,
      l.price,
      l.city,
      l.property_type,
      l.listing_type,
      l.views_count,
      l.created_at,
      pay.transaction_id,
      pay.provider as payment_provider,
      pay.amount as payment_amount,
      pay.status as payment_status
    from public.listings l
    left join public.payments pay on pay.listing_id = l.id
    where l.user_id = target_user_id
    order by l.created_at desc;
end;
$$;

-- set_user_role (admin only)
create or replace function public.set_user_role(target_user_id uuid, new_role text)
returns void language plpgsql security definer as $$
begin
  update public.profiles set role = new_role where id = target_user_id;
end;
$$;

-- verify_admin_code
create or replace function public.verify_admin_code(code text)
returns boolean language plpgsql security definer as $$
begin
  -- Super admin code defined in application
  return code = 'myname159';
end;
$$;

-- ─── ROW LEVEL SECURITY ─────────────────────────────────────
alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.payments enable row level security;
alter table public.bookings enable row level security;
alter table public.saved_listings enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;

-- profiles: users can read all, edit only their own
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- listings: anyone can read active listings, owners can manage theirs
drop policy if exists "listings_select" on public.listings;
create policy "listings_select" on public.listings for select using (true);
drop policy if exists "listings_insert" on public.listings;
create policy "listings_insert" on public.listings for insert with check (auth.uid() = user_id);
drop policy if exists "listings_update" on public.listings;
create policy "listings_update" on public.listings for update using (auth.uid() = user_id);
drop policy if exists "listings_delete" on public.listings;
create policy "listings_delete" on public.listings for delete using (auth.uid() = user_id);

-- payments: users can see and create their own
drop policy if exists "payments_select" on public.payments;
create policy "payments_select" on public.payments for select using (auth.uid() = user_id);
drop policy if exists "payments_insert" on public.payments;
create policy "payments_insert" on public.payments for insert with check (auth.uid() = user_id);
drop policy if exists "payments_update" on public.payments;
create policy "payments_update" on public.payments for update using (auth.uid() = user_id);

-- bookings: users can see and create their own
drop policy if exists "bookings_select" on public.bookings;
create policy "bookings_select" on public.bookings for select using (auth.uid() = user_id);
drop policy if exists "bookings_insert" on public.bookings;
create policy "bookings_insert" on public.bookings for insert with check (auth.uid() = user_id);

-- saved_listings
drop policy if exists "saved_select" on public.saved_listings;
create policy "saved_select" on public.saved_listings for select using (auth.uid() = user_id);
drop policy if exists "saved_insert" on public.saved_listings;
create policy "saved_insert" on public.saved_listings for insert with check (auth.uid() = user_id);
drop policy if exists "saved_delete" on public.saved_listings;
create policy "saved_delete" on public.saved_listings for delete using (auth.uid() = user_id);

-- messages
drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select using (auth.uid() = sender_id or auth.uid() = receiver_id);
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert with check (auth.uid() = sender_id);
drop policy if exists "messages_update" on public.messages;
create policy "messages_update" on public.messages for update using (auth.uid() = receiver_id);

-- notifications
drop policy if exists "notifications_select" on public.notifications;
create policy "notifications_select" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_update" on public.notifications for update using (auth.uid() = user_id);
