-- Good Time Journal — Supabase migration
-- Run this once in the Supabase SQL Editor (project dashboard → SQL Editor)

-- 1. Add entry_date column (stores the user-selected date, YYYY-MM-DD)
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS entry_date date;

-- Backfill from created_at for existing rows
UPDATE entries
  SET entry_date = created_at::date
  WHERE entry_date IS NULL;

-- 2. Add user_id column to scope entries per user
ALTER TABLE entries
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Enable Row Level Security
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies — users only see and write their own entries
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

-- 5. Index for fast per-user queries ordered by date
CREATE INDEX IF NOT EXISTS entries_user_date_idx ON entries (user_id, entry_date DESC);
