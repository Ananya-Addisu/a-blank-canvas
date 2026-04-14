import { randomBytes, createHash } from 'crypto';
import { supabaseAdmin as supabase } from '~/lib/supabase.server';

/**
 * Secure Server-Generated Device Token Binding
 * 
 * The server generates and controls device identity via:
 * - Cryptographically secure random 256-bit device tokens
 * - SHA256 hashing before DB storage
 * - HttpOnly + Secure + SameSite=Strict cookies
 */

const COOKIE_NAME = 'device_token';
const COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days in seconds

/** Generate a cryptographically secure 256-bit device token */
export function generateDeviceToken(): string {
  return randomBytes(32).toString('hex');
}

/** SHA256 hash a device token for safe DB storage */
export function hashDeviceToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Build the Set-Cookie header for a device token */
export function buildDeviceTokenCookie(token: string): string {
  const isProduction = process.env.NODE_ENV === 'production';
  const parts = [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Path=/',
    `Max-Age=${COOKIE_MAX_AGE}`,
    'SameSite=Strict',
  ];
  if (isProduction) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/** Extract device_token from request cookies */
export function getDeviceTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map(c => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split('=');
    if (name.trim() === COOKIE_NAME) {
      return valueParts.join('=').trim() || null;
    }
  }
  return null;
}

/** Extract a short device name from the User-Agent header */
function getDeviceNameFromUA(request: Request): string {
  const ua = request.headers.get('user-agent') || 'Unknown';
  
  if (ua.includes('Android')) return 'Android Device';
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('iPad')) return 'iPad';
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Mac OS')) return 'Mac';
  if (ua.includes('Linux')) return 'Linux PC';
  return 'Unknown Device';
}

/**
 * Verify if the request has a valid trusted device token for the given user.
 * Falls back to hardware_id check if cookie is missing.
 */
export async function verifyDeviceToken(
  request: Request,
  userId: string,
  userType: 'student' | 'teacher' | 'admin',
  hardwareId?: string
): Promise<{ trusted: boolean; deviceId?: string; deviceName?: string }> {
  const token = getDeviceTokenFromRequest(request);
  
  // Try cookie-based verification first
  if (token) {
    const tokenHash = hashDeviceToken(token);
    try {
      const { data, error } = await supabase.rpc('verify_device_token', {
        p_user_id: userId,
        p_user_type: userType,
        p_device_token_hash: tokenHash,
      });

      if (!error && data && data.length > 0 && data[0].is_valid) {
        console.log('[TrustedDevice] Device verified via cookie');
        return { trusted: true, deviceId: data[0].device_id, deviceName: data[0].device_name };
      }
    } catch (err) {
      console.error('[TrustedDevice] Cookie verify exception:', err);
    }
    
    // Try direct query fallback for cookie
    const result = await verifyDeviceTokenDirect(userId, userType, tokenHash);
    if (result.trusted) return result;
  }

  // Fallback: check hardware_id if provided
  if (hardwareId) {
    console.log('[TrustedDevice] Cookie missing/invalid, trying hardware_id fallback');
    const result = await verifyByHardwareId(userId, userType, hardwareId);
    if (result.trusted) return result;
  }

  console.log('[TrustedDevice] No valid device token or hardware_id match');
  return { trusted: false };
}

/** Direct DB fallback for verification */
async function verifyDeviceTokenDirect(
  userId: string,
  userType: string,
  tokenHash: string
): Promise<{ trusted: boolean; deviceId?: string; deviceName?: string }> {
  try {
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('id, device_name')
      .eq('user_id', userId)
      .eq('user_type', userType)
      .eq('device_token_hash', tokenHash)
      .eq('revoked', false)
      .limit(1);

    if (error) {
      console.error('[TrustedDevice] Direct verify query failed:', error.message);
      return { trusted: false };
    }

    if (data && data.length > 0) {
      await supabase
        .from('trusted_devices')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', data[0].id);
      return { trusted: true, deviceId: data[0].id, deviceName: data[0].device_name };
    }

    return { trusted: false };
  } catch (err) {
    console.error('[TrustedDevice] Direct verify exception:', err);
    return { trusted: false };
  }
}

/** Verify by hardware_id (Capacitor Device UUID) */
async function verifyByHardwareId(
  userId: string,
  userType: string,
  hardwareId: string
): Promise<{ trusted: boolean; deviceId?: string; deviceName?: string }> {
  try {
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('id, device_name')
      .eq('user_id', userId)
      .eq('user_type', userType)
      .eq('hardware_id', hardwareId)
      .eq('revoked', false)
      .limit(1);

    if (error) {
      console.error('[TrustedDevice] hardware_id verify error:', error.message);
      return { trusted: false };
    }

    if (data && data.length > 0) {
      // Update last_seen
      await supabase
        .from('trusted_devices')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', data[0].id);
      console.log('[TrustedDevice] Device verified via hardware_id');
      return { trusted: true, deviceId: data[0].id, deviceName: data[0].device_name };
    }

    return { trusted: false };
  } catch (err) {
    console.error('[TrustedDevice] hardware_id verify exception:', err);
    return { trusted: false };
  }
}

/**
 * Check if the user has ANY active (non-revoked) trusted device.
 * Used to determine if login from a new device should be blocked.
 */
export async function hasExistingTrustedDevice(
  userId: string,
  userType: 'student' | 'teacher' | 'admin'
): Promise<{ exists: boolean; deviceName?: string }> {
  try {
    const { data, error } = await supabase
      .from('trusted_devices')
      .select('id, device_name')
      .eq('user_id', userId)
      .eq('user_type', userType)
      .eq('revoked', false)
      .limit(1);

    if (error) {
      console.error('[TrustedDevice] hasExisting query error:', error.message);
      return { exists: false };
    }

    if (data && data.length > 0) {
      return { exists: true, deviceName: data[0].device_name || 'Unknown' };
    }

    return { exists: false };
  } catch (err) {
    console.error('[TrustedDevice] hasExisting exception:', err);
    return { exists: false };
  }
}

/**
 * Register a new trusted device for the user.
 * Returns the raw device token (to be set as cookie) and the DB record id.
 */
export async function registerTrustedDevice(
  request: Request,
  userId: string,
  userType: 'student' | 'teacher' | 'admin',
  hardwareId?: string
): Promise<{ token: string; deviceId?: string; success: boolean }> {
  const token = generateDeviceToken();
  const tokenHash = hashDeviceToken(token);
  const deviceName = getDeviceNameFromUA(request);
  const userAgent = request.headers.get('user-agent') || 'Unknown';

  try {
    // Try RPC first
    const { data, error } = await supabase.rpc('register_trusted_device', {
      p_user_id: userId,
      p_user_type: userType,
      p_device_token_hash: tokenHash,
      p_device_name: deviceName,
      p_user_agent: userAgent,
    });

    if (error) {
      console.error('[TrustedDevice] RPC register error:', error.message);
      return await registerTrustedDeviceDirect(token, tokenHash, userId, userType, deviceName, userAgent, hardwareId);
    }

    if (data && data.length > 0) {
      console.log('[TrustedDevice] Device registered via RPC, id:', data[0].device_id);
      return { token, deviceId: data[0].device_id, success: true };
    }

    return await registerTrustedDeviceDirect(token, tokenHash, userId, userType, deviceName, userAgent, hardwareId);
  } catch (err) {
    console.error('[TrustedDevice] Register exception:', err);
    return await registerTrustedDeviceDirect(token, tokenHash, userId, userType, deviceName, userAgent, hardwareId);
  }
}

/** Direct DB fallback for registration */
async function registerTrustedDeviceDirect(
  token: string,
  tokenHash: string,
  userId: string,
  userType: string,
  deviceName: string,
  userAgent: string,
  hwId?: string
): Promise<{ token: string; deviceId?: string; success: boolean }> {
  try {
    const { data, error } = await supabase
      .from('trusted_devices')
      .insert({
        user_id: userId,
        user_type: userType,
        device_token_hash: tokenHash,
        device_name: deviceName,
        user_agent: userAgent,
        ...(hwId ? { hardware_id: hwId } : {}),
      })
      .select('id')
      .single();

    if (error) {
      console.error('[TrustedDevice] Direct insert failed:', error.message);
      return { token, success: false };
    }

    console.log('[TrustedDevice] Device registered directly, id:', data?.id);
    return { token, deviceId: data?.id, success: true };
  } catch (err) {
    console.error('[TrustedDevice] Direct insert exception:', err);
    return { token, success: false };
  }
}

/**
 * Revoke a specific trusted device by id.
 */
export async function revokeDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.rpc('revoke_trusted_device', { p_device_id: deviceId });
    if (error) {
      console.error('[TrustedDevice] Revoke RPC error:', error.message);
      // Fallback
      const { error: updateErr } = await supabase
        .from('trusted_devices')
        .update({ revoked: true })
        .eq('id', deviceId);
      if (updateErr) {
        return { success: false, message: 'Failed to revoke device' };
      }
    }
    return { success: true, message: 'Device revoked successfully' };
  } catch (err) {
    console.error('[TrustedDevice] Revoke exception:', err);
    return { success: false, message: 'Error revoking device' };
  }
}

/**
 * Revoke ALL devices for a user (admin "log out from all devices").
 */
export async function revokeAllDevices(
  userId: string,
  userType: 'student' | 'teacher' | 'admin'
): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.rpc('revoke_all_user_devices', {
      p_user_id: userId,
      p_user_type: userType,
    });
    if (error) {
      console.error('[TrustedDevice] RevokeAll RPC error:', error.message);
      const { error: updateErr } = await supabase
        .from('trusted_devices')
        .update({ revoked: true })
        .eq('user_id', userId)
        .eq('user_type', userType);
      if (updateErr) {
        return { success: false, message: 'Failed to revoke all devices' };
      }
    }
    return { success: true, message: 'All devices revoked successfully' };
  } catch (err) {
    console.error('[TrustedDevice] RevokeAll exception:', err);
    return { success: false, message: 'Error revoking all devices' };
  }
}

/**
 * Get all devices for a user (for admin view).
 */
export async function getUserDevices(
  userId: string,
  userType: 'student' | 'teacher' | 'admin'
): Promise<{ success: boolean; devices: any[] }> {
  try {
    const { data, error } = await supabase.rpc('get_user_devices', {
      p_user_id: userId,
      p_user_type: userType,
    });

    if (error) {
      console.error('[TrustedDevice] getUserDevices RPC error:', error.message);
      // Fallback
      const { data: directData, error: directErr } = await supabase
        .from('trusted_devices')
        .select('id, device_name, user_agent, created_at, last_seen, revoked')
        .eq('user_id', userId)
        .eq('user_type', userType)
        .order('last_seen', { ascending: false });

      if (directErr) {
        return { success: false, devices: [] };
      }
      return { success: true, devices: directData || [] };
    }

    return { success: true, devices: data || [] };
  } catch (err) {
    console.error('[TrustedDevice] getUserDevices exception:', err);
    return { success: false, devices: [] };
  }
}
