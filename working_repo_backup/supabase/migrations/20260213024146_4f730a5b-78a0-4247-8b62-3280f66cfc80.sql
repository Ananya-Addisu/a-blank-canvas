
-- Add expires_at column to enrollments for 6-month access expiration
ALTER TABLE public.enrollments ADD COLUMN expires_at timestamp with time zone;

-- Update existing approved enrollments to expire 6 months from their approval (updated_at)
UPDATE public.enrollments 
SET expires_at = updated_at + INTERVAL '6 months'
WHERE status = 'approved' AND expires_at IS NULL;

-- Seed TOS and Privacy Policy settings
INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES 
  ('terms_of_service', 'Enter your Terms of Service here.', 'Terms of Service content shown to users'),
  ('privacy_policy', 'Enter your Privacy Policy here.', 'Privacy Policy content shown to users')
ON CONFLICT (setting_key) DO NOTHING;
