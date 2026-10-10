// src/config/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fuprxmybcowlskspzpwv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_vYq-PC4dEdULdMi4OYYU1g_aUvykGdA';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL yoki Anon Key topilmadi. .env faylini tekshiring.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
