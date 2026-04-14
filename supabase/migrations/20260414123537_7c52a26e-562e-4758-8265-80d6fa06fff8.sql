ALTER TABLE public.popup_notices
  ADD COLUMN link_type text DEFAULT NULL,
  ADD COLUMN link_id uuid DEFAULT NULL,
  ADD COLUMN button_text text DEFAULT NULL;

COMMENT ON COLUMN public.popup_notices.link_type IS 'course or bundle';
COMMENT ON COLUMN public.popup_notices.link_id IS 'ID of the linked course or bundle';
COMMENT ON COLUMN public.popup_notices.button_text IS 'Custom button label shown below the image';