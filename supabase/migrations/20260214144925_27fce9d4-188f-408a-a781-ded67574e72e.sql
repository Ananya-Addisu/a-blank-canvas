
-- Add download_url and is_downloadable columns to lessons
ALTER TABLE public.lessons 
ADD COLUMN download_url text DEFAULT NULL,
ADD COLUMN is_downloadable boolean DEFAULT false;

-- Add comment for clarity
COMMENT ON COLUMN public.lessons.download_url IS 'Google Drive URL for offline download';
COMMENT ON COLUMN public.lessons.is_downloadable IS 'Whether students can download this lesson';
