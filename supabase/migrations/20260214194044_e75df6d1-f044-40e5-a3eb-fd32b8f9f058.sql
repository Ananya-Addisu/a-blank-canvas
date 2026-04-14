-- Fix verify_student_login
CREATE OR REPLACE FUNCTION public.verify_student_login(p_phone_number text, p_pin text)
 RETURNS TABLE(id uuid, full_name text, phone_number text, email text, academic_year text, gender text, stream text, institution text, is_approved boolean, is_active boolean, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  RETURN QUERY
  SELECT s.id, s.full_name, s.phone_number, s.email, s.academic_year, s.gender, s.stream, s.institution, s.is_approved, s.is_active, s.created_at
  FROM students s
  WHERE s.phone_number = p_phone_number
    AND s.pin_hash = crypt(p_pin, s.pin_hash)
    AND s.is_active = true;
END;
$function$;

-- Fix verify_teacher_login
CREATE OR REPLACE FUNCTION public.verify_teacher_login(p_phone_number text, p_pin text)
 RETURNS TABLE(id uuid, full_name text, phone_number text, email text, specialization text, experience text, bio text, credentials_url text, is_approved boolean, is_active boolean, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  RETURN QUERY
  SELECT t.id, t.full_name, t.phone_number, t.email, t.specialization, t.experience, t.bio, t.credentials_url, t.is_approved, t.is_active, t.created_at
  FROM teachers t
  WHERE t.phone_number = p_phone_number
    AND t.pin_hash = crypt(p_pin, t.pin_hash)
    AND t.is_active = true;
END;
$function$;

-- Fix verify_admin_login
CREATE OR REPLACE FUNCTION public.verify_admin_login(p_phone_number text, p_pin text)
 RETURNS TABLE(id uuid, full_name text, phone_number text, role text, is_active boolean, created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
BEGIN
  RETURN QUERY
  SELECT a.id, a.full_name, a.phone_number, a.role, a.is_active, a.created_at
  FROM admins a
  WHERE a.phone_number = p_phone_number
    AND a.pin_hash = crypt(p_pin, a.pin_hash)
    AND a.is_active = true;
END;
$function$;