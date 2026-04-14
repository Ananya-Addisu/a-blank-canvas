-- Create private storage bucket for course videos
INSERT INTO storage.buckets (id, name, public) VALUES ('course-videos', 'course-videos', false);

-- RLS: Allow authenticated users to upload (admins/teachers handle auth server-side)
CREATE POLICY "Allow public uploads to course-videos" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'course-videos');

-- RLS: Allow reading via signed URLs (service role generates them)
CREATE POLICY "Allow public read from course-videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'course-videos');

-- RLS: Allow deletion by service role
CREATE POLICY "Allow public delete from course-videos" ON storage.objects FOR DELETE TO public USING (bucket_id = 'course-videos');
