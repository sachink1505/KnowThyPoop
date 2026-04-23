-- Allow odour = 0 (maps to "none") in addition to 1-5
alter table public.poop_entries drop constraint if exists poop_entries_odour_check;
alter table public.poop_entries
  add constraint poop_entries_odour_check check (odour >= 0 and odour <= 5);
