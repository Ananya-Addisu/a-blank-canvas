
-- Update the admin_access_code to the new default value
UPDATE app_settings 
SET setting_value = '2894546932', updated_at = now()
WHERE setting_key = 'admin_access_code';

-- If it doesn't exist, insert it
INSERT INTO app_settings (setting_key, setting_value, description)
VALUES ('admin_access_code', '2894546932', 'Access code required to enter admin panel from browser')
ON CONFLICT (setting_key) DO UPDATE SET setting_value = '2894546932', updated_at = now();
