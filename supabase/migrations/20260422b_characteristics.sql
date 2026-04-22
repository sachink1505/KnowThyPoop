-- Add poop characteristics + duration
alter table public.poop_entries
  add column if not exists poop_color text,
  add column if not exists poop_volume text,
  add column if not exists poop_composition text,
  add column if not exists duration_seconds integer;
