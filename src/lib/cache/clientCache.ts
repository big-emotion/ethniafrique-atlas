/**
 * Client-side cache utility using localStorage with TTL support
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Cache keys
export const CACHE_KEYS = {
  REGIONS: "app:regions",
  COUNTRIES: "app:countries",
  ETHNICITIES: "app:ethnicities",
  TOTAL_POPULATION: "app:totalPopulation",
} as const;

/**
 * Check if localStorage is available
 */
function isLocalStorageAvailable(): boolean {
  try {
    const test = "__localStorage_test__";
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get cached data if it exists and is not expired
 */
export function getCachedData<T>(key: string, ttl: number): T | null {
  if (!isLocalStorageAvailable()) {
    return null;
  }

  try {
    const cached = localStorage.getItem(key);
    if (!cached) {
      return null;
    }

    const entry: CacheEntry<T> = JSON.parse(cached);
    const now = Date.now();
    const age = now - entry.timestamp;

    // Check if cache is expired
    if (age > entry.ttl) {
      localStorage.removeItem(key);
      return null;
    }

    return entry.data;
  } catch (error) {
    console.warn(`Error reading cache for key "${key}":`, error);
    // Clear corrupted cache entry
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors when clearing
    }
    return null;
  }
}

/**
 * Set data in cache with TTL
 */
export function setCachedData<T>(key: string, data: T, ttl: number): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    localStorage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    // Handle quota exceeded or other errors
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      console.warn("localStorage quota exceeded, clearing old cache entries");
      // Try to clear some old entries
      clearOldCacheEntries();
      // Retry once
      try {
        localStorage.setItem(
          key,
          JSON.stringify({
            data,
            timestamp: Date.now(),
            ttl,
          })
        );
      } catch {
        console.warn(`Failed to cache data for key "${key}"`);
      }
    } else {
      console.warn(`Error setting cache for key "${key}":`, error);
    }
  }
}

/**
 * Clear cache entry(ies)
 * @param key - If provided, clears only that key. If not provided, clears all app cache entries.
 */
export function clearCache(key?: string): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    if (key) {
      localStorage.removeItem(key);
    } else {
      // Clear all app cache entries
      Object.values(CACHE_KEYS).forEach((cacheKey) => {
        localStorage.removeItem(cacheKey);
      });
    }
  } catch (error) {
    console.warn("Error clearing cache:", error);
  }
}

/**
 * Clear old cache entries to free up space
 */
function clearOldCacheEntries(): void {
  if (!isLocalStorageAvailable()) {
    return;
  }

  try {
    const now = Date.now();
    Object.values(CACHE_KEYS).forEach((key) => {
      const cached = localStorage.getItem(key);
      if (cached) {
        try {
          const entry: CacheEntry<unknown> = JSON.parse(cached);
          const age = now - entry.timestamp;
          if (age > entry.ttl) {
            localStorage.removeItem(key);
          }
        } catch {
          // Remove corrupted entries
          localStorage.removeItem(key);
        }
      }
    });
  } catch (error) {
    console.warn("Error clearing old cache entries:", error);
  }
}
