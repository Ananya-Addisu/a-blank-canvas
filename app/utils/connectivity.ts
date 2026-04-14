const FALLBACK_REMOTE_ORIGIN = 'https://rpfhatpademhbcbrqtch.supabase.co';

function getRemoteOrigin() {
  const configuredOrigin = import.meta.env.VITE_SUPABASE_URL?.trim();
  if (configuredOrigin) return configuredOrigin.replace(/\/$/, '');
  return FALLBACK_REMOTE_ORIGIN;
}

export function getConnectivityProbeUrl() {
  return `${getRemoteOrigin()}/auth/v1/settings`;
}

export async function probeRemoteConnectivity(timeoutMs = 900) {
  if (typeof window === 'undefined') return true;
  if (!navigator.onLine) return false;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getConnectivityProbeUrl()}?t=${Date.now()}`, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      },
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}