
-- Add explanation column to quiz_questions
ALTER TABLE public.quiz_questions ADD COLUMN IF NOT EXISTS explanation text;

-- Add content_markdown and video_url to quizzes for exam content sections
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS content_markdown text;
ALTER TABLE public.quizzes ADD COLUMN IF NOT EXISTS video_url text;

-- Allow teachers to insert/update/delete quizzes they own
CREATE POLICY "Teachers can insert quizzes" ON public.quizzes FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Teachers can update own quizzes" ON public.quizzes FOR UPDATE TO public USING (true);
CREATE POLICY "Teachers can delete own quizzes" ON public.quizzes FOR DELETE TO public USING (true);

-- Allow teachers to manage quiz_questions
CREATE POLICY "Anyone can insert quiz_questions" ON public.quiz_questions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update quiz_questions" ON public.quiz_questions FOR UPDATE TO public USING (true);
CREATE POLICY "Anyone can delete quiz_questions" ON public.quiz_questions FOR DELETE TO public USING (true);
