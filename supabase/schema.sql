-- =============================================================================
-- Fitly — initial schema
-- Run this once in the Supabase SQL editor for a fresh project.
-- Idempotent where reasonable; drop-and-recreate policies if you iterate.
-- =============================================================================

-- Extensions -----------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums ----------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'item_category') then
    create type item_category as enum (
      'top', 'bottom', 'outerwear', 'dress', 'shoes', 'accessory', 'bag', 'other'
    );
  end if;
end$$;

-- Tables ---------------------------------------------------------------------

-- profiles: 1:1 with auth.users. App-level user data.
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  full_name    text,
  avatar_url   text,
  onboarded_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- user_preferences: style/context used by the recommender.
create table if not exists public.user_preferences (
  user_id          uuid primary key references auth.users(id) on delete cascade,
  style_tags       text[]  not null default '{}',
  favorite_colors  text[]  not null default '{}',
  disliked_colors  text[]  not null default '{}',
  sizing           jsonb   not null default '{}'::jsonb,
  climate          text,
  timezone         text,
  updated_at       timestamptz not null default now()
);

-- wardrobe_items: every piece of clothing the user owns.
-- image_path points into the `wardrobe` Storage bucket (never a public URL).
create table if not exists public.wardrobe_items (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  category    item_category not null,
  subcategory text,
  color       text,
  brand       text,
  material    text,
  season      text[] not null default '{}',
  tags        text[] not null default '{}',
  image_path  text,
  archived    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  brightness  text,
);

create index if not exists wardrobe_items_user_idx on public.wardrobe_items (user_id);
create index if not exists wardrobe_items_user_category_idx on public.wardrobe_items (user_id, category);

-- outfits: a named set of wardrobe items (user-curated or AI-generated).
create table if not exists public.outfits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text,
  occasion   text,
  created_at timestamptz not null default now()
);

create table if not exists public.outfit_items (
  outfit_id uuid not null references public.outfits(id) on delete cascade,
  item_id   uuid not null references public.wardrobe_items(id) on delete cascade,
  primary key (outfit_id, item_id)
);

-- recommendations: AI suggestions, optionally linked to a materialized outfit.
create table if not exists public.recommendations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  outfit_id     uuid references public.outfits(id) on delete set null,
  occasion      text,
  weather       jsonb,
  reason        text,
  score         numeric,
  feedback      text check (feedback in ('like', 'dislike')),
  scheduled_for date,
  created_at    timestamptz not null default now()
);

create index if not exists recommendations_user_date_idx
  on public.recommendations (user_id, scheduled_for desc);

-- Triggers -------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists preferences_updated_at on public.user_preferences;
create trigger preferences_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

drop trigger if exists wardrobe_items_updated_at on public.wardrobe_items;
create trigger wardrobe_items_updated_at
  before update on public.wardrobe_items
  for each row execute function public.set_updated_at();

-- Auto-provision profile + preferences row on signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row-Level Security ---------------------------------------------------------

alter table public.profiles         enable row level security;
alter table public.user_preferences enable row level security;
alter table public.wardrobe_items   enable row level security;
alter table public.outfits          enable row level security;
alter table public.outfit_items     enable row level security;
alter table public.recommendations  enable row level security;

drop policy if exists "own profile" on public.profiles;
create policy "own profile" on public.profiles
  for all to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own preferences" on public.user_preferences;
create policy "own preferences" on public.user_preferences
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own wardrobe" on public.wardrobe_items;
create policy "own wardrobe" on public.wardrobe_items
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own outfits" on public.outfits;
create policy "own outfits" on public.outfits
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own outfit items" on public.outfit_items;
create policy "own outfit items" on public.outfit_items
  for all to authenticated
  using (
    exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.outfits o where o.id = outfit_id and o.user_id = auth.uid())
  );

drop policy if exists "own recommendations" on public.recommendations;
create policy "own recommendations" on public.recommendations
  for all to authenticated
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Storage --------------------------------------------------------------------
-- Private bucket: all wardrobe photos. Use signed URLs from app code.
insert into storage.buckets (id, name, public)
values ('wardrobe', 'wardrobe', false)
on conflict (id) do nothing;

-- Users upload/read/update/delete ONLY inside their own folder:
--   wardrobe/<user_id>/<item_id>/<uuid>.<ext>

drop policy if exists "wardrobe upload own folder" on storage.objects;
create policy "wardrobe upload own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wardrobe'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wardrobe read own folder" on storage.objects;
create policy "wardrobe read own folder" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'wardrobe'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wardrobe update own folder" on storage.objects;
create policy "wardrobe update own folder" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'wardrobe'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "wardrobe delete own folder" on storage.objects;
create policy "wardrobe delete own folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'wardrobe'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
