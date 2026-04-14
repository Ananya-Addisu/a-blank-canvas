
-- Create a trigger function that notifies all active admins when a payment is submitted
CREATE OR REPLACE FUNCTION public.notify_admins_on_payment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_admin RECORD;
  v_student_name TEXT;
BEGIN
  -- Get student name
  SELECT full_name INTO v_student_name FROM students WHERE id = NEW.student_id;

  -- Insert a notification for each active admin
  FOR v_admin IN SELECT id FROM admins WHERE is_active = true
  LOOP
    INSERT INTO notifications (user_id, user_type, type, title, message, action_url)
    VALUES (
      v_admin.id,
      'admin',
      'payment',
      'New Payment Pending',
      'Payment proof submitted by ' || COALESCE(v_student_name, 'a student') || ' for ' || NEW.amount || ' ETB.',
      '/admin/payment-approvals'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

-- Create the trigger
CREATE TRIGGER on_payment_submitted
  AFTER INSERT ON public.payment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_admins_on_payment();
