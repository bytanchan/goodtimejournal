import { supabase } from './supabase';
import { getUserId } from './auth';

export type Entry = {
  name:        string;
  energy:      number;
  engagement:  number;   // was "engage" — matches DB column name
  flow:        boolean;
  note:        string;
  tod:         string;   // 'morning' | 'day' | 'night'
  entry_date:  string;   // YYYY-MM-DD (local date)
};

export async function insertEntry(entry: Entry) {
  if (!supabase) throw new Error('Supabase not configured');

  const user_id = await getUserId(); // throws if no session — correct: don't insert without auth
  const payload = { ...entry, user_id };

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

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
