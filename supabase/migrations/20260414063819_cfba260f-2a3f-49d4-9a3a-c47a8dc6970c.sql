
-- Add course_id to library_content to link items to courses
ALTER TABLE public.library_content ADD COLUMN IF NOT EXISTS course_id uuid REFERENCES public.courses(id) ON DELETE SET NULL;

-- Add content_markdown for storing markdown content (books/exams)
ALTER TABLE public.library_content ADD COLUMN IF NOT EXISTS content_markdown text;

-- Make file_url nullable for markdown-based content
ALTER TABLE public.library_content ALTER COLUMN file_url DROP NOT NULL;
ALTER TABLE public.library_content ALTER COLUMN file_url SET DEFAULT '';

-- Default approval_status to 'approved' for admin-created content  
ALTER TABLE public.library_content ALTER COLUMN approval_status SET DEFAULT 'approved';
