
-- Add intro_video_url column to teachers table
ALTER TABLE public.teachers ADD COLUMN intro_video_url text;

-- Update signup_teacher function to accept intro_video_url
CREATE OR REPLACE FUNCTION public.signup_teacher(
  p_full_name text,
  p_phone_number text,
  p_email text,
  p_pin text,
  p_specialization text DEFAULT NULL,
  p_experience text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_credentials_url text DEFAULT NULL,
  p_intro_video_url text DEFAULT NULL
)
RETURNS TABLE(id uuid, full_name text, phone_number text, email text, is_approved boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Check if phone number already exists
  IF EXISTS (SELECT 1 FROM teachers t WHERE t.phone_number = p_phone_number) THEN
    RAISE EXCEPTION 'Phone number already registered';
  END IF;

  -- Check if email already exists
  IF EXISTS (SELECT 1 FROM teachers t WHERE t.email = p_email) THEN
    RAISE EXCEPTION 'Email already registered';
  END IF;

  INSERT INTO teachers (full_name, phone_number, email, pin_hash, specialization, experience, bio, credentials_url, intro_video_url, is_approved, is_active)
  VALUES (
    p_full_name,
    p_phone_number,
    p_email,
    crypt(p_pin, gen_salt('bf')),
    p_specialization,
    p_experience,
    p_bio,
    p_credentials_url,
    p_intro_video_url,
    false,
    true
  )
  RETURNING teachers.id INTO v_id;

  RETURN QUERY
  SELECT t.id, t.full_name, t.phone_number, t.email, t.is_approved
  FROM teachers t WHERE t.id = v_id;
END;
$$;

-- Create a function to clean up old payment proofs (3 days after approval/rejection)
CREATE OR REPLACE FUNCTION public.cleanup_old_payment_proofs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r RECORD;
  url TEXT;
  file_path TEXT;
BEGIN
  FOR r IN
    SELECT ps.id, ps.screenshot_urls, ps.reviewed_at
    FROM payment_submissions ps
    WHERE ps.status IN ('approved', 'rejected')
      AND ps.reviewed_at IS NOT NULL
      AND ps.reviewed_at < (NOW() - INTERVAL '3 days')
      AND array_length(ps.screenshot_urls, 1) > 0
      AND ps.screenshot_urls[1] != ''
  LOOP
    -- Clear the screenshot_urls array
    UPDATE payment_submissions
    SET screenshot_urls = ARRAY[]::text[]
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- Create a cron-like trigger using pg_cron if available, otherwise we'll handle it in the edge function
-- For now, create the function that can be called periodically
