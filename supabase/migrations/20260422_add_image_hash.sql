-- Add image_hash to poop_entries for duplicate-submission abuse check.
-- Stores the SHA-256 hex digest of the uploaded image (client-computed).

ALTER TABLE public.poop_entries
  ADD COLUMN IF NOT EXISTS image_hash TEXT;

CREATE INDEX IF NOT EXISTS poop_entries_user_hash_logged_idx
  ON public.poop_entries (user_id, image_hash, logged_at DESC)
  WHERE image_hash IS NOT NULL;
