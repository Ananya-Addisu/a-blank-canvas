
CREATE OR REPLACE FUNCTION public.signup_student(
  p_full_name text,
  p_phone_number text,
  p_pin text,
  p_email text DEFAULT NULL,
  p_academic_year text DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_stream text DEFAULT NULL,
  p_institution text DEFAULT NULL
)
RETURNS TABLE(id uuid, full_name text, phone_number text, email text, is_approved boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_id UUID;
BEGIN
  -- Check if phone number exists
  IF EXISTS (SELECT 1 FROM students s WHERE s.phone_number = p_phone_number) THEN
    RAISE EXCEPTION 'Phone number already registered';
  END IF;

  -- Insert new student (auto-approved)
  INSERT INTO students (
    full_name,
    phone_number,
    pin_hash,
    email,
    academic_year,
    gender,
    stream,
    institution,
    is_approved
  ) VALUES (
    p_full_name,
    p_phone_number,
    crypt(p_pin, gen_salt('bf')),
    p_email,
    p_academic_year,
    p_gender,
    p_stream,
    p_institution,
    true
  ) RETURNING students.id INTO v_student_id;

  -- Return student info
  RETURN QUERY
  SELECT 
    s.id,
    s.full_name,
    s.phone_number,
    s.email,
    s.is_approved
  FROM students s
  WHERE s.id = v_student_id;
END;
$$;
