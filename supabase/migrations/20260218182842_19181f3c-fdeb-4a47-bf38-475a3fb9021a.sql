
-- Create trusted_devices table
CREATE TABLE public.trusted_devices (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  user_type text NOT NULL,
  device_token_hash text NOT NULL,
  device_name text,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_seen timestamp with time zone NOT NULL DEFAULT now(),
  revoked boolean NOT NULL DEFAULT false
);

-- Create index for fast token lookup
CREATE INDEX idx_trusted_devices_token_hash ON public.trusted_devices (device_token_hash);
CREATE INDEX idx_trusted_devices_user ON public.trusted_devices (user_id, user_type);

-- Enable RLS
ALTER TABLE public.trusted_devices ENABLE ROW LEVEL SECURITY;

-- RLS: Allow all operations via service role / SECURITY DEFINER functions
-- The anon key needs SELECT for device verification during login
CREATE POLICY "Allow select on trusted_devices" ON public.trusted_devices
  FOR SELECT USING (true);

CREATE POLICY "Allow insert on trusted_devices" ON public.trusted_devices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update on trusted_devices" ON public.trusted_devices
  FOR UPDATE USING (true);

-- Create RPC to verify device token (SECURITY DEFINER to bypass RLS)
CREATE OR REPLACE FUNCTION public.verify_device_token(
  p_user_id uuid,
  p_user_type text,
  p_device_token_hash text
)
RETURNS TABLE(device_id uuid, device_name text, is_valid boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT td.id, td.device_name, true
  FROM trusted_devices td
  WHERE td.user_id = p_user_id
    AND td.user_type = p_user_type
    AND td.device_token_hash = p_device_token_hash
    AND td.revoked = false;

  -- If found, update last_seen
  UPDATE trusted_devices
  SET last_seen = now()
  WHERE user_id = p_user_id
    AND user_type = p_user_type
    AND device_token_hash = p_device_token_hash
    AND revoked = false;
END;
$$;

-- Create RPC to register a new device
CREATE OR REPLACE FUNCTION public.register_trusted_device(
  p_user_id uuid,
  p_user_type text,
  p_device_token_hash text,
  p_device_name text DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS TABLE(device_id uuid, success boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO trusted_devices (user_id, user_type, device_token_hash, device_name, user_agent)
  VALUES (p_user_id, p_user_type, p_device_token_hash, p_device_name, p_user_agent)
  RETURNING id INTO v_id;

  RETURN QUERY SELECT v_id, true;
END;
$$;

-- Create RPC to revoke a device (for admin use)
CREATE OR REPLACE FUNCTION public.revoke_trusted_device(p_device_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE trusted_devices SET revoked = true WHERE id = p_device_id;
  RETURN true;
END;
$$;

-- Create RPC to revoke all devices for a user
CREATE OR REPLACE FUNCTION public.revoke_all_user_devices(p_user_id uuid, p_user_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE trusted_devices SET revoked = true
  WHERE user_id = p_user_id AND user_type = p_user_type;
  RETURN true;
END;
$$;

-- Create RPC to get user devices (for admin view)
CREATE OR REPLACE FUNCTION public.get_user_devices(p_user_id uuid, p_user_type text)
RETURNS TABLE(id uuid, device_name text, user_agent text, created_at timestamptz, last_seen timestamptz, revoked boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT td.id, td.device_name, td.user_agent, td.created_at, td.last_seen, td.revoked
  FROM trusted_devices td
  WHERE td.user_id = p_user_id AND td.user_type = p_user_type
  ORDER BY td.last_seen DESC;
END;
$$;
