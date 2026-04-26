-- Migration: add profile onboarding fields (gender, skin_tone, body_shape, photos)
-- Run this against an existing database that already has the initial schema.

-- New enums
do $$
begin
  if not exists (select 1 from pg_type where typname = 'gender_type') then
    create type gender_type as enum ('male', 'female', 'prefer_not_to_say');
  end if;

  if not exists (select 1 from pg_type where typname = 'skin_tone') then
    create type skin_tone as enum (
      'very_light', 'light', 'medium', 'tan', 'brown', 'dark', 'very_dark'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'body_shape') then
    create type body_shape as enum (
      'slim', 'athletic', 'average', 'curvy', 'plus_size', 'broad', 'petite'
    );
  end if;
end$$;

-- New columns on profiles
alter table public.profiles
  add column if not exists gender          gender_type,
  add column if not exists skin_tone       skin_tone,
  add column if not exists body_shape      body_shape,
  add column if not exists face_photo_path text,
  add column if not exists body_photo_path text;

-- Profile photos storage bucket
insert into storage.buckets (id, name, public)
values ('profile-photos', 'profile-photos', false)
on conflict (id) do nothing;

drop policy if exists "profile photos upload own folder" on storage.objects;
create policy "profile photos upload own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile photos read own folder" on storage.objects;
create policy "profile photos read own folder" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile photos update own folder" on storage.objects;
create policy "profile photos update own folder" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "profile photos delete own folder" on storage.objects;
create policy "profile photos delete own folder" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'profile-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
