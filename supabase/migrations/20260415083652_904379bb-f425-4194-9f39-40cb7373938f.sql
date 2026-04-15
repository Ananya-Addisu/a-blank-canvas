
-- Drop restrictive RLS policies on notifications that use auth.uid() (which never works with custom PIN auth)
DROP POLICY IF EXISTS "Admins can create notifications for anyone" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;

-- Create permissive policies matching the rest of the app
CREATE POLICY "Anyone can view notifications"
ON public.notifications FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can update notifications"
ON public.notifications FOR UPDATE
USING (true);

CREATE POLICY "Anyone can delete notifications"
ON public.notifications FOR DELETE
USING (true);
