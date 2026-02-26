import { useCallback, useMemo } from 'react';
import { eventService } from '../../../core/events/services/event';
import {
  EventData,
  EventResponse,
  isFullEventResponse,
} from '../../../core/events/types/event';
import { CACHE_CONFIG } from '../../../common/utils/constants';
import { useCachedResource } from './useCachedResource';

type UseEventDashboardDataOptions = {
  eventId: string | null;
  initialEvent?: EventResponse | null;
  initialData?: EventData | null;
};

export function useEventDashboardData({
  eventId,
  initialEvent = null,
  initialData = null,
}: UseEventDashboardDataOptions) {
  const fetcher = useCallback(async () => {
    if (!eventId) {
      throw new Error('Event ID is required');
    }
    return eventService.getEvent(eventId, 'full') as Promise<EventData>;
  }, [eventId]);

  const key = eventId ? `event:${eventId}:full` : null;

  const { data, loading, error, refresh, setData } = useCachedResource<EventData>({
    key,
    fetcher,
    ttlMs: CACHE_CONFIG.EVENTS_CACHE_DURATION,
    enabled: Boolean(eventId),
    initialData: initialData ?? (initialEvent as EventData | null),
  });

  const event = useMemo<EventResponse | null>(() => {
    if (data && isFullEventResponse(data)) {
      return data;
    }
    if (initialEvent) {
      return initialEvent;
    }
    if (initialData && isFullEventResponse(initialData)) {
      return initialData;
    }
    return null;
  }, [data, initialData, initialEvent]);

  const setEvent = useCallback(
    (nextEvent: EventResponse | null) => {
      if (!eventId) return;
      if (nextEvent) {
        setData(nextEvent);
      }
    },
    [eventId, setData]
  );

  const updateEvent = useCallback(
    (patch: Partial<EventResponse>) => {
      if (!eventId || !event) return;
      const updated = { ...event, ...patch };
      setData(updated);
    },
    [eventId, event, setData]
  );

  return {
    eventData: data ?? null,
    event,
    loading,
    error,
    refresh,
    setEvent,
    updateEvent,
  };
}

