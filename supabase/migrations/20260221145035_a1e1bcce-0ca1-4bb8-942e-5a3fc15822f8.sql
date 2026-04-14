
-- 1. Add is_bundle_exclusive column to courses
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_bundle_exclusive boolean DEFAULT false;

-- 2. Create update_student_pin function (missing - that's why PIN change doesn't work)
CREATE OR REPLACE FUNCTION public.update_student_pin(p_student_id uuid, p_new_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
  UPDATE students 
  SET pin_hash = crypt(p_new_pin, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_student_id;
  RETURN true;
END;
$$;

-- 3. Add last_logout_at columns to students and teachers
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_logout_at timestamp with time zone DEFAULT NULL;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS last_logout_at timestamp with time zone DEFAULT NULL;
