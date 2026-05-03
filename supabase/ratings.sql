-- Ratings Table & Average Rating Trigger

create table if not exists ratings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  listing_id uuid references listings not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, listing_id)
);

alter table ratings enable row level security;
drop policy if exists "Users can view all ratings" on ratings;
create policy "Users can view all ratings" on ratings for select using (true);
drop policy if exists "Users can insert their own ratings" on ratings;
create policy "Users can insert their own ratings" on ratings for insert with check (auth.uid() = user_id);
drop policy if exists "Users can update their own ratings" on ratings;
create policy "Users can update their own ratings" on ratings for update using (auth.uid() = user_id);

alter table listings add column if not exists average_rating numeric default 0;
alter table listings add column if not exists total_ratings integer default 0;

create or replace function update_listing_rating()
returns trigger as $$
declare
  avg_rating numeric;
  count_ratings integer;
begin
  select coalesce(avg(rating), 0), count(id) into avg_rating, count_ratings
  from ratings
  where listing_id = coalesce(new.listing_id, old.listing_id);

  update listings
  set average_rating = round(avg_rating, 1),
      total_ratings = count_ratings
  where id = coalesce(new.listing_id, old.listing_id);
  
  return coalesce(new, old);
end;
$$ language plpgsql security definer;

drop trigger if exists update_rating_trigger on ratings;
create trigger update_rating_trigger
after insert or update or delete on ratings
for each row execute function update_listing_rating();
