INSERT INTO public.app_settings (setting_key, setting_value, description)
VALUES ('admin_access_code', '123456', 'Access code required to reach admin login from browser')
ON CONFLICT (setting_key) DO NOTHING;