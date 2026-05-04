-- Good Time Journal — complete schema migration
-- Run once in Supabase SQL Editor (Dashboard → SQL Editor → Run)
-- Safe to re-run: uses IF NOT EXISTS / IF EXISTS / idempotent DO blocks.

-- ── 1. Create table (no-op if it already exists) ─────────────────────────────
CREATE TABLE IF NOT EXISTS entries (
  id          bigint generated always as identity primary key,
  user_id     uuid    references auth.users(id) on delete cascade,
  name        text    not null,
  energy      numeric not null,
  engagement  numeric not null,
  flow        boolean not null default false,
  note        text,
  entry_date  date,
  tod         text,   -- 'morning' | 'day' | 'night'
  created_at  timestamptz not null default now()
);

-- ── 2. Add any missing columns (for existing tables) ─────────────────────────
ALTER TABLE entries ADD COLUMN IF NOT EXISTS user_id    uuid REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS entry_date date;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS note       text;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS flow       boolean DEFAULT false;
ALTER TABLE entries ADD COLUMN IF NOT EXISTS tod        text;

-- ── 3. Rename engage → engagement (if old column name exists) ─────────────────
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'entries' AND column_name = 'engage'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'entries' AND column_name = 'engagement'
  ) THEN
    ALTER TABLE entries RENAME COLUMN engage TO engagement;
  END IF;
END $$;

-- If engagement column doesn't exist yet at all, add it
ALTER TABLE entries ADD COLUMN IF NOT EXISTS engagement numeric;

-- ── 4. Backfill entry_date from created_at for any rows missing it ────────────
UPDATE entries SET entry_date = created_at::date WHERE entry_date IS NULL;

-- ── 5. Enable Row Level Security ──────────────────────────────────────────────
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- ── 6. RLS policies ───────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "users select own entries" ON entries;
DROP POLICY IF EXISTS "users insert own entries" ON entries;
DROP POLICY IF EXISTS "users update own entries" ON entries;
DROP POLICY IF EXISTS "users delete own entries" ON entries;

CREATE POLICY "users select own entries" ON entries
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "users insert own entries" ON entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users update own entries" ON entries
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "users delete own entries" ON entries
  FOR DELETE USING (user_id = auth.uid());

-- ── 7. Index for fast per-user date queries ───────────────────────────────────
CREATE INDEX IF NOT EXISTS entries_user_date_idx ON entries (user_id, entry_date DESC);
