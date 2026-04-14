
-- Stable Device Tracking
ALTER TABLE trusted_devices ADD COLUMN IF NOT EXISTS hardware_id TEXT;

-- Student Preferences
ALTER TABLE students ADD COLUMN IF NOT EXISTS hide_how_to_use_tooltip BOOLEAN DEFAULT false;

-- Advanced Competitions: Gating and Timing
ALTER TABLE competitions 
ADD COLUMN IF NOT EXISTS gated_course_id UUID REFERENCES courses(id),
ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_finished BOOLEAN DEFAULT false;

-- Student Competition Participation & Exam Flow
CREATE TABLE IF NOT EXISTS student_competitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    competition_id UUID REFERENCES competitions(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    status TEXT DEFAULT 'in_progress',
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, competition_id)
);

-- RLS for student_competitions
ALTER TABLE student_competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view student_competitions" ON student_competitions FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can insert student_competitions" ON student_competitions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can update student_competitions" ON student_competitions FOR UPDATE TO public USING (true);
