import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CACHE_CONFIG } from '../../../common/utils/constants';
import { fetchWithCache, getCachedValue, setCachedValue } from '../../../common/utils/cache';

type UseCachedResourceOptions<T> = {
  key: string | null;
  fetcher: () => Promise<T>;
  ttlMs?: number;
  enabled?: boolean;
  initialData?: T | null;
};

type UseCachedResourceResult<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refresh: (force?: boolean) => Promise<void>;
  setData: (value: T | null, ttlOverrideMs?: number) => void;
};

export function useCachedResource<T>({
  key,
  fetcher,
  ttlMs = CACHE_CONFIG.DEFAULT_DURATION,
  enabled = true,
  initialData = null,
}: UseCachedResourceOptions<T>): UseCachedResourceResult<T> {
  const keyRef = useRef(key);
  const [data, setDataState] = useState<T | null>(() => {
    if (!key) {
      return initialData;
    }
    const cached = getCachedValue<T>(key);
    return cached ?? initialData;
  });
  const [loading, setLoading] = useState(() => {
    if (!key || !enabled) {
      return false;
    }
    const cached = getCachedValue<T>(key);
    return cached === null;
  });
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    keyRef.current = key;
  }, [key]);

  useEffect(() => {
    if (!key || !enabled) {
      setDataState(initialData);
      setLoading(false);
      return;
    }
    const cached = getCachedValue<T>(key);
    if (cached !== null) {
      setDataState(cached);
      setLoading(false);
      return;
    }
    if (initialData !== null) {
      setDataState(initialData);
    }
  }, [enabled, initialData, key]);

  const setData = useCallback(
    (value: T | null, ttlOverrideMs?: number) => {
      setDataState(value);
      if (keyRef.current && value !== null) {
        setCachedValue(keyRef.current, value, ttlOverrideMs ?? ttlMs);
      }
    },
    [ttlMs]
  );

  const refresh = useCallback(
    async (force?: boolean) => {
      if (!key || !enabled) {
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await fetchWithCache(key, fetcher, ttlMs, { force });
        setDataState(result);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [enabled, fetcher, key, ttlMs]
  );

  const initialFetch = useMemo(() => {
    if (!key || !enabled) {
      return false;
    }
    const cached = getCachedValue<T>(key);
    return cached === null;
  }, [enabled, key]);

  useEffect(() => {
    if (!initialFetch) return;
    refresh();
  }, [initialFetch, refresh]);

  return {
    data,
    loading,
    error,
    refresh,
    setData,
  };
}
