-- Fix testimonials RLS so admins can view ALL testimonials (not just approved)
DROP POLICY IF EXISTS "Anyone can view approved testimonials" ON public.testimonials;

CREATE POLICY "Anyone can view all testimonials"
  ON public.testimonials FOR SELECT
  USING (true);