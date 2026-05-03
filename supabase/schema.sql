-- Create a table for public profiles
create table profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  phone_number text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin', 'agent')),
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Listings Table
create type listing_status as enum ('draft', 'pending_payment', 'paid', 'published', 'expired', 'rejected', 'sold');
create type property_type as enum ('house', 'apartment', 'land', 'commercial');

create table listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  description text,
  price numeric not null,
  currency text default 'ETB',
  location_city text not null,
  location_neighborhood text,
  property_type property_type not null,
  bedrooms integer,
  bathrooms integer,
  sqft numeric,
  floor_number integer,
  is_furnished boolean default false,
  is_rent boolean default true,
  street_address text,
  nearby_places text,
  rules text,
  amenities jsonb default '{}'::jsonb, -- e.g. {"wifi": true, "parking": true}
  images text[] default '{}',
  video_url text,
  status listing_status default 'draft',
  featured boolean default false,
  views_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table listings enable row level security;

create policy "Listings are viewable by everyone if published." on listings
  for select using (status = 'published');

create policy "Users can see their own listings regardless of status." on listings
  for select using (auth.uid() = user_id);

create policy "Users can insert their own listings." on listings
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own listings." on listings
  for update using (auth.uid() = user_id);

-- Saved Listings (Favorites)
create table saved_listings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  listing_id uuid references listings not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, listing_id)
);

alter table saved_listings enable row level security;

create policy "Users can view their own saved listings." on saved_listings
  for select using (auth.uid() = user_id);

create policy "Users can save listings." on saved_listings
  for insert with check (auth.uid() = user_id);

create policy "Users can remove saved listings." on saved_listings
  for delete using (auth.uid() = user_id);

-- Pricing Plans
create table pricing_plans (
  id uuid default uuid_generate_v4() primary key,
  name text not null, -- 'Basic', 'Premium', 'Featured'
  price numeric not null,
  duration_days integer not null, -- 30, 60
  is_featured boolean default false,
  active boolean default true
);

alter table pricing_plans enable row level security;
create policy "Plans are viewable by everyone" on pricing_plans for select using (true);

-- Payments Table
create table payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  listing_id uuid references listings not null,
  plan_id uuid references pricing_plans,
  amount numeric not null,
  provider text not null, -- 'telebirr', 'paypal', etc.
  status text not null, -- 'pending', 'completed', 'failed'
  transaction_id text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table payments enable row level security;

create policy "Users can view their own payments." on payments
  for select using (auth.uid() = user_id);

-- Messages
create table messages (
  id uuid default uuid_generate_v4() primary key,
  sender_id uuid references auth.users not null,
  receiver_id uuid references auth.users not null,
  listing_id uuid references listings,
  content text not null,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table messages enable row level security;

create policy "Users can view their own messages" on messages
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users can send messages" on messages
  for insert with check (auth.uid() = sender_id);

-- Add Latitude/Longitude to Listings if not exists (using alter for safety in existing dev envs, or just definition here)
-- For this file which defines the schema, I will add them to the table definition directly if this was a fresh start, 
-- but since I am editing the file, I will append the changes.
alter table listings add column if not exists latitude numeric;
alter table listings add column if not exists longitude numeric;

-- Seed Pricing Plans
insert into pricing_plans (name, price, duration_days, is_featured, active) values
('Free Plan', 0, 7, false, true),
('Standard Plan', 500, 30, false, true),
('Premium Plan', 1500, 60, true, true)
on conflict do nothing; -- This is pseudo-code, as UUIDs are auto-gen. 
-- In a real migration we'd handle this differently. For now, we will assume this file is a reference.
-- Realistically, I cannot run this SQL against their DB unless there is a tool. 
-- I will assume the user applies this or I'm "documenting" the schema change.

