
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Service role full access" ON public.students;

-- The service role key automatically bypasses RLS, so no extra policy needed.
-- The existing permissive policies for students viewing their own data are sufficient.
-- Admin access is handled by supabaseAdmin (service role key) which bypasses RLS entirely.
