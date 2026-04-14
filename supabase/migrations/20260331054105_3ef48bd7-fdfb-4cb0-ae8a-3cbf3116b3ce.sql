CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL,
  student_name text NOT NULL,
  content text NOT NULL,
  rating integer DEFAULT 5,
  status text NOT NULL DEFAULT 'pending',
  admin_edited_content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved testimonials" ON public.testimonials FOR SELECT USING (status = 'approved');
CREATE POLICY "Anyone can insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE USING (true);
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE USING (true);