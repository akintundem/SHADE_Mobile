import { useCallback, useMemo } from 'react';
import { eventService } from '../../../../core/events/services/event';
import type { EventListRequest, PaginatedEventResponse } from '../../../../core/events/types/event';
import { CACHE_CONFIG } from '../../../../common/utils/constants';
import { useCachedResource } from '../../hooks';

type UseEventListOptions = {
  request?: EventListRequest;
  enabled?: boolean;
  source?: 'all' | 'forYou' | 'following' | 'mine';
};

export function useEventList({ request, enabled = true, source = 'all' }: UseEventListOptions) {
  const requestKey = useMemo(() => JSON.stringify(request ?? {}), [request]);
  const cacheKey = `events:list:${source}:${requestKey}`;

  const fetcher = useCallback(() => {
    switch (source) {
      case 'forYou':
        return eventService.getForYouFeed(request);
      case 'following':
        return eventService.getFollowingFeed(request);
      case 'mine':
        return eventService.listMyEvents(request);
      case 'all':
      default:
        return eventService.listEvents(request);
    }
  }, [request, source]);

  const { data, loading, error, refresh, setData } = useCachedResource<PaginatedEventResponse>({
    key: enabled ? cacheKey : null,
    fetcher,
    ttlMs: CACHE_CONFIG.EVENTS_CACHE_DURATION,
    enabled,
    initialData: null,
  });

  return {
    data,
    loading,
    error,
    refresh,
    setData,
  };
}
