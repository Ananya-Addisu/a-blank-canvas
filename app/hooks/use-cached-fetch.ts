import { useState, useEffect, useRef } from 'react';
import { setCacheData, getCacheData } from '~/utils/secure-cache';

/**
 * Hook that wraps an async fetch function with localStorage caching.
 * On mount: shows cached data immediately, then fetches fresh data.
 * On offline: falls back to cached data or signals no-data.
 */
export function useCachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttlMs: number = 60 * 60 * 1000 // 1 hour default
): {
  data: T | null;
  loading: boolean;
  isFromCache: boolean;
  error: 'offline' | 'fetch_error' | null;
} {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromCache, setIsFromCache] = useState(false);
  const [error, setError] = useState<'offline' | 'fetch_error' | null>(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    // Try cache first
    const cached = getCacheData<T>(cacheKey, ttlMs);
    if (cached) {
      setData(cached);
      setIsFromCache(true);
      setLoading(false);
    }

    // Then try fetching fresh data
    fetchFn()
      .then((fresh) => {
        setData(fresh);
        setIsFromCache(false);
        setError(null);
        setCacheData(cacheKey, fresh);
        setLoading(false);
      })
      .catch(() => {
        if (!navigator.onLine) {
          setError(cached ? null : 'offline');
        } else {
          setError(cached ? null : 'fetch_error');
        }
        setLoading(false);
      });
  }, [cacheKey, ttlMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading: loading && !data, isFromCache, error };
}
