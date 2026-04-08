import { supabase } from './supabase';
import { getUserId } from './auth';

export type Entry = {
  name: string;
  energy: number;
  engage: number;
  flow: boolean;
  note: string;
  day: number;
  tod: string;
  entry_date?: string; // ISO date YYYY-MM-DD — added via migration; falls back to created_at
};

export async function insertEntry(entry: Entry) {
  if (!supabase) throw new Error('Supabase not configured');
  // user_id — only include after migration adds the column
  let user_id: string | null = null;
  try { user_id = await getUserId(); } catch { /* pre-migration, no auth */ }

  // Strip fields that may not exist yet in the DB schema
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = { ...entry };
  if (user_id) payload.user_id = user_id;

  const { data, error } = await supabase
    .from('entries')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateEntry(id: number, fields: Partial<Entry>) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('entries')
    .update(fields)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getEntries() {
  if (!supabase) throw new Error('Supabase not configured');
  // RLS on the entries table automatically filters to the current user's rows.
  // Required Supabase SQL (run once in SQL editor):
  //
  //   alter table entries add column if not exists user_id uuid references auth.users(id);
  //   alter table entries enable row level security;
  //   create policy "users see own entries" on entries for select using (user_id = auth.uid());
  //   create policy "users insert own entries" on entries for insert with check (user_id = auth.uid());
  //   create policy "users update own entries" on entries for update using (user_id = auth.uid());
  //   create policy "users delete own entries" on entries for delete using (user_id = auth.uid());
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
