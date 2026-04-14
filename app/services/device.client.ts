import { supabase } from '~/lib/supabase.client';

/**
 * Client-side Device Binding
 * Uses Web Crypto API instead of Node.js crypto.
 * Device tokens stored in localStorage instead of HttpOnly cookies.
 */

const DEVICE_TOKEN_KEY = 'magster_device_token';

/** Generate a cryptographically secure 256-bit device token */
export function generateDeviceToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

/** SHA256 hash a device token for safe DB storage */
export async function hashDeviceToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray, b => b.toString(16).padStart(2, '0')).join('');
}

/** Get stored device token from localStorage */
export function getStoredDeviceToken(): string | null {
  try {
    return localStorage.getItem(DEVICE_TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Store device token in localStorage */
export function storeDeviceToken(token: string): void {
  try {
    localStorage.setItem(DEVICE_TOKEN_KEY, token);
  } catch {
    console.error('[TrustedDevice] Failed to store device token');
  }
}

/** Clear stored device token */
export function clearDeviceToken(): void {
  try {
    localStorage.removeItem(DEVICE_TOKEN_KEY);
  } catch {
    // ignore
  }
}

/** Get device name from navigator */
function getDeviceName(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Android')) return 'Android Device';
  if (ua.includes('iPhone')) return 'iPhone';
  if (ua.includes('iPad')) return 'iPad';
  if (ua.includes('Windows')) return 'Windows PC';
  if (ua.includes('Mac OS')) return 'Mac';
  if (ua.includes('Linux')) return 'Linux PC';
  return 'Unknown Device';
}

export async function verifyDeviceToken(
  userId: string,
  userType: 'student' | 'teacher' | 'admin',
  hardwareId?: string
): Promise<{ trusted: boolean; deviceId?: string; deviceName?: string }> {
  const token = getStoredDeviceToken();

  if (token) {
    const tokenHash = await hashDeviceToken(token);
    try {
      const { data, error } = await supabase.rpc('verify_device_token', {
        p_user_id: userId, p_user_type: userType, p_device_token_hash: tokenHash,
      });
      if (!error && data?.length > 0 && data[0].is_valid) {
        return { trusted: true, deviceId: data[0].device_id, deviceName: data[0].device_name };
      }
    } catch (err) {
      console.error('[TrustedDevice] Verify exception:', err);
    }

    // Direct query fallback
    const result = await verifyDeviceTokenDirect(userId, userType, tokenHash);
    if (result.trusted) return result;
  }

  if (hardwareId) {
    const result = await verifyByHardwareId(userId, userType, hardwareId);
    if (result.trusted) return result;
  }

  return { trusted: false };
}

async function verifyDeviceTokenDirect(userId: string, userType: string, tokenHash: string): Promise<{ trusted: boolean; deviceId?: string; deviceName?: string }> {
  const { data, error } = await supabase.from('trusted_devices').select('id, device_name').eq('user_id', userId).eq('user_type', userType).eq('device_token_hash', tokenHash).eq('revoked', false).limit(1);
  if (error || !data?.length) return { trusted: false };
  await supabase.from('trusted_devices').update({ last_seen: new Date().toISOString() }).eq('id', data[0].id);
  return { trusted: true, deviceId: data[0].id, deviceName: data[0].device_name };
}

async function verifyByHardwareId(userId: string, userType: string, hardwareId: string): Promise<{ trusted: boolean; deviceId?: string; deviceName?: string }> {
  const { data, error } = await supabase.from('trusted_devices').select('id, device_name').eq('user_id', userId).eq('user_type', userType).eq('hardware_id', hardwareId).eq('revoked', false).limit(1);
  if (error || !data?.length) return { trusted: false };
  await supabase.from('trusted_devices').update({ last_seen: new Date().toISOString() }).eq('id', data[0].id);
  return { trusted: true, deviceId: data[0].id, deviceName: data[0].device_name };
}

export async function hasExistingTrustedDevice(userId: string, userType: 'student' | 'teacher' | 'admin'): Promise<{ exists: boolean; deviceName?: string }> {
  const { data, error } = await supabase.from('trusted_devices').select('id, device_name').eq('user_id', userId).eq('user_type', userType).eq('revoked', false).limit(1);
  if (error || !data?.length) return { exists: false };
  return { exists: true, deviceName: data[0].device_name || 'Unknown' };
}

export async function registerTrustedDevice(userId: string, userType: 'student' | 'teacher' | 'admin', hardwareId?: string): Promise<{ token: string; deviceId?: string; success: boolean }> {
  const token = generateDeviceToken();
  const tokenHash = await hashDeviceToken(token);
  const deviceName = getDeviceName();
  const userAgent = navigator.userAgent;

  try {
    const { data, error } = await supabase.rpc('register_trusted_device', {
      p_user_id: userId, p_user_type: userType, p_device_token_hash: tokenHash, p_device_name: deviceName, p_user_agent: userAgent,
    });

    if (!error && data?.length > 0) {
      storeDeviceToken(token);
      return { token, deviceId: data[0].device_id, success: true };
    }
  } catch (err) {
    console.error('[TrustedDevice] RPC register error:', err);
  }

  // Direct fallback
  const { data, error } = await supabase.from('trusted_devices').insert({ user_id: userId, user_type: userType, device_token_hash: tokenHash, device_name: deviceName, user_agent: userAgent, ...(hardwareId ? { hardware_id: hardwareId } : {}) }).select('id').single();
  if (error) return { token, success: false };
  storeDeviceToken(token);
  return { token, deviceId: data?.id, success: true };
}

export async function revokeDevice(deviceId: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.rpc('revoke_trusted_device', { p_device_id: deviceId });
    if (error) {
      const { error: updateErr } = await supabase.from('trusted_devices').update({ revoked: true }).eq('id', deviceId);
      if (updateErr) return { success: false, message: 'Failed to revoke device' };
    }
    return { success: true, message: 'Device revoked successfully' };
  } catch {
    return { success: false, message: 'Error revoking device' };
  }
}

export async function revokeAllDevices(userId: string, userType: 'student' | 'teacher' | 'admin'): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase.rpc('revoke_all_user_devices', { p_user_id: userId, p_user_type: userType });
    if (error) {
      const { error: updateErr } = await supabase.from('trusted_devices').update({ revoked: true }).eq('user_id', userId).eq('user_type', userType);
      if (updateErr) return { success: false, message: 'Failed to revoke all devices' };
    }
    return { success: true, message: 'All devices revoked successfully' };
  } catch {
    return { success: false, message: 'Error revoking all devices' };
  }
}

export async function getUserDevices(userId: string, userType: 'student' | 'teacher' | 'admin'): Promise<{ success: boolean; devices: any[] }> {
  try {
    const { data, error } = await supabase.rpc('get_user_devices', { p_user_id: userId, p_user_type: userType });
    if (error) {
      const { data: directData, error: directErr } = await supabase.from('trusted_devices').select('id, device_name, user_agent, created_at, last_seen, revoked').eq('user_id', userId).eq('user_type', userType).order('last_seen', { ascending: false });
      if (directErr) return { success: false, devices: [] };
      return { success: true, devices: directData || [] };
    }
    return { success: true, devices: data || [] };
  } catch {
    return { success: false, devices: [] };
  }
}
