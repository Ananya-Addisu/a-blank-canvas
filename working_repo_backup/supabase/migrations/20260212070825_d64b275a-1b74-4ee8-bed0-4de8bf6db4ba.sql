
-- Function to update student credentials (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_student(
  p_student_id uuid,
  p_full_name text DEFAULT NULL,
  p_phone_number text DEFAULT NULL,
  p_pin text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_institution text DEFAULT NULL,
  p_academic_year text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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

-- Function to update teacher credentials (admin only)
CREATE OR REPLACE FUNCTION public.admin_update_teacher(
  p_teacher_id uuid,
  p_full_name text DEFAULT NULL,
  p_phone_number text DEFAULT NULL,
  p_pin text DEFAULT NULL,
  p_email text DEFAULT NULL,
  p_specialization text DEFAULT NULL,
  p_experience text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
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
