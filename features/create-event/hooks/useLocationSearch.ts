import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from '../../../common/hooks/useDebounce';
import type { LocationSuggestion } from '../types';

type NominatimResult = {
  place_id?: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    region?: string;
    country?: string;
    postcode?: string;
  };
};

const CACHE_TTL_MS = 5 * 60 * 1000;
const MIN_QUERY_LENGTH = 2;

type CacheEntry = {
  timestamp: number;
  results: LocationSuggestion[];
};

export function useLocationSearch(query: string) {
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const cacheRef = useRef<Map<string, CacheEntry>>(new Map());
  const abortRef = useRef<AbortController | null>(null);

  const debouncedQuery = useDebounce(query.trim(), 350);

  const canSearch = debouncedQuery.length >= MIN_QUERY_LENGTH;

  const cached = useMemo(() => {
    if (!canSearch) return null;
    const entry = cacheRef.current.get(debouncedQuery.toLowerCase());
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      cacheRef.current.delete(debouncedQuery.toLowerCase());
      return null;
    }
    return entry.results;
  }, [canSearch, debouncedQuery]);

  useEffect(() => {
    if (!canSearch) {
      abortRef.current?.abort();
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    if (cached) {
      setSuggestions(cached);
      setIsSearching(false);
      setShowSuggestions(true);
      return;
    }

    let isActive = true;
    setIsSearching(true);
    setShowSuggestions(true);

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=6&q=${encodeURIComponent(
            debouncedQuery,
          )}`,
          {
            signal: controller.signal,
            headers: {
              'User-Agent': 'capsule-app/1.0',
              Accept: 'application/json',
            },
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location suggestions');
        }

        const results: NominatimResult[] = await response.json();
        const mapped: LocationSuggestion[] = results.map((item, index) => {
          const address = item.address || {};
          const displayName: string = item.display_name || debouncedQuery;
          const [title, ...rest] = displayName.split(',');

          return {
            id: item.place_id?.toString() ?? `${item.lat}-${item.lon}-${index}`,
            title: title?.trim() || displayName,
            subtitle: rest.join(', ').trim(),
            latitude: parseFloat(item.lat),
            longitude: parseFloat(item.lon),
            displayName,
            components: {
              city:
                address.city ||
                address.town ||
                address.village ||
                address.municipality ||
                address.county,
              state: address.state || address.region,
              country: address.country,
              zipCode: address.postcode,
            },
          };
        });

        if (!isActive) return;
        cacheRef.current.set(debouncedQuery.toLowerCase(), {
          timestamp: Date.now(),
          results: mapped,
        });
        setSuggestions(mapped);
      } catch (error: unknown) {
        if (!isActive) return;
        // Ignore abort errors — they are intentional when the query changes
        if (error instanceof Error && error.name === 'AbortError') return;
        if (__DEV__) {
          console.error('[useLocationSearch] Failed to fetch suggestions:', error);
        }
        setSuggestions([]);
      } finally {
        if (isActive) {
          setIsSearching(false);
        }
      }
    })();

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [cached, canSearch, debouncedQuery]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setShowSuggestions(false);
    setIsSearching(false);
  }, []);

  return {
    suggestions,
    isSearching,
    showSuggestions,
    setShowSuggestions,
    clearSuggestions,
    canSearch,
  };
}
