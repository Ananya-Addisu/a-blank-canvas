-- Add featured path flags to bundles table
ALTER TABLE public.bundles 
  ADD COLUMN IF NOT EXISTS is_featured_path boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured_path_exclusive boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_bundle_exclusive boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS featured_path_order integer NOT NULL DEFAULT 0;

-- Add show_featured_paths setting
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES ('show_featured_paths', 'true', 'Toggle visibility of the Featured Paths section on the home screen')
ON CONFLICT (setting_key) DO NOTHING;

-- Add testimonial image support
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Seed initial featured path bundles
INSERT INTO public.bundles (name, description, semester, year_level, price, is_featured_path, featured_path_order, is_active)
VALUES 
  ('Grade 12 Entrance (EUEE) Prep', 'Complete preparation for the Ethiopian University Entrance Exam', 'Full Year', 'Grade 12', 0, true, 1, true),
  ('Freshman Semester 1', 'All courses for your first semester at university', 'Semester 1', 'Freshman', 0, true, 2, true),
  ('Freshman Semester 2', 'All courses for your second semester at university', 'Semester 2', 'Freshman', 0, true, 3, true),
  ('Engineering Courses', 'Core engineering department courses', 'All', 'Engineering', 0, true, 4, true),
  ('Health Science Courses', 'Core health science department courses', 'All', 'Health Science', 0, true, 5, true),
  ('Natural Science Courses', 'Core natural science department courses', 'All', 'Natural Science', 0, true, 6, true),
  ('Social Science Courses', 'Core social science department courses', 'All', 'Social Science', 0, true, 7, true),
  ('Law Courses', 'Core law department courses', 'All', 'Law', 0, true, 8, true),
  ('Business & Economics', 'Core business and economics courses', 'All', 'Business', 0, true, 9, true),
  ('Technology & Computing', 'Computer science and IT courses', 'All', 'Technology', 0, true, 10, true)
ON CONFLICT DO NOTHING;