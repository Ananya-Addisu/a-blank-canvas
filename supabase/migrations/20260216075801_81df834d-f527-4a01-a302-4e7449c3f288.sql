
-- Update check_device_binding to also check if the device is already bound to another user
CREATE OR REPLACE FUNCTION public.check_device_binding(p_user_id uuid, p_user_type text, p_device_fingerprint text)
 RETURNS TABLE(is_bound boolean, bound_device text, message text)
 LANGUAGE plpgsql
 SET search_path TO 'public', 'extensions'
AS $function$
DECLARE
  v_binding RECORD;
  v_other_binding RECORD;
BEGIN
  -- First: check if THIS DEVICE is already bound to a DIFFERENT user
  SELECT * INTO v_other_binding
  FROM device_bindings
  WHERE device_fingerprint = p_device_fingerprint
    AND is_active = true
    AND (user_id != p_user_id OR user_type != p_user_type);
  
  IF FOUND THEN
    RETURN QUERY SELECT false, v_other_binding.device_model, 'Device already bound to another account'::TEXT;
    RETURN;
  END IF;

  -- Then: check if this USER has a device binding
  SELECT * INTO v_binding
  FROM device_bindings
  WHERE user_id = p_user_id 
    AND user_type = p_user_type
    AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT false, NULL::TEXT, 'No device bound'::TEXT;
    RETURN;
  END IF;
  
  -- Check if the fingerprint matches
  IF v_binding.device_fingerprint = p_device_fingerprint THEN
    UPDATE device_bindings 
    SET last_accessed = now()
    WHERE id = v_binding.id;
    
    RETURN QUERY SELECT true, v_binding.device_model, 'Device verified'::TEXT;
  ELSE
    RETURN QUERY SELECT false, v_binding.device_model, 'Different device detected'::TEXT;
  END IF;
END;
$function$;
