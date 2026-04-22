-- Add reminder time, avatar seed, and country code to profiles
alter table public.profiles
  add column if not exists reminder_time time,
  add column if not exists avatar_seed text,
  add column if not exists country_code text;
