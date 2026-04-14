import { useEffect, useState } from 'react';
import { probeRemoteConnectivity } from '~/utils/connectivity';

function readOnlineStatus() {
  return typeof window === 'undefined' ? true : navigator.onLine;
}

let currentStatus = readOnlineStatus();
let subscriberCount = 0;
let probeTimer: number | null = null;
let probeInFlight = false;
const listeners = new Set<(online: boolean) => void>();
const PROBE_TIMEOUT_MS = 900;
const PROBE_INTERVAL_MS = 5_000;

function emitStatus(nextStatus: boolean) {
  if (currentStatus === nextStatus) return;
  currentStatus = nextStatus;
  listeners.forEach((listener) => listener(nextStatus));
}

async function probeConnectivity() {
  if (typeof window === 'undefined' || probeInFlight) return;

  if (!navigator.onLine) {
    emitStatus(false);
    return;
  }

  probeInFlight = true;

  try {
    emitStatus(await probeRemoteConnectivity(PROBE_TIMEOUT_MS));
  } catch {
    emitStatus(false);
  } finally {
    probeInFlight = false;
  }
}

function startMonitoring() {
  if (typeof window === 'undefined' || probeTimer !== null) return;

  const handleOnline = () => {
    emitStatus(true);
    void probeConnectivity();
  };

  const handleOffline = () => {
    emitStatus(false);
  };

  const handleFocus = () => {
    void probeConnectivity();
  };

  const handleVisibilityChange = () => {
    if (!document.hidden) {
      void probeConnectivity();
    }
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);
  window.addEventListener('focus', handleFocus);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  probeTimer = window.setInterval(() => {
    if (!document.hidden) {
      void probeConnectivity();
    }
  }, PROBE_INTERVAL_MS);

  void probeConnectivity();

  (startMonitoring as any).cleanup = () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibilityChange);

    if (probeTimer !== null) {
      window.clearInterval(probeTimer);
      probeTimer = null;
    }

    delete (startMonitoring as any).cleanup;
  };
}

function stopMonitoring() {
  if (subscriberCount > 0) return;
  const cleanup = (startMonitoring as any).cleanup as (() => void) | undefined;
  cleanup?.();
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(currentStatus);

  useEffect(() => {
    subscriberCount += 1;
    startMonitoring();

    const handleStatusChange = (nextStatus: boolean) => {
      setIsOnline(nextStatus);
    };

    listeners.add(handleStatusChange);
    setIsOnline(currentStatus);

    return () => {
      listeners.delete(handleStatusChange);
      subscriberCount -= 1;
      stopMonitoring();
    };
  }, []);

  return isOnline;
}
