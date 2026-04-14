-- Add display_order to courses and bundles for home page ordering
ALTER TABLE courses ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;
ALTER TABLE bundles ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Add RLS policies for courses CRUD (needed for admin operations via anon key fallback)
CREATE POLICY "Allow insert on courses" ON courses FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on courses" ON courses FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on courses" ON courses FOR DELETE TO public USING (true);

-- Add RLS policies for chapters CRUD
CREATE POLICY "Allow insert on chapters" ON chapters FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on chapters" ON chapters FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on chapters" ON chapters FOR DELETE TO public USING (true);

-- Add RLS policies for lessons CRUD
CREATE POLICY "Allow insert on lessons" ON lessons FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on lessons" ON lessons FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on lessons" ON lessons FOR DELETE TO public USING (true);

-- Add RLS policies for library_items CRUD
CREATE POLICY "Allow insert on library_items" ON library_items FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on library_items" ON library_items FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on library_items" ON library_items FOR DELETE TO public USING (true);

-- Add RLS policies for library_content CRUD
CREATE POLICY "Allow insert on library_content" ON library_content FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on library_content" ON library_content FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on library_content" ON library_content FOR DELETE TO public USING (true);

-- Add RLS policies for students INSERT (for admin adding users)
CREATE POLICY "Allow insert on students" ON students FOR INSERT TO public WITH CHECK (true);

-- Add RLS policies for competitions CRUD
CREATE POLICY "Allow insert on competitions" ON competitions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on competitions" ON competitions FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on competitions" ON competitions FOR DELETE TO public USING (true);

-- Add RLS policy for competition_questions CRUD
CREATE POLICY "Allow insert on competition_questions" ON competition_questions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on competition_questions" ON competition_questions FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on competition_questions" ON competition_questions FOR DELETE TO public USING (true);

-- Add RLS policies for tutorial_videos CRUD
CREATE POLICY "Allow insert on tutorial_videos" ON tutorial_videos FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow update on tutorial_videos" ON tutorial_videos FOR UPDATE TO public USING (true);
CREATE POLICY "Allow delete on tutorial_videos" ON tutorial_videos FOR DELETE TO public USING (true);

-- Add DELETE policy for students (for admin rejecting)
CREATE POLICY "Allow delete on students" ON students FOR DELETE TO public USING (true);