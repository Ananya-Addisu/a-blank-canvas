-- ============================================================
-- MAGSTER DATABASE SCHEMA - Full Recreation
-- Run this on a fresh Supabase project
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE public.admins (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  pin_hash text NOT NULL,
  role text DEFAULT 'admin'::text,
  is_active boolean DEFAULT true,
  profile_picture text,
  profile_picture_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.home_categories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.students (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  pin_hash text NOT NULL,
  email text,
  academic_year text,
  gender text,
  stream text,
  institution text,
  is_approved boolean DEFAULT false,
  is_active boolean DEFAULT true,
  profile_picture text,
  profile_picture_url text,
  hide_how_to_use_tooltip boolean DEFAULT false,
  last_logout_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.teachers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  phone_number text NOT NULL,
  email text NOT NULL,
  pin_hash text NOT NULL,
  specialization text,
  experience text,
  bio text,
  credentials_url text,
  intro_video_url text,
  is_approved boolean DEFAULT false,
  is_active boolean DEFAULT true,
  profile_picture text,
  profile_picture_url text,
  last_logout_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  department text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  teacher_id uuid REFERENCES public.teachers(id),
  thumbnail_url text,
  status text DEFAULT 'active'::text,
  sample_video_url text,
  sample_pdf_url text,
  syllabus text,
  discount_percentage integer DEFAULT 0,
  is_bundle_exclusive boolean DEFAULT false,
  display_order integer DEFAULT 0,
  home_category_id uuid REFERENCES public.home_categories(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.bundles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  semester text NOT NULL,
  year_level text NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  discount_percentage integer DEFAULT 0,
  thumbnail_url text,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  home_category_id uuid REFERENCES public.home_categories(id),
  is_featured_path boolean NOT NULL DEFAULT false,
  is_bundle_exclusive boolean NOT NULL DEFAULT false,
  is_featured_path_exclusive boolean NOT NULL DEFAULT false,
  featured_path_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.bundle_courses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id uuid NOT NULL REFERENCES public.bundles(id),
  course_id uuid NOT NULL REFERENCES public.courses(id),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.chapters (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id uuid NOT NULL REFERENCES public.courses(id),
  title text NOT NULL,
  description text,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.lessons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id uuid NOT NULL REFERENCES public.chapters(id),
  title text NOT NULL,
  description text,
  lesson_type text NOT NULL,
  content_url text,
  duration integer,
  page_count integer,
  order_index integer NOT NULL DEFAULT 0,
  is_published boolean DEFAULT false,
  is_preview boolean DEFAULT false,
  is_downloadable boolean DEFAULT false,
  download_url text,
  youtube_url text,
  video_source text DEFAULT 'upload'::text,
  approval_status text DEFAULT 'pending'::text,
  approved_by uuid REFERENCES public.admins(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  course_id uuid REFERENCES public.courses(id),
  bundle_id uuid REFERENCES public.bundles(id),
  enrollment_type text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  payment_amount numeric NOT NULL,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.payment_methods (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method_name text NOT NULL,
  account_name text NOT NULL,
  account_number text NOT NULL,
  bank_name text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.payment_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id),
  student_id uuid NOT NULL REFERENCES public.students(id),
  payment_method text NOT NULL,
  amount numeric NOT NULL,
  screenshot_urls text[] NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  admin_notes text,
  submitted_at timestamptz DEFAULT now(),
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES public.admins(id)
);

CREATE TABLE public.lesson_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL REFERENCES public.students(id),
  enrollment_id uuid NOT NULL REFERENCES public.enrollments(id),
  lesson_id uuid NOT NULL REFERENCES public.lessons(id),
  status text NOT NULL DEFAULT 'not_started'::text,
  progress_percentage integer DEFAULT 0,
  last_position integer DEFAULT 0,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.competitions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  duration integer NOT NULL,
  max_participants integer NOT NULL,
  registered_count integer DEFAULT 0,
  status text DEFAULT 'upcoming'::text,
  is_published boolean DEFAULT false,
  is_finished boolean DEFAULT false,
  gated_course_id uuid REFERENCES public.courses(id),
  gated_bundle_id uuid REFERENCES public.bundles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.competition_participants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid NOT NULL REFERENCES public.competitions(id),
  student_id uuid NOT NULL REFERENCES public.students(id),
  status text NOT NULL DEFAULT 'registered'::text,
  score numeric,
  rank integer,
  registered_at timestamptz DEFAULT now()
);

CREATE TABLE public.competition_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid REFERENCES public.competitions(id),
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice'::text,
  options jsonb,
  correct_answer text NOT NULL,
  explanation text,
  points integer DEFAULT 1,
  order_index integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.student_competitions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id uuid NOT NULL REFERENCES public.competitions(id),
  student_id uuid NOT NULL REFERENCES public.students(id),
  status text DEFAULT 'in_progress'::text,
  score integer DEFAULT 0,
  start_time timestamptz DEFAULT now(),
  end_time timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.library_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT 'Book'::text,
  item_count integer DEFAULT 0,
  status text DEFAULT 'active'::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.library_content (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES public.library_items(id),
  course_id uuid REFERENCES public.courses(id),
  title text NOT NULL,
  description text,
  subject text NOT NULL,
  content_type text NOT NULL,
  file_url text DEFAULT ''::text,
  thumbnail_url text,
  author text,
  requires_enrollment boolean DEFAULT false,
  download_count integer DEFAULT 0,
  duration integer,
  page_count integer,
  file_size bigint,
  content_markdown text,
  video_source text DEFAULT 'upload'::text,
  youtube_url text,
  approval_status text DEFAULT 'approved'::text,
  approved_by uuid REFERENCES public.admins(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.quizzes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  course_id uuid REFERENCES public.courses(id),
  teacher_id uuid NOT NULL REFERENCES public.teachers(id),
  duration integer,
  passing_score integer DEFAULT 70,
  status text NOT NULL DEFAULT 'draft'::text,
  feedback_mode text NOT NULL DEFAULT 'after_submit'::text,
  video_url text,
  content_markdown text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.quiz_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id),
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'multiple_choice'::text,
  options jsonb,
  correct_answer text NOT NULL,
  explanation text,
  points integer DEFAULT 1,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.quiz_attempts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid NOT NULL REFERENCES public.quizzes(id),
  student_id uuid NOT NULL REFERENCES public.students(id),
  status text NOT NULL DEFAULT 'in_progress'::text,
  answers jsonb,
  score numeric,
  total_points integer,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_type text NOT NULL CHECK (user_type = ANY (ARRAY['student'::text, 'teacher'::text, 'admin'::text])),
  type text NOT NULL CHECK (type = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'error'::text, 'payment'::text])),
  title text NOT NULL,
  message text NOT NULL,
  action_url text,
  is_read boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id uuid NOT NULL,
  student_name text NOT NULL,
  content text NOT NULL,
  rating integer DEFAULT 5,
  admin_edited_content text,
  status text NOT NULL DEFAULT 'pending'::text,
  image_urls text[] DEFAULT '{}'::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.device_bindings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_type text NOT NULL,
  device_model text NOT NULL,
  device_os text NOT NULL,
  device_version text NOT NULL,
  device_fingerprint text NOT NULL,
  is_active boolean DEFAULT true,
  bound_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.trusted_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_type text NOT NULL,
  device_token_hash text NOT NULL,
  device_name text,
  user_agent text,
  hardware_id text,
  revoked boolean NOT NULL DEFAULT false,
  last_seen timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.teacher_earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id uuid NOT NULL REFERENCES public.teachers(id),
  enrollment_id uuid REFERENCES public.enrollments(id),
  amount numeric NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  notes text,
  paid_at timestamptz,
  withdrawal_request_date timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE public.pinned_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_type text NOT NULL,
  item_id uuid NOT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.popup_notices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  image_url text NOT NULL,
  target_year_level text,
  is_active boolean NOT NULL DEFAULT true,
  display_interval_hours integer NOT NULL DEFAULT 8,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  link_type text DEFAULT NULL,
  link_id uuid DEFAULT NULL,
  button_text text DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.popup_notice_dismissals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id uuid NOT NULL REFERENCES public.popup_notices(id),
  student_id uuid NOT NULL,
  dismissed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tutorial_videos (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration integer,
  target_audience text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  uploaded_by uuid,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_downloads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_type text NOT NULL,
  content_id uuid NOT NULL,
  content_type text NOT NULL,
  file_path text NOT NULL,
  file_size bigint NOT NULL,
  encrypted boolean DEFAULT true,
  is_deleted boolean DEFAULT false,
  downloaded_at timestamptz DEFAULT now(),
  last_accessed timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.home_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bundle_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pinned_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.popup_notice_dismissals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS POLICIES
-- ============================================================

-- admins
CREATE POLICY "Admins can view all admin data" ON public.admins FOR SELECT TO public USING (true);

-- app_settings
CREATE POLICY "Anyone can view app_settings" ON public.app_settings FOR SELECT TO public USING (true);
CREATE POLICY "Admins can insert app_settings" ON public.app_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can update app_settings" ON public.app_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

-- home_categories
CREATE POLICY "Anyone can view home_categories" ON public.home_categories FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage home_categories" ON public.home_categories FOR ALL TO public USING (true) WITH CHECK (true);

-- students
CREATE POLICY "Allow insert on students" ON public.students FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Students can view own data" ON public.students FOR SELECT TO public USING (id = (current_setting('app.current_user_id'::text, true))::uuid);
CREATE POLICY "Students can update own data" ON public.students FOR UPDATE TO public USING (id = (current_setting('app.current_user_id'::text, true))::uuid);
CREATE POLICY "Allow delete on students" ON public.students FOR DELETE TO public USING (true);

-- teachers
CREATE POLICY "Teachers can view own data" ON public.teachers FOR SELECT TO public USING (id = (current_setting('app.current_user_id'::text, true))::uuid);
CREATE POLICY "Teachers can update own data" ON public.teachers FOR UPDATE TO public USING (id = (current_setting('app.current_user_id'::text, true))::uuid);

-- courses
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on courses" ON public.courses FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on courses" ON public.courses FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on courses" ON public.courses FOR DELETE TO public USING (true);

-- bundles
CREATE POLICY "Anyone can view active bundles" ON public.bundles FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage bundles" ON public.bundles FOR ALL TO public USING (true);

-- bundle_courses
CREATE POLICY "Anyone can view bundle courses" ON public.bundle_courses FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage bundle courses" ON public.bundle_courses FOR ALL TO public USING (true);

-- chapters
CREATE POLICY "Anyone can view chapters" ON public.chapters FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on chapters" ON public.chapters FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on chapters" ON public.chapters FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on chapters" ON public.chapters FOR DELETE TO public USING (true);

-- lessons
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on lessons" ON public.lessons FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on lessons" ON public.lessons FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on lessons" ON public.lessons FOR DELETE TO public USING (true);

-- enrollments
CREATE POLICY "Admins can view all enrollments" ON public.enrollments FOR SELECT TO public USING (true);
CREATE POLICY "Students can view own enrollments" ON public.enrollments FOR SELECT TO public USING (student_id = auth.uid());
CREATE POLICY "Allow enrollment creation" ON public.enrollments FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can update enrollments" ON public.enrollments FOR UPDATE TO public USING (true);

-- payment_methods
CREATE POLICY "Anyone can view active payment methods" ON public.payment_methods FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admins can manage payment methods" ON public.payment_methods FOR ALL TO public USING (true);

-- payment_submissions
CREATE POLICY "Admins can view all submissions" ON public.payment_submissions FOR SELECT TO public USING (true);
CREATE POLICY "Students can view own submissions" ON public.payment_submissions FOR SELECT TO public USING (student_id = auth.uid());
CREATE POLICY "Allow anyone to insert payment submissions" ON public.payment_submissions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can update submissions" ON public.payment_submissions FOR UPDATE TO public USING (true);

-- lesson_progress
CREATE POLICY "Anyone can view lesson_progress" ON public.lesson_progress FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert lesson_progress" ON public.lesson_progress FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update lesson_progress" ON public.lesson_progress FOR UPDATE TO public USING (true);

-- competitions
CREATE POLICY "Anyone can view competitions" ON public.competitions FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on competitions" ON public.competitions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on competitions" ON public.competitions FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on competitions" ON public.competitions FOR DELETE TO public USING (true);

-- competition_participants
CREATE POLICY "Anyone can view competition_participants" ON public.competition_participants FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert competition_participants" ON public.competition_participants FOR INSERT TO public WITH CHECK (true);

-- competition_questions
CREATE POLICY "Anyone can view competition_questions" ON public.competition_questions FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on competition_questions" ON public.competition_questions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on competition_questions" ON public.competition_questions FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on competition_questions" ON public.competition_questions FOR DELETE TO public USING (true);

-- student_competitions
CREATE POLICY "Anyone can view student_competitions" ON public.student_competitions FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert student_competitions" ON public.student_competitions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update student_competitions" ON public.student_competitions FOR UPDATE TO public USING (true);

-- library_items
CREATE POLICY "Anyone can view library_items" ON public.library_items FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on library_items" ON public.library_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on library_items" ON public.library_items FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on library_items" ON public.library_items FOR DELETE TO public USING (true);

-- library_content
CREATE POLICY "Anyone can view library_content" ON public.library_content FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on library_content" ON public.library_content FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on library_content" ON public.library_content FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on library_content" ON public.library_content FOR DELETE TO public USING (true);

-- quizzes
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT TO public USING (true);
CREATE POLICY "Teachers can insert quizzes" ON public.quizzes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Teachers can update own quizzes" ON public.quizzes FOR UPDATE TO public USING (true);
CREATE POLICY "Teachers can delete own quizzes" ON public.quizzes FOR DELETE TO public USING (true);

-- quiz_questions
CREATE POLICY "Anyone can view quiz_questions" ON public.quiz_questions FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert quiz_questions" ON public.quiz_questions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update quiz_questions" ON public.quiz_questions FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete quiz_questions" ON public.quiz_questions FOR DELETE TO public USING (true);

-- quiz_attempts
CREATE POLICY "Anyone can view quiz_attempts" ON public.quiz_attempts FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert quiz_attempts" ON public.quiz_attempts FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update quiz_attempts" ON public.quiz_attempts FOR UPDATE TO public USING (true);

-- notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications FOR SELECT TO public
  USING (
    ((user_type = 'student') AND (user_id IN (SELECT s.id FROM students s WHERE s.id = auth.uid())))
    OR ((user_type = 'teacher') AND (user_id IN (SELECT t.id FROM teachers t WHERE t.id = auth.uid())))
    OR ((user_type = 'admin') AND (user_id IN (SELECT a.id FROM admins a WHERE a.id = auth.uid())))
  );
CREATE POLICY "Users can update their own notifications" ON public.notifications FOR UPDATE TO public
  USING (
    ((user_type = 'student') AND (user_id IN (SELECT s.id FROM students s WHERE s.id = auth.uid())))
    OR ((user_type = 'teacher') AND (user_id IN (SELECT t.id FROM teachers t WHERE t.id = auth.uid())))
    OR ((user_type = 'admin') AND (user_id IN (SELECT a.id FROM admins a WHERE a.id = auth.uid())))
  );
CREATE POLICY "Users can delete their own notifications" ON public.notifications FOR DELETE TO public
  USING (
    ((user_type = 'student') AND (user_id IN (SELECT s.id FROM students s WHERE s.id = auth.uid())))
    OR ((user_type = 'teacher') AND (user_id IN (SELECT t.id FROM teachers t WHERE t.id = auth.uid())))
    OR ((user_type = 'admin') AND (user_id IN (SELECT a.id FROM admins a WHERE a.id = auth.uid())))
  );
CREATE POLICY "Admins can create notifications for anyone" ON public.notifications FOR INSERT TO public
  WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

-- testimonials
CREATE POLICY "Anyone can view all testimonials" ON public.testimonials FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert testimonials" ON public.testimonials FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admins can update testimonials" ON public.testimonials FOR UPDATE TO public USING (true);
CREATE POLICY "Admins can delete testimonials" ON public.testimonials FOR DELETE TO public USING (true);

-- trusted_devices
CREATE POLICY "Allow select on trusted_devices" ON public.trusted_devices FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on trusted_devices" ON public.trusted_devices FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on trusted_devices" ON public.trusted_devices FOR UPDATE TO public USING (true);

-- teacher_earnings
CREATE POLICY "Anyone can view teacher_earnings" ON public.teacher_earnings FOR SELECT TO public USING (true);

-- pinned_items
CREATE POLICY "Anyone can view pinned_items" ON public.pinned_items FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage pinned_items" ON public.pinned_items FOR ALL TO public USING (true) WITH CHECK (true);

-- popup_notices
CREATE POLICY "Anyone can view active popup_notices" ON public.popup_notices FOR SELECT TO public USING (true);
CREATE POLICY "Admins can manage popup_notices" ON public.popup_notices FOR ALL TO public USING (true) WITH CHECK (true);

-- popup_notice_dismissals
CREATE POLICY "Anyone can view popup_notice_dismissals" ON public.popup_notice_dismissals FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert popup_notice_dismissals" ON public.popup_notice_dismissals FOR INSERT TO public WITH CHECK (true);

-- tutorial_videos
CREATE POLICY "Anyone can view tutorial_videos" ON public.tutorial_videos FOR SELECT TO public USING (true);
CREATE POLICY "Allow insert on tutorial_videos" ON public.tutorial_videos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on tutorial_videos" ON public.tutorial_videos FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on tutorial_videos" ON public.tutorial_videos FOR DELETE TO public USING (true);

-- user_downloads
CREATE POLICY "Anyone can view user_downloads" ON public.user_downloads FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert user_downloads" ON public.user_downloads FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update user_downloads" ON public.user_downloads FOR UPDATE TO public USING (true);

-- ============================================================
-- DATABASE FUNCTIONS
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public' AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.verify_student_login(p_phone_number text, p_pin text)
RETURNS TABLE(id uuid, full_name text, phone_number text, email text, academic_year text, gender text, stream text, institution text, is_approved boolean, is_active boolean, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  RETURN QUERY SELECT s.id, s.full_name, s.phone_number, s.email, s.academic_year, s.gender, s.stream, s.institution, s.is_approved, s.is_active, s.created_at
  FROM students s WHERE s.phone_number = p_phone_number AND s.pin_hash = crypt(p_pin, s.pin_hash) AND s.is_active = true;
END; $$;

CREATE OR REPLACE FUNCTION public.verify_teacher_login(p_phone_number text, p_pin text)
RETURNS TABLE(id uuid, full_name text, phone_number text, email text, specialization text, experience text, bio text, credentials_url text, is_approved boolean, is_active boolean, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  RETURN QUERY SELECT t.id, t.full_name, t.phone_number, t.email, t.specialization, t.experience, t.bio, t.credentials_url, t.is_approved, t.is_active, t.created_at
  FROM teachers t WHERE t.phone_number = p_phone_number AND t.pin_hash = crypt(p_pin, t.pin_hash) AND t.is_active = true;
END; $$;

CREATE OR REPLACE FUNCTION public.verify_admin_login(p_phone_number text, p_pin text)
RETURNS TABLE(id uuid, full_name text, phone_number text, role text, is_active boolean, created_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  RETURN QUERY SELECT a.id, a.full_name, a.phone_number, a.role, a.is_active, a.created_at
  FROM admins a WHERE a.phone_number = p_phone_number AND a.pin_hash = crypt(p_pin, a.pin_hash) AND a.is_active = true;
END; $$;

CREATE OR REPLACE FUNCTION public.signup_student(p_full_name text, p_phone_number text, p_pin text, p_email text DEFAULT NULL, p_academic_year text DEFAULT NULL, p_gender text DEFAULT NULL, p_stream text DEFAULT NULL, p_institution text DEFAULT NULL)
RETURNS TABLE(id uuid, full_name text, phone_number text, email text, is_approved boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
DECLARE v_student_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM students s WHERE s.phone_number = p_phone_number) THEN RAISE EXCEPTION 'Phone number already registered'; END IF;
  INSERT INTO students (full_name, phone_number, pin_hash, email, academic_year, gender, stream, institution, is_approved)
  VALUES (p_full_name, p_phone_number, crypt(p_pin, gen_salt('bf')), p_email, p_academic_year, p_gender, p_stream, p_institution, true)
  RETURNING students.id INTO v_student_id;
  RETURN QUERY SELECT s.id, s.full_name, s.phone_number, s.email, s.is_approved FROM students s WHERE s.id = v_student_id;
END; $$;

CREATE OR REPLACE FUNCTION public.signup_teacher(p_full_name text, p_phone_number text, p_email text, p_pin text, p_specialization text DEFAULT NULL, p_experience text DEFAULT NULL, p_bio text DEFAULT NULL, p_credentials_url text DEFAULT NULL, p_intro_video_url text DEFAULT NULL)
RETURNS TABLE(id uuid, full_name text, phone_number text, email text, is_approved boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
DECLARE v_id uuid;
BEGIN
  IF EXISTS (SELECT 1 FROM teachers t WHERE t.phone_number = p_phone_number) THEN RAISE EXCEPTION 'Phone number already registered'; END IF;
  IF EXISTS (SELECT 1 FROM teachers t WHERE t.email = p_email) THEN RAISE EXCEPTION 'Email already registered'; END IF;
  INSERT INTO teachers (full_name, phone_number, email, pin_hash, specialization, experience, bio, credentials_url, intro_video_url, is_approved, is_active)
  VALUES (p_full_name, p_phone_number, p_email, crypt(p_pin, gen_salt('bf')), p_specialization, p_experience, p_bio, p_credentials_url, p_intro_video_url, false, true)
  RETURNING teachers.id INTO v_id;
  RETURN QUERY SELECT t.id, t.full_name, t.phone_number, t.email, t.is_approved FROM teachers t WHERE t.id = v_id;
END; $$;

CREATE OR REPLACE FUNCTION public.update_student_pin(p_student_id uuid, p_new_pin text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  UPDATE students SET pin_hash = crypt(p_new_pin, gen_salt('bf')), updated_at = now() WHERE id = p_student_id;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.get_student_by_id(p_student_id uuid)
RETURNS TABLE(id uuid, full_name text, phone_number text, email text, academic_year text, gender text, stream text, institution text, is_approved boolean, profile_picture_url text, created_at timestamptz, updated_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY SELECT s.id, s.full_name, s.phone_number, s.email, s.academic_year, s.gender, s.stream, s.institution, s.is_approved, s.profile_picture_url, s.created_at, s.updated_at FROM students s WHERE s.id = p_student_id;
END; $$;

CREATE OR REPLACE FUNCTION public.get_teacher_by_id(p_teacher_id uuid)
RETURNS TABLE(id uuid, full_name text, phone_number text, email text, specialization text, experience text, bio text, credentials_url text, is_approved boolean, is_active boolean, profile_picture_url text, created_at timestamptz, updated_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY SELECT t.id, t.full_name, t.phone_number, t.email, t.specialization, t.experience, t.bio, t.credentials_url, t.is_approved, t.is_active, t.profile_picture_url, t.created_at, t.updated_at FROM teachers t WHERE t.id = p_teacher_id;
END; $$;

CREATE OR REPLACE FUNCTION public.get_admin_by_id(p_admin_id uuid)
RETURNS TABLE(id uuid, full_name text, phone_number text, role text, is_active boolean, profile_picture_url text, created_at timestamptz, updated_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY SELECT a.id, a.full_name, a.phone_number, a.role, a.is_active, a.profile_picture_url, a.created_at, a.updated_at FROM admins a WHERE a.id = p_admin_id;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_update_student(p_student_id uuid, p_full_name text DEFAULT NULL, p_phone_number text DEFAULT NULL, p_pin text DEFAULT NULL, p_email text DEFAULT NULL, p_institution text DEFAULT NULL, p_academic_year text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  UPDATE students SET
    full_name = COALESCE(p_full_name, full_name), phone_number = COALESCE(p_phone_number, phone_number),
    email = COALESCE(p_email, email), institution = COALESCE(p_institution, institution),
    academic_year = COALESCE(p_academic_year, academic_year),
    pin_hash = CASE WHEN p_pin IS NOT NULL AND p_pin != '' THEN crypt(p_pin, gen_salt('bf')) ELSE pin_hash END,
    updated_at = now()
  WHERE id = p_student_id;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_update_teacher(p_teacher_id uuid, p_full_name text DEFAULT NULL, p_phone_number text DEFAULT NULL, p_pin text DEFAULT NULL, p_email text DEFAULT NULL, p_specialization text DEFAULT NULL, p_experience text DEFAULT NULL)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  UPDATE teachers SET
    full_name = COALESCE(p_full_name, full_name), phone_number = COALESCE(p_phone_number, phone_number),
    email = COALESCE(p_email, email), specialization = COALESCE(p_specialization, specialization),
    experience = COALESCE(p_experience, experience),
    pin_hash = CASE WHEN p_pin IS NOT NULL AND p_pin != '' THEN crypt(p_pin, gen_salt('bf')) ELSE pin_hash END,
    updated_at = now()
  WHERE id = p_teacher_id;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(total_students bigint, pending_students bigint, total_teachers bigint, pending_teachers bigint, pending_payments bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM students)::BIGINT,
    (SELECT COUNT(*) FROM students WHERE is_approved = false)::BIGINT,
    (SELECT COUNT(*) FROM teachers)::BIGINT,
    (SELECT COUNT(*) FROM teachers WHERE is_approved = false)::BIGINT,
    (SELECT COUNT(*) FROM payment_submissions WHERE status = 'pending')::BIGINT;
END; $$;

CREATE OR REPLACE FUNCTION public.bind_device(p_user_id uuid, p_user_type text, p_device_model text, p_device_os text, p_device_version text, p_device_fingerprint text)
RETURNS TABLE(success boolean, message text) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM device_bindings WHERE user_id = p_user_id AND user_type = p_user_type AND is_active = true) THEN
    RETURN QUERY SELECT false, 'Device already bound. Contact admin to reset.'::TEXT; RETURN;
  END IF;
  INSERT INTO device_bindings (user_id, user_type, device_model, device_os, device_version, device_fingerprint)
  VALUES (p_user_id, p_user_type, p_device_model, p_device_os, p_device_version, p_device_fingerprint);
  RETURN QUERY SELECT true, 'Device bound successfully'::TEXT;
END; $$;

CREATE OR REPLACE FUNCTION public.check_device_binding(p_user_id uuid, p_user_type text, p_device_fingerprint text)
RETURNS TABLE(is_bound boolean, bound_device text, message text) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
DECLARE v_binding RECORD;
BEGIN
  SELECT * INTO v_binding FROM device_bindings WHERE user_id = p_user_id AND user_type = p_user_type AND is_active = true;
  IF NOT FOUND THEN RETURN QUERY SELECT false, NULL::TEXT, 'No device bound'::TEXT; RETURN; END IF;
  IF v_binding.device_fingerprint = p_device_fingerprint THEN
    UPDATE device_bindings SET last_accessed = now() WHERE id = v_binding.id;
    RETURN QUERY SELECT true, v_binding.device_model, 'Device verified'::TEXT;
  ELSE RETURN QUERY SELECT false, v_binding.device_model, 'Different device detected'::TEXT; END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.reset_device_binding(p_user_id uuid, p_user_type text)
RETURNS TABLE(success boolean, message text) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  UPDATE device_bindings SET is_active = false WHERE user_id = p_user_id AND user_type = p_user_type;
  RETURN QUERY SELECT true, 'Device binding reset successfully'::TEXT;
END; $$;

CREATE OR REPLACE FUNCTION public.register_trusted_device(p_user_id uuid, p_user_type text, p_device_token_hash text, p_device_name text DEFAULT NULL, p_user_agent text DEFAULT NULL)
RETURNS TABLE(device_id uuid, success boolean) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO trusted_devices (user_id, user_type, device_token_hash, device_name, user_agent)
  VALUES (p_user_id, p_user_type, p_device_token_hash, p_device_name, p_user_agent) RETURNING id INTO v_id;
  RETURN QUERY SELECT v_id, true;
END; $$;

CREATE OR REPLACE FUNCTION public.verify_device_token(p_user_id uuid, p_user_type text, p_device_token_hash text)
RETURNS TABLE(device_id uuid, device_name text, is_valid boolean) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY SELECT td.id, td.device_name, true FROM trusted_devices td
  WHERE td.user_id = p_user_id AND td.user_type = p_user_type AND td.device_token_hash = p_device_token_hash AND td.revoked = false;
  UPDATE trusted_devices SET last_seen = now()
  WHERE user_id = p_user_id AND user_type = p_user_type AND device_token_hash = p_device_token_hash AND revoked = false;
END; $$;

CREATE OR REPLACE FUNCTION public.revoke_trusted_device(p_device_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN UPDATE trusted_devices SET revoked = true WHERE id = p_device_id; RETURN true; END; $$;

CREATE OR REPLACE FUNCTION public.revoke_all_user_devices(p_user_id uuid, p_user_type text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN UPDATE trusted_devices SET revoked = true WHERE user_id = p_user_id AND user_type = p_user_type; RETURN true; END; $$;

CREATE OR REPLACE FUNCTION public.get_user_devices(p_user_id uuid, p_user_type text)
RETURNS TABLE(id uuid, device_name text, user_agent text, created_at timestamptz, last_seen timestamptz, revoked boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY SELECT td.id, td.device_name, td.user_agent, td.created_at, td.last_seen, td.revoked
  FROM trusted_devices td WHERE td.user_id = p_user_id AND td.user_type = p_user_type ORDER BY td.last_seen DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.approve_content(p_content_type text, p_content_id uuid, p_admin_id uuid)
RETURNS boolean LANGUAGE plpgsql SET search_path TO 'public', 'extensions' AS $$
BEGIN
  IF p_content_type = 'lesson' THEN
    UPDATE lessons SET approval_status = 'approved', approved_by = p_admin_id, approved_at = now(), is_published = true WHERE id = p_content_id;
  ELSIF p_content_type = 'library' THEN
    UPDATE library_content SET approval_status = 'approved', approved_by = p_admin_id, approved_at = now() WHERE id = p_content_id;
  END IF;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.reject_content(p_content_type text, p_content_id uuid, p_admin_id uuid, p_reason text)
RETURNS boolean LANGUAGE plpgsql SET search_path TO 'public', 'extensions' AS $$
BEGIN
  IF p_content_type = 'lesson' THEN
    UPDATE lessons SET approval_status = 'rejected', approved_by = p_admin_id, approved_at = now(), rejection_reason = p_reason WHERE id = p_content_id;
  ELSIF p_content_type = 'library' THEN
    UPDATE library_content SET approval_status = 'rejected', approved_by = p_admin_id, approved_at = now(), rejection_reason = p_reason WHERE id = p_content_id;
  END IF;
  RETURN TRUE;
END; $$;

CREATE OR REPLACE FUNCTION public.cleanup_old_payment_proofs()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT ps.id FROM payment_submissions ps
    WHERE ps.status IN ('approved', 'rejected') AND ps.reviewed_at IS NOT NULL
    AND ps.reviewed_at < (NOW() - INTERVAL '3 days') AND array_length(ps.screenshot_urls, 1) > 0 AND ps.screenshot_urls[1] != ''
  LOOP
    UPDATE payment_submissions SET screenshot_urls = ARRAY[]::text[] WHERE id = r.id;
  END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION public.notify_admins_on_payment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_admin RECORD; v_student_name TEXT;
BEGIN
  SELECT full_name INTO v_student_name FROM students WHERE id = NEW.student_id;
  FOR v_admin IN SELECT id FROM admins WHERE is_active = true LOOP
    INSERT INTO notifications (user_id, user_type, type, title, message, action_url)
    VALUES (v_admin.id, 'admin', 'payment', 'New Payment Pending',
      'Payment proof submitted by ' || COALESCE(v_student_name, 'a student') || ' for ' || NEW.amount || ' ETB.',
      '/admin/payment-approvals');
  END LOOP;
  RETURN NEW;
END; $$;

-- Create the trigger
CREATE TRIGGER on_payment_submission_insert
  AFTER INSERT ON public.payment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_payment();

-- ============================================================
-- VIEWS
-- ============================================================

CREATE OR REPLACE VIEW public.pending_content_approvals AS
SELECT 'lesson'::text AS content_type,
    l.id, l.title, l.lesson_type, l.video_source, l.youtube_url, l.content_url,
    l.approval_status, l.created_at,
    c.name AS course_title, t.full_name AS teacher_name, t.id AS teacher_id
FROM lessons l
  JOIN chapters ch ON l.chapter_id = ch.id
  JOIN courses c ON ch.course_id = c.id
  JOIN teachers t ON c.teacher_id = t.id
WHERE l.approval_status = 'pending'
UNION ALL
SELECT 'library'::text AS content_type,
    lc.id, lc.title, lc.content_type AS lesson_type, lc.video_source, lc.youtube_url,
    lc.file_url AS content_url, lc.approval_status, lc.created_at,
    NULL::text AS course_title, 'Admin'::text AS teacher_name, NULL::uuid AS teacher_id
FROM library_content lc
WHERE lc.approval_status = 'pending';

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('course-videos', 'course-videos', false) ON CONFLICT DO NOTHING;

-- Storage policies for payment-proofs (public bucket)
CREATE POLICY "Anyone can upload payment proofs" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'payment-proofs');
CREATE POLICY "Anyone can view payment proofs" ON storage.objects FOR SELECT TO public USING (bucket_id = 'payment-proofs');

-- Storage policies for content-images (public bucket)
CREATE POLICY "Anyone can upload content images" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'content-images');
CREATE POLICY "Anyone can view content images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'content-images');

-- Storage policies for course-videos (private bucket)
CREATE POLICY "Authenticated can upload course videos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'course-videos');
CREATE POLICY "Authenticated can view course videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'course-videos');
CREATE POLICY "Authenticated can delete course videos" ON storage.objects FOR DELETE TO public USING (bucket_id = 'course-videos');
