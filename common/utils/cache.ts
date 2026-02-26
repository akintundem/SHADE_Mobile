type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const cacheStore = new Map<string, CacheEntry<unknown>>();
const inflightStore = new Map<string, Promise<unknown>>();

const now = () => Date.now();

export function getCachedValue<T>(key: string): T | null {
  const entry = cacheStore.get(key) as CacheEntry<T> | undefined;
  if (!entry) {
    return null;
  }
  if (entry.expiresAt <= now()) {
    cacheStore.delete(key);
    return null;
  }
  return entry.value;
}

export function setCachedValue<T>(key: string, value: T, ttlMs: number) {
  cacheStore.set(key, { value, expiresAt: now() + ttlMs });
}

export function clearCachedValue(key: string) {
  cacheStore.delete(key);
}

export function clearCachedByPrefix(prefix: string) {
  for (const key of cacheStore.keys()) {
    if (key.startsWith(prefix)) {
      cacheStore.delete(key);
    }
  }
}

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number,
  options?: { force?: boolean }
): Promise<T> {
  if (!options?.force) {
    const cached = getCachedValue<T>(key);
    if (cached !== null) {
      return cached;
    }
  }

  const inflight = inflightStore.get(key) as Promise<T> | undefined;
  if (inflight) {
    return inflight;
  }

  const promise = fetcher()
    .then(result => {
      setCachedValue(key, result, ttlMs);
      inflightStore.delete(key);
      return result;
    })
    .catch(error => {
      inflightStore.delete(key);
      throw error;
    });

  inflightStore.set(key, promise as Promise<unknown>);
  return promise;
}
