import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_API_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables. Available:', Object.keys(process.env).filter(k => k.includes('SUPABASE')).join(', '));
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});

export function getSupabaseServerClient(_request?: Request) {
  return supabase;
}

// Alias for compatibility
export const getSupabaseClient = getSupabaseServerClient;

// Admin client using service role key to bypass RLS
const serviceRoleKey = process.env.SB_SERVICE_ROLE_KEY || '';
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl || 'https://placeholder.supabase.co', serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : supabase; // fallback to anon client if no service role key

// Export createClient for use in services
export { createClient };
