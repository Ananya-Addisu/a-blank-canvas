import { useState, useEffect, useRef } from 'react';
import { getCacheData, setCacheData } from '~/utils/secure-cache';

/**
 * Stale-while-revalidate hook for loader data.
 * Shows cached data instantly, then swaps in fresh loader data when available.
 * Caches the fresh data for next visit.
 *
 * @param cacheKey - Unique key for this screen's data
 * @param loaderData - Fresh data from the route loader
 * @param ttlMs - Cache time-to-live in ms (default 30 min)
 */
export function useCachedData<T extends Record<string, unknown>>(
  cacheKey: string,
  loaderData: T,
  ttlMs?: number
): { data: T; isFromCache: boolean } {
  const [isFromCache, setIsFromCache] = useState(false);
  const hasHydrated = useRef(false);

  // On mount (client only), try to read cache
  const [data, setData] = useState<T>(() => {
    // During SSR, just use loader data
    if (typeof window === 'undefined') return loaderData;

    const cached = getCacheData<T>(cacheKey, ttlMs);
    if (cached) {
      return cached;
    }
    return loaderData;
  });

  // Once we detect cached data differs from loader data, mark it
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cached = getCacheData<T>(cacheKey, ttlMs);
    if (cached && !hasHydrated.current) {
      setData(cached);
      setIsFromCache(true);
    }
    hasHydrated.current = true;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // When loader data arrives/changes, update display and cache it
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Update the display with fresh data
    setData(loaderData);
    setIsFromCache(false);

    // Cache the fresh data for next visit
    setCacheData(cacheKey, loaderData);
  }, [loaderData, cacheKey]);

  return { data, isFromCache };
}
