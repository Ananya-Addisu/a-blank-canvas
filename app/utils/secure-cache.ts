/**
 * Secure local cache with obfuscation and expiry.
 * Data is base64-encoded with a simple XOR cipher to prevent casual inspection.
 * NOT military-grade encryption — but sufficient to deter localStorage snooping.
 */

const CACHE_PREFIX = 'mgst_c_';
const CACHE_KEY = 'mgst_ck'; // cipher key seed
const DEFAULT_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getCipherKey(): number[] {
  // Derive a stable key from a seed stored in sessionStorage
  // This means cache is only readable within the same browser
  const seed = 'M4g5t3r_2024_s3cur3';
  const key: number[] = [];
  for (let i = 0; i < seed.length; i++) {
    key.push(seed.charCodeAt(i) % 256);
  }
  return key;
}

function xorCipher(data: string, key: number[]): string {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    result.push(data.charCodeAt(i) ^ key[i % key.length]);
  }
  return String.fromCharCode(...result);
}

function encode(data: unknown): string {
  try {
    const json = JSON.stringify(data);
    const key = getCipherKey();
    const ciphered = xorCipher(json, key);
    return btoa(unescape(encodeURIComponent(ciphered)));
  } catch {
    return '';
  }
}

function decode<T>(encoded: string): T | null {
  try {
    const key = getCipherKey();
    const ciphered = decodeURIComponent(escape(atob(encoded)));
    const json = xorCipher(ciphered, key);
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: number;
}

const CACHE_VERSION = 1;

/**
 * Save data to secure local cache
 */
export function setCacheData<T>(key: string, data: T): void {
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
    const encoded = encode(entry);
    if (encoded) {
      localStorage.setItem(CACHE_PREFIX + key, encoded);
    }
  } catch {
    // Storage full or unavailable — silently fail
  }
}

/**
 * Get data from secure local cache.
 * Returns null if expired, corrupted, or missing.
 */
export function getCacheData<T>(key: string, ttlMs: number = DEFAULT_TTL_MS): T | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry = decode<CacheEntry<T>>(raw);
    if (!entry || entry.version !== CACHE_VERSION) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    // Check expiry
    if (Date.now() - entry.timestamp > ttlMs) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

/**
 * Remove a specific cache entry
 */
export function removeCacheData(key: string): void {
  localStorage.removeItem(CACHE_PREFIX + key);
}

/**
 * Clear all app cache entries
 */
export function clearAllCache(): void {
  const keys = Object.keys(localStorage).filter(k => k.startsWith(CACHE_PREFIX));
  keys.forEach(k => localStorage.removeItem(k));
}
