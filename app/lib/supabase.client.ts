import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
const serviceRoleKey = import.meta.env.VITE_SB_SERVICE_ROLE_KEY || '';

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Alias for compatibility with services that used getSupabaseClient
export function getSupabaseClient() {
  return supabase;
}

// Admin client using service role key to bypass RLS for admin operations
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : supabase;
