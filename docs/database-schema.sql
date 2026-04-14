-- =============================================
-- Magster Platform - Database Schema
-- Generated: 2026-02-23
-- Supabase Project: rpfhatpademhbcbrqtch
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================
-- TABLE: admins
-- =============================================
CREATE TABLE public.admins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  profile_picture TEXT,
  profile_picture_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all admin data" ON public.admins
  FOR SELECT USING (true);

-- =============================================
-- TABLE: app_settings
-- =============================================
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view app_settings" ON public.app_settings
  FOR SELECT USING (true);

-- =============================================
-- TABLE: students
-- =============================================
CREATE TABLE public.students (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  email TEXT,
  academic_year TEXT,
  gender TEXT,
  stream TEXT,
  institution TEXT,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  profile_picture TEXT,
  profile_picture_url TEXT,
  last_logout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view own data" ON public.students
  FOR SELECT USING (id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Students can update own data" ON public.students
  FOR UPDATE USING (id = (current_setting('app.current_user_id', true))::uuid);

-- =============================================
-- TABLE: teachers
-- =============================================
CREATE TABLE public.teachers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  pin_hash TEXT NOT NULL,
  email TEXT NOT NULL,
  specialization TEXT,
  experience TEXT,
  bio TEXT,
  credentials_url TEXT,
  intro_video_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_approved BOOLEAN DEFAULT false,
  profile_picture TEXT,
  profile_picture_url TEXT,
  last_logout_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teachers can view own data" ON public.teachers
  FOR SELECT USING (id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Teachers can update own data" ON public.teachers
  FOR UPDATE USING (id = (current_setting('app.current_user_id', true))::uuid);

-- =============================================
-- TABLE: courses
-- =============================================
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  department TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  is_bundle_exclusive BOOLEAN DEFAULT false,
  teacher_id UUID REFERENCES public.teachers(id),
  thumbnail_url TEXT,
  sample_video_url TEXT,
  sample_pdf_url TEXT,
  syllabus TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view courses" ON public.courses
  FOR SELECT USING (true);

-- =============================================
-- TABLE: chapters
-- =============================================
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id),
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chapters" ON public.chapters
  FOR SELECT USING (true);

-- =============================================
-- TABLE: lessons
-- =============================================
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id),
  title TEXT NOT NULL,
  description TEXT,
  lesson_type TEXT NOT NULL,
  content_url TEXT,
  youtube_url TEXT,
  video_source TEXT DEFAULT 'upload',
  duration INTEGER,
  page_count INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_preview BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  is_downloadable BOOLEAN DEFAULT false,
  download_url TEXT,
  approval_status TEXT DEFAULT 'pending',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.admins(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lessons" ON public.lessons
  FOR SELECT USING (true);

-- =============================================
-- TABLE: bundles
-- =============================================
CREATE TABLE public.bundles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  semester TEXT NOT NULL,
  year_level TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  discount_percentage INTEGER DEFAULT 0,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bundles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bundles" ON public.bundles
  FOR ALL USING (true);

CREATE POLICY "Anyone can view active bundles" ON public.bundles
  FOR SELECT USING (is_active = true);

-- =============================================
-- TABLE: bundle_courses
-- =============================================
CREATE TABLE public.bundle_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bundle_id UUID NOT NULL REFERENCES public.bundles(id),
  course_id UUID NOT NULL REFERENCES public.courses(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.bundle_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage bundle courses" ON public.bundle_courses
  FOR ALL USING (true);

CREATE POLICY "Anyone can view bundle courses" ON public.bundle_courses
  FOR SELECT USING (true);

-- =============================================
-- TABLE: enrollments
-- =============================================
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id),
  course_id UUID REFERENCES public.courses(id),
  bundle_id UUID REFERENCES public.bundles(id),
  enrollment_type TEXT NOT NULL,
  payment_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all enrollments" ON public.enrollments
  FOR SELECT USING (true);

CREATE POLICY "Admins can update enrollments" ON public.enrollments
  FOR UPDATE USING (true);

CREATE POLICY "Allow enrollment creation" ON public.enrollments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can view own enrollments" ON public.enrollments
  FOR SELECT USING (student_id = auth.uid());

-- =============================================
-- TABLE: payment_methods
-- =============================================
CREATE TABLE public.payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method_name TEXT NOT NULL,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage payment methods" ON public.payment_methods
  FOR ALL USING (true);

CREATE POLICY "Anyone can view active payment methods" ON public.payment_methods
  FOR SELECT USING (is_active = true);

-- =============================================
-- TABLE: payment_submissions
-- =============================================
CREATE TABLE public.payment_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id),
  student_id UUID NOT NULL REFERENCES public.students(id),
  screenshot_urls TEXT[] NOT NULL,
  payment_method TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES public.admins(id),
  submitted_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all submissions" ON public.payment_submissions
  FOR SELECT USING (true);

CREATE POLICY "Admins can update submissions" ON public.payment_submissions
  FOR UPDATE USING (true);

CREATE POLICY "Allow anyone to insert payment submissions" ON public.payment_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Students can view own submissions" ON public.payment_submissions
  FOR SELECT USING (student_id = auth.uid());

-- =============================================
-- TABLE: competitions
-- =============================================
CREATE TABLE public.competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  registered_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competitions" ON public.competitions
  FOR SELECT USING (true);

-- =============================================
-- TABLE: competition_questions
-- =============================================
CREATE TABLE public.competition_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES public.competitions(id),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competition_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competition_questions" ON public.competition_questions
  FOR SELECT USING (true);

-- =============================================
-- TABLE: competition_participants
-- =============================================
CREATE TABLE public.competition_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.competitions(id),
  student_id UUID NOT NULL REFERENCES public.students(id),
  status TEXT NOT NULL DEFAULT 'registered',
  score NUMERIC,
  rank INTEGER,
  registered_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view competition_participants" ON public.competition_participants
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert competition_participants" ON public.competition_participants
  FOR INSERT WITH CHECK (true);

-- =============================================
-- TABLE: library_items (categories)
-- =============================================
CREATE TABLE public.library_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT 'Book',
  item_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view library_items" ON public.library_items
  FOR SELECT USING (true);

-- =============================================
-- TABLE: library_content
-- =============================================
CREATE TABLE public.library_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.library_items(id),
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT NOT NULL,
  content_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  youtube_url TEXT,
  video_source TEXT DEFAULT 'upload',
  thumbnail_url TEXT,
  author TEXT,
  file_size BIGINT,
  page_count INTEGER,
  duration INTEGER,
  download_count INTEGER DEFAULT 0,
  requires_enrollment BOOLEAN DEFAULT false,
  approval_status TEXT DEFAULT 'approved',
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES public.admins(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.library_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view library_content" ON public.library_content
  FOR SELECT USING (true);

-- =============================================
-- TABLE: lesson_progress
-- =============================================
CREATE TABLE public.lesson_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES public.students(id),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments(id),
  status TEXT NOT NULL DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0,
  last_position INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lesson_progress" ON public.lesson_progress
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert lesson_progress" ON public.lesson_progress
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update lesson_progress" ON public.lesson_progress
  FOR UPDATE USING (true);

-- =============================================
-- TABLE: quizzes
-- =============================================
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id),
  course_id UUID REFERENCES public.courses(id),
  title TEXT NOT NULL,
  description TEXT,
  duration INTEGER,
  passing_score INTEGER DEFAULT 70,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quizzes" ON public.quizzes
  FOR SELECT USING (true);

-- =============================================
-- TABLE: quiz_questions
-- =============================================
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id),
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  points INTEGER DEFAULT 1,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz_questions" ON public.quiz_questions
  FOR SELECT USING (true);

-- =============================================
-- TABLE: quiz_attempts
-- =============================================
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id),
  student_id UUID NOT NULL REFERENCES public.students(id),
  status TEXT NOT NULL DEFAULT 'in_progress',
  score NUMERIC,
  total_points INTEGER,
  answers JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view quiz_attempts" ON public.quiz_attempts
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert quiz_attempts" ON public.quiz_attempts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update quiz_attempts" ON public.quiz_attempts
  FOR UPDATE USING (true);

-- =============================================
-- TABLE: teacher_earnings
-- =============================================
CREATE TABLE public.teacher_earnings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID NOT NULL REFERENCES public.teachers(id),
  enrollment_id UUID REFERENCES public.enrollments(id),
  type TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  withdrawal_request_date TIMESTAMPTZ,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.teacher_earnings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view teacher_earnings" ON public.teacher_earnings
  FOR SELECT USING (true);

-- =============================================
-- TABLE: notifications
-- =============================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can create notifications for anyone" ON public.notifications
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM admins WHERE admins.id = auth.uid()));

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (
    ((user_type = 'student') AND (user_id IN (SELECT students.id FROM students WHERE students.id = auth.uid())))
    OR ((user_type = 'teacher') AND (user_id IN (SELECT teachers.id FROM teachers WHERE teachers.id = auth.uid())))
    OR ((user_type = 'admin') AND (user_id IN (SELECT admins.id FROM admins WHERE admins.id = auth.uid())))
  );

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (
    ((user_type = 'student') AND (user_id IN (SELECT students.id FROM students WHERE students.id = auth.uid())))
    OR ((user_type = 'teacher') AND (user_id IN (SELECT teachers.id FROM teachers WHERE teachers.id = auth.uid())))
    OR ((user_type = 'admin') AND (user_id IN (SELECT admins.id FROM admins WHERE admins.id = auth.uid())))
  );

CREATE POLICY "Users can delete their own notifications" ON public.notifications
  FOR DELETE USING (
    ((user_type = 'student') AND (user_id IN (SELECT students.id FROM students WHERE students.id = auth.uid())))
    OR ((user_type = 'teacher') AND (user_id IN (SELECT teachers.id FROM teachers WHERE teachers.id = auth.uid())))
    OR ((user_type = 'admin') AND (user_id IN (SELECT admins.id FROM admins WHERE admins.id = auth.uid())))
  );

-- =============================================
-- TABLE: device_bindings
-- =============================================
CREATE TABLE public.device_bindings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  device_model TEXT NOT NULL,
  device_os TEXT NOT NULL,
  device_version TEXT NOT NULL,
  device_fingerprint TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  bound_at TIMESTAMPTZ DEFAULT now(),
  last_accessed TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.device_bindings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABLE: trusted_devices
-- =============================================
CREATE TABLE public.trusted_devices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  device_token_hash TEXT NOT NULL,
  device_name TEXT,
  user_agent TEXT,
  revoked BOOLEAN NOT NULL DEFAULT false,
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert on trusted_devices" ON public.trusted_devices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow select on trusted_devices" ON public.trusted_devices
  FOR SELECT USING (true);

CREATE POLICY "Allow update on trusted_devices" ON public.trusted_devices
  FOR UPDATE USING (true);

-- =============================================
-- TABLE: tutorial_videos
-- =============================================
CREATE TABLE public.tutorial_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  target_audience TEXT,
  duration INTEGER,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  uploaded_by UUID REFERENCES public.admins(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.tutorial_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tutorial_videos" ON public.tutorial_videos
  FOR SELECT USING (true);

-- =============================================
-- TABLE: user_downloads
-- =============================================
CREATE TABLE public.user_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  encrypted BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT false,
  downloaded_at TIMESTAMPTZ DEFAULT now(),
  last_accessed TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user_downloads" ON public.user_downloads
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert user_downloads" ON public.user_downloads
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update user_downloads" ON public.user_downloads
  FOR UPDATE USING (true);

-- =============================================
-- VIEW: pending_content_approvals
-- =============================================
CREATE OR REPLACE VIEW public.pending_content_approvals AS
SELECT
  l.id,
  l.title,
  l.lesson_type,
  l.video_source,
  l.youtube_url,
  l.content_url,
  l.approval_status,
  l.created_at,
  'lesson' AS content_type,
  t.id AS teacher_id,
  t.full_name AS teacher_name,
  c.name AS course_title
FROM lessons l
JOIN chapters ch ON l.chapter_id = ch.id
JOIN courses c ON ch.course_id = c.id
LEFT JOIN teachers t ON c.teacher_id = t.id
WHERE l.approval_status = 'pending';

-- =============================================
-- DATABASE FUNCTIONS
-- =============================================

-- Auto-update updated_at timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';

-- Student signup (auto-approved, hashes PIN with pgcrypto)
CREATE OR REPLACE FUNCTION public.signup_student(
  p_full_name TEXT, p_phone_number TEXT, p_pin TEXT,
  p_email TEXT DEFAULT NULL, p_academic_year TEXT DEFAULT NULL,
  p_gender TEXT DEFAULT NULL, p_stream TEXT DEFAULT NULL,
  p_institution TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, full_name TEXT, phone_number TEXT, email TEXT, is_approved BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
DECLARE v_student_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM students s WHERE s.phone_number = p_phone_number) THEN
    RAISE EXCEPTION 'Phone number already registered';
  END IF;
  INSERT INTO students (full_name, phone_number, pin_hash, email, academic_year, gender, stream, institution, is_approved)
  VALUES (p_full_name, p_phone_number, crypt(p_pin, gen_salt('bf')), p_email, p_academic_year, p_gender, p_stream, p_institution, true)
  RETURNING students.id INTO v_student_id;
  RETURN QUERY SELECT s.id, s.full_name, s.phone_number, s.email, s.is_approved FROM students s WHERE s.id = v_student_id;
END;
$$;

-- Teacher signup (requires admin approval) - with intro_video_url
CREATE OR REPLACE FUNCTION public.signup_teacher(
  p_full_name TEXT, p_phone_number TEXT, p_email TEXT, p_pin TEXT,
  p_specialization TEXT DEFAULT NULL, p_experience TEXT DEFAULT NULL,
  p_bio TEXT DEFAULT NULL, p_credentials_url TEXT DEFAULT NULL,
  p_intro_video_url TEXT DEFAULT NULL
)
RETURNS TABLE(id UUID, full_name TEXT, phone_number TEXT, email TEXT, is_approved BOOLEAN)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
DECLARE v_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM teachers t WHERE t.phone_number = p_phone_number) THEN
    RAISE EXCEPTION 'Phone number already registered';
  END IF;
  IF EXISTS (SELECT 1 FROM teachers t WHERE t.email = p_email) THEN
    RAISE EXCEPTION 'Email already registered';
  END IF;
  INSERT INTO teachers (full_name, phone_number, email, pin_hash, specialization, experience, bio, credentials_url, intro_video_url, is_approved, is_active)
  VALUES (p_full_name, p_phone_number, p_email, crypt(p_pin, gen_salt('bf')), p_specialization, p_experience, p_bio, p_credentials_url, p_intro_video_url, false, true)
  RETURNING teachers.id INTO v_id;
  RETURN QUERY SELECT t.id, t.full_name, t.phone_number, t.email, t.is_approved FROM teachers t WHERE t.id = v_id;
END;
$$;

-- Student login verification (PIN check via pgcrypto)
CREATE OR REPLACE FUNCTION public.verify_student_login(p_phone_number TEXT, p_pin TEXT)
RETURNS TABLE(id UUID, full_name TEXT, phone_number TEXT, email TEXT, academic_year TEXT, gender TEXT, stream TEXT, institution TEXT, is_approved BOOLEAN, is_active BOOLEAN, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  RETURN QUERY
  SELECT s.id, s.full_name, s.phone_number, s.email, s.academic_year, s.gender, s.stream, s.institution, s.is_approved, s.is_active, s.created_at
  FROM students s WHERE s.phone_number = p_phone_number AND s.pin_hash = crypt(p_pin, s.pin_hash) AND s.is_active = true;
END;
$$;

-- Teacher login verification
CREATE OR REPLACE FUNCTION public.verify_teacher_login(p_phone_number TEXT, p_pin TEXT)
RETURNS TABLE(id UUID, full_name TEXT, phone_number TEXT, email TEXT, specialization TEXT, experience TEXT, bio TEXT, credentials_url TEXT, is_approved BOOLEAN, is_active BOOLEAN, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  RETURN QUERY
  SELECT t.id, t.full_name, t.phone_number, t.email, t.specialization, t.experience, t.bio, t.credentials_url, t.is_approved, t.is_active, t.created_at
  FROM teachers t WHERE t.phone_number = p_phone_number AND t.pin_hash = crypt(p_pin, t.pin_hash) AND t.is_active = true;
END;
$$;

-- Admin login verification
CREATE OR REPLACE FUNCTION public.verify_admin_login(p_phone_number TEXT, p_pin TEXT)
RETURNS TABLE(id UUID, full_name TEXT, phone_number TEXT, role TEXT, is_active BOOLEAN, created_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.full_name, a.phone_number, a.role, a.is_active, a.created_at
  FROM admins a WHERE a.phone_number = p_phone_number AND a.pin_hash = crypt(p_pin, a.pin_hash) AND a.is_active = true;
END;
$$;

-- Get student profile by ID
CREATE OR REPLACE FUNCTION public.get_student_by_id(p_student_id UUID)
RETURNS TABLE(id UUID, full_name TEXT, phone_number TEXT, email TEXT, academic_year TEXT, gender TEXT, stream TEXT, institution TEXT, is_approved BOOLEAN, profile_picture_url TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY SELECT s.id, s.full_name, s.phone_number, s.email, s.academic_year, s.gender, s.stream, s.institution, s.is_approved, s.profile_picture_url, s.created_at, s.updated_at FROM students s WHERE s.id = p_student_id;
END;
$$;

-- Get teacher profile by ID
CREATE OR REPLACE FUNCTION public.get_teacher_by_id(p_teacher_id UUID)
RETURNS TABLE(id UUID, full_name TEXT, phone_number TEXT, email TEXT, specialization TEXT, experience TEXT, bio TEXT, credentials_url TEXT, is_approved BOOLEAN, is_active BOOLEAN, profile_picture_url TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY SELECT t.id, t.full_name, t.phone_number, t.email, t.specialization, t.experience, t.bio, t.credentials_url, t.is_approved, t.is_active, t.profile_picture_url, t.created_at, t.updated_at FROM teachers t WHERE t.id = p_teacher_id;
END;
$$;

-- Get admin profile by ID
CREATE OR REPLACE FUNCTION public.get_admin_by_id(p_admin_id UUID)
RETURNS TABLE(id UUID, full_name TEXT, phone_number TEXT, role TEXT, is_active BOOLEAN, profile_picture_url TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY SELECT a.id, a.full_name, a.phone_number, a.role, a.is_active, a.profile_picture_url, a.created_at, a.updated_at FROM admins a WHERE a.id = p_admin_id;
END;
$$;

-- Dashboard statistics for admin panel
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS TABLE(total_students BIGINT, pending_students BIGINT, total_teachers BIGINT, pending_teachers BIGINT, pending_payments BIGINT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  RETURN QUERY SELECT
    (SELECT COUNT(*) FROM students)::BIGINT,
    (SELECT COUNT(*) FROM students WHERE is_approved = false)::BIGINT,
    (SELECT COUNT(*) FROM teachers)::BIGINT,
    (SELECT COUNT(*) FROM teachers WHERE is_approved = false)::BIGINT,
    (SELECT COUNT(*) FROM payment_submissions WHERE status = 'pending')::BIGINT;
END;
$$;

-- Update student PIN
CREATE OR REPLACE FUNCTION public.update_student_pin(p_student_id UUID, p_new_pin TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  UPDATE students SET pin_hash = crypt(p_new_pin, gen_salt('bf')), updated_at = now() WHERE id = p_student_id;
  RETURN true;
END;
$$;

-- Admin update student (with optional PIN reset)
CREATE OR REPLACE FUNCTION public.admin_update_student(
  p_student_id UUID, p_full_name TEXT DEFAULT NULL, p_phone_number TEXT DEFAULT NULL,
  p_pin TEXT DEFAULT NULL, p_email TEXT DEFAULT NULL, p_institution TEXT DEFAULT NULL,
  p_academic_year TEXT DEFAULT NULL
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  UPDATE students SET
    full_name = COALESCE(p_full_name, full_name),
    phone_number = COALESCE(p_phone_number, phone_number),
    email = COALESCE(p_email, email),
    institution = COALESCE(p_institution, institution),
    academic_year = COALESCE(p_academic_year, academic_year),
    pin_hash = CASE WHEN p_pin IS NOT NULL AND p_pin != '' THEN crypt(p_pin, gen_salt('bf')) ELSE pin_hash END,
    updated_at = now()
  WHERE id = p_student_id;
  RETURN TRUE;
END;
$$;

-- Admin update teacher (with optional PIN reset)
CREATE OR REPLACE FUNCTION public.admin_update_teacher(
  p_teacher_id UUID, p_full_name TEXT DEFAULT NULL, p_phone_number TEXT DEFAULT NULL,
  p_pin TEXT DEFAULT NULL, p_email TEXT DEFAULT NULL, p_specialization TEXT DEFAULT NULL,
  p_experience TEXT DEFAULT NULL
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  UPDATE teachers SET
    full_name = COALESCE(p_full_name, full_name),
    phone_number = COALESCE(p_phone_number, phone_number),
    email = COALESCE(p_email, email),
    specialization = COALESCE(p_specialization, specialization),
    experience = COALESCE(p_experience, experience),
    pin_hash = CASE WHEN p_pin IS NOT NULL AND p_pin != '' THEN crypt(p_pin, gen_salt('bf')) ELSE pin_hash END,
    updated_at = now()
  WHERE id = p_teacher_id;
  RETURN TRUE;
END;
$$;

-- Approve lesson or library content
CREATE OR REPLACE FUNCTION public.approve_content(p_content_type TEXT, p_content_id UUID, p_admin_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SET search_path TO 'public', 'extensions' AS $$
BEGIN
  IF p_content_type = 'lesson' THEN
    UPDATE lessons SET approval_status = 'approved', approved_by = p_admin_id, approved_at = now(), is_published = true WHERE id = p_content_id;
  ELSIF p_content_type = 'library' THEN
    UPDATE library_content SET approval_status = 'approved', approved_by = p_admin_id, approved_at = now() WHERE id = p_content_id;
  END IF;
  RETURN TRUE;
END;
$$;

-- Reject lesson or library content with reason
CREATE OR REPLACE FUNCTION public.reject_content(p_content_type TEXT, p_content_id UUID, p_admin_id UUID, p_reason TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SET search_path TO 'public', 'extensions' AS $$
BEGIN
  IF p_content_type = 'lesson' THEN
    UPDATE lessons SET approval_status = 'rejected', approved_by = p_admin_id, approved_at = now(), rejection_reason = p_reason WHERE id = p_content_id;
  ELSIF p_content_type = 'library' THEN
    UPDATE library_content SET approval_status = 'rejected', approved_by = p_admin_id, approved_at = now(), rejection_reason = p_reason WHERE id = p_content_id;
  END IF;
  RETURN TRUE;
END;
$$;

-- Bind a device to a user account (Strict Device Lock)
CREATE OR REPLACE FUNCTION public.bind_device(
  p_user_id UUID, p_user_type TEXT, p_device_model TEXT,
  p_device_os TEXT, p_device_version TEXT, p_device_fingerprint TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  IF EXISTS (SELECT 1 FROM device_bindings WHERE user_id = p_user_id AND user_type = p_user_type AND is_active = true) THEN
    RETURN QUERY SELECT false, 'Device already bound. Contact admin to reset.'::TEXT;
    RETURN;
  END IF;
  INSERT INTO device_bindings (user_id, user_type, device_model, device_os, device_version, device_fingerprint)
  VALUES (p_user_id, p_user_type, p_device_model, p_device_os, p_device_version, p_device_fingerprint);
  RETURN QUERY SELECT true, 'Device bound successfully'::TEXT;
END;
$$;

-- Check if the current device matches the bound device
CREATE OR REPLACE FUNCTION public.check_device_binding(p_user_id UUID, p_user_type TEXT, p_device_fingerprint TEXT)
RETURNS TABLE(is_bound BOOLEAN, bound_device TEXT, message TEXT) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
DECLARE v_binding RECORD;
BEGIN
  SELECT * INTO v_binding FROM device_bindings WHERE user_id = p_user_id AND user_type = p_user_type AND is_active = true;
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'No device bound'::TEXT;
    RETURN;
  END IF;
  IF v_binding.device_fingerprint = p_device_fingerprint THEN
    UPDATE device_bindings SET last_accessed = now() WHERE id = v_binding.id;
    RETURN QUERY SELECT true, v_binding.device_model, 'Device verified'::TEXT;
  ELSE
    RETURN QUERY SELECT false, v_binding.device_model, 'Different device detected'::TEXT;
  END IF;
END;
$$;

-- Admin resets device binding so user can re-bind on next login
CREATE OR REPLACE FUNCTION public.reset_device_binding(p_user_id UUID, p_user_type TEXT)
RETURNS TABLE(success BOOLEAN, message TEXT) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public', 'extensions' AS $$
BEGIN
  UPDATE device_bindings SET is_active = false WHERE user_id = p_user_id AND user_type = p_user_type;
  RETURN QUERY SELECT true, 'Device binding reset successfully'::TEXT;
END;
$$;

-- Register a trusted device
CREATE OR REPLACE FUNCTION public.register_trusted_device(
  p_user_id UUID, p_user_type TEXT, p_device_token_hash TEXT,
  p_device_name TEXT DEFAULT NULL, p_user_agent TEXT DEFAULT NULL
)
RETURNS TABLE(device_id UUID, success BOOLEAN) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO trusted_devices (user_id, user_type, device_token_hash, device_name, user_agent)
  VALUES (p_user_id, p_user_type, p_device_token_hash, p_device_name, p_user_agent)
  RETURNING id INTO v_id;
  RETURN QUERY SELECT v_id, true;
END;
$$;

-- Verify a trusted device token
CREATE OR REPLACE FUNCTION public.verify_device_token(p_user_id UUID, p_user_type TEXT, p_device_token_hash TEXT)
RETURNS TABLE(device_id UUID, device_name TEXT, is_valid BOOLEAN) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY
  SELECT td.id, td.device_name, true
  FROM trusted_devices td
  WHERE td.user_id = p_user_id AND td.user_type = p_user_type AND td.device_token_hash = p_device_token_hash AND td.revoked = false;
  UPDATE trusted_devices SET last_seen = now()
  WHERE user_id = p_user_id AND user_type = p_user_type AND device_token_hash = p_device_token_hash AND revoked = false;
END;
$$;

-- Revoke a single trusted device
CREATE OR REPLACE FUNCTION public.revoke_trusted_device(p_device_id UUID)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE trusted_devices SET revoked = true WHERE id = p_device_id;
  RETURN true;
END;
$$;

-- Revoke all user devices
CREATE OR REPLACE FUNCTION public.revoke_all_user_devices(p_user_id UUID, p_user_type TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  UPDATE trusted_devices SET revoked = true WHERE user_id = p_user_id AND user_type = p_user_type;
  RETURN true;
END;
$$;

-- Get all devices for a user
CREATE OR REPLACE FUNCTION public.get_user_devices(p_user_id UUID, p_user_type TEXT)
RETURNS TABLE(id UUID, device_name TEXT, user_agent TEXT, created_at TIMESTAMPTZ, last_seen TIMESTAMPTZ, revoked BOOLEAN) LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  RETURN QUERY
  SELECT td.id, td.device_name, td.user_agent, td.created_at, td.last_seen, td.revoked
  FROM trusted_devices td
  WHERE td.user_id = p_user_id AND td.user_type = p_user_type
  ORDER BY td.last_seen DESC;
END;
$$;

-- Cleanup old payment proof screenshots (approved/rejected > 3 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_payment_proofs()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT ps.id FROM payment_submissions ps
    WHERE ps.status IN ('approved', 'rejected')
      AND ps.reviewed_at IS NOT NULL
      AND ps.reviewed_at < (NOW() - INTERVAL '3 days')
      AND array_length(ps.screenshot_urls, 1) > 0
      AND ps.screenshot_urls[1] != ''
  LOOP
    UPDATE payment_submissions SET screenshot_urls = ARRAY[]::text[] WHERE id = r.id;
  END LOOP;
END;
$$;

-- Trigger: notify all admins when a payment proof is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_on_payment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_admin RECORD; v_student_name TEXT;
BEGIN
  SELECT full_name INTO v_student_name FROM students WHERE id = NEW.student_id;
  FOR v_admin IN SELECT id FROM admins WHERE is_active = true
  LOOP
    INSERT INTO notifications (user_id, user_type, type, title, message, action_url)
    VALUES (v_admin.id, 'admin', 'payment', 'New Payment Pending',
      'Payment proof submitted by ' || COALESCE(v_student_name, 'a student') || ' for ' || NEW.amount || ' ETB.',
      '/admin/payment-approvals');
  END LOOP;
  RETURN NEW;
END;
$$;

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER notify_admins_on_payment_insert
  AFTER INSERT ON public.payment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.notify_admins_on_payment();

-- =============================================
-- STORAGE BUCKETS
-- =============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('payment-proofs', 'payment-proofs', true);
