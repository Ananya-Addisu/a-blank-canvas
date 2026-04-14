-- Fix all functions missing search_path

ALTER FUNCTION public.check_device_binding(uuid, text, text) SET search_path TO 'public', 'extensions';
ALTER FUNCTION public.get_dashboard_stats() SET search_path TO 'public', 'extensions';
ALTER FUNCTION public.bind_device(uuid, text, text, text, text, text) SET search_path TO 'public', 'extensions';
ALTER FUNCTION public.reset_device_binding(uuid, text) SET search_path TO 'public', 'extensions';
ALTER FUNCTION public.approve_content(text, uuid, uuid) SET search_path TO 'public', 'extensions';
ALTER FUNCTION public.reject_content(text, uuid, uuid, text) SET search_path TO 'public', 'extensions';
ALTER FUNCTION public.update_updated_at_column() SET search_path TO 'public';

-- Fix the old signup_teacher overload (without intro_video_url)
ALTER FUNCTION public.signup_teacher(text, text, text, text, text, text, text, text) SET search_path TO 'public', 'extensions';