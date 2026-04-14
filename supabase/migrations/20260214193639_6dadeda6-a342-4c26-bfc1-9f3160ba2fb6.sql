-- Update signup_student to include extensions in search_path
CREATE OR REPLACE FUNCTION public.signup_student(p_full_name text, p_phone_number text, p_pin text, p_email text DEFAULT NULL::text, p_academic_year text DEFAULT NULL::text, p_gender text DEFAULT NULL::text, p_stream text DEFAULT NULL::text, p_institution text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, full_name text, phone_number text, email text, is_approved boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_student_id UUID;
BEGIN
  IF EXISTS (SELECT 1 FROM students s WHERE s.phone_number = p_phone_number) THEN
    RAISE EXCEPTION 'Phone number already registered';
  END IF;

  INSERT INTO students (full_name, phone_number, pin_hash, email, academic_year, gender, stream, institution, is_approved)
  VALUES (p_full_name, p_phone_number, crypt(p_pin, gen_salt('bf')), p_email, p_academic_year, p_gender, p_stream, p_institution, true)
  RETURNING students.id INTO v_student_id;

  RETURN QUERY SELECT s.id, s.full_name, s.phone_number, s.email, s.is_approved FROM students s WHERE s.id = v_student_id;
END;
$function$;

-- Update signup_teacher (with intro_video_url) to include extensions in search_path
CREATE OR REPLACE FUNCTION public.signup_teacher(p_full_name text, p_phone_number text, p_email text, p_pin text, p_specialization text DEFAULT NULL::text, p_experience text DEFAULT NULL::text, p_bio text DEFAULT NULL::text, p_credentials_url text DEFAULT NULL::text, p_intro_video_url text DEFAULT NULL::text)
 RETURNS TABLE(id uuid, full_name text, phone_number text, email text, is_approved boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_id uuid;
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
$function$;

-- Update admin_update_student
CREATE OR REPLACE FUNCTION public.admin_update_student(p_student_id uuid, p_full_name text DEFAULT NULL::text, p_phone_number text DEFAULT NULL::text, p_pin text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_institution text DEFAULT NULL::text, p_academic_year text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
$function$;

-- Update admin_update_teacher
CREATE OR REPLACE FUNCTION public.admin_update_teacher(p_teacher_id uuid, p_full_name text DEFAULT NULL::text, p_phone_number text DEFAULT NULL::text, p_pin text DEFAULT NULL::text, p_email text DEFAULT NULL::text, p_specialization text DEFAULT NULL::text, p_experience text DEFAULT NULL::text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
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
$function$;