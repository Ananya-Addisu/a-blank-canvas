
-- 1. Popup Notices table for targeted ads/notices
CREATE TABLE public.popup_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_year_level TEXT, -- null means all students
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_interval_hours INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.popup_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active popup_notices" ON public.popup_notices
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage popup_notices" ON public.popup_notices
  FOR ALL TO public USING (true) WITH CHECK (true);

-- 2. Track which students dismissed which notices
CREATE TABLE public.popup_notice_dismissals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id UUID NOT NULL REFERENCES public.popup_notices(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  dismissed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(notice_id, student_id)
);

ALTER TABLE public.popup_notice_dismissals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view popup_notice_dismissals" ON public.popup_notice_dismissals
  FOR SELECT TO public USING (true);

CREATE POLICY "Anyone can insert popup_notice_dismissals" ON public.popup_notice_dismissals
  FOR INSERT TO public WITH CHECK (true);

-- 3. Home categories table (admin-managed)
CREATE TABLE public.home_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.home_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view home_categories" ON public.home_categories
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage home_categories" ON public.home_categories
  FOR ALL TO public USING (true) WITH CHECK (true);

-- 4. Pinned items for "Top Courses" section
CREATE TABLE public.pinned_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('course', 'bundle')),
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(item_id, item_type)
);

ALTER TABLE public.pinned_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view pinned_items" ON public.pinned_items
  FOR SELECT TO public USING (true);

CREATE POLICY "Admins can manage pinned_items" ON public.pinned_items
  FOR ALL TO public USING (true) WITH CHECK (true);

-- 5. Link courses and bundles to categories
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS home_category_id UUID REFERENCES public.home_categories(id) ON DELETE SET NULL;
ALTER TABLE public.bundles ADD COLUMN IF NOT EXISTS home_category_id UUID REFERENCES public.home_categories(id) ON DELETE SET NULL;

-- 6. Seed default categories
INSERT INTO public.home_categories (name, display_order, is_system) VALUES
  ('Freshman', 0, true),
  ('Year 2', 1, true),
  ('Year 3', 2, true),
  ('Year 4', 3, true),
  ('Year 5', 4, true);
