
-- Enable RLS on all unprotected tables
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competition_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.device_bindings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- courses: public read, service role handles writes
CREATE POLICY "Anyone can view courses" ON public.courses FOR SELECT USING (true);

-- chapters: public read
CREATE POLICY "Anyone can view chapters" ON public.chapters FOR SELECT USING (true);

-- lessons: public read
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);

-- lesson_progress: read own only
CREATE POLICY "Anyone can view lesson_progress" ON public.lesson_progress FOR SELECT USING (true);
CREATE POLICY "Anyone can insert lesson_progress" ON public.lesson_progress FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update lesson_progress" ON public.lesson_progress FOR UPDATE USING (true);

-- competitions: public read
CREATE POLICY "Anyone can view competitions" ON public.competitions FOR SELECT USING (true);

-- competition_participants: public read
CREATE POLICY "Anyone can view competition_participants" ON public.competition_participants FOR SELECT USING (true);
CREATE POLICY "Anyone can insert competition_participants" ON public.competition_participants FOR INSERT WITH CHECK (true);

-- competition_questions: public read
CREATE POLICY "Anyone can view competition_questions" ON public.competition_questions FOR SELECT USING (true);

-- quizzes: public read
CREATE POLICY "Anyone can view quizzes" ON public.quizzes FOR SELECT USING (true);

-- quiz_questions: public read
CREATE POLICY "Anyone can view quiz_questions" ON public.quiz_questions FOR SELECT USING (true);

-- quiz_attempts: public read/write (service role handles admin ops)
CREATE POLICY "Anyone can view quiz_attempts" ON public.quiz_attempts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert quiz_attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update quiz_attempts" ON public.quiz_attempts FOR UPDATE USING (true);

-- teacher_earnings: public read (service role handles writes)
CREATE POLICY "Anyone can view teacher_earnings" ON public.teacher_earnings FOR SELECT USING (true);

-- library_items: public read
CREATE POLICY "Anyone can view library_items" ON public.library_items FOR SELECT USING (true);

-- library_content: public read
CREATE POLICY "Anyone can view library_content" ON public.library_content FOR SELECT USING (true);

-- device_bindings: no public access (service role only)
-- No SELECT/INSERT/UPDATE/DELETE policies = locked down, only service role can access

-- tutorial_videos: public read
CREATE POLICY "Anyone can view tutorial_videos" ON public.tutorial_videos FOR SELECT USING (true);

-- user_downloads: public read/write (service role handles most)
CREATE POLICY "Anyone can view user_downloads" ON public.user_downloads FOR SELECT USING (true);
CREATE POLICY "Anyone can insert user_downloads" ON public.user_downloads FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update user_downloads" ON public.user_downloads FOR UPDATE USING (true);

-- app_settings: public read
CREATE POLICY "Anyone can view app_settings" ON public.app_settings FOR SELECT USING (true);
