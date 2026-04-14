import { useState, useEffect } from 'react';

/**
 * Returns true if running inside a Capacitor native shell (not a regular browser).
 * Returns null while still checking.
 */
export function useIsNativePlatform() {
  const [isNative, setIsNative] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        setIsNative(Capacitor.isNativePlatform());
      } catch {
        setIsNative(false);
      }
    })();
  }, []);

  return isNative;
}
