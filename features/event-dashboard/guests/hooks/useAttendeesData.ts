import { useCallback, useMemo } from 'react';
import { attendeeService } from '../../../../core/attendee/services/attendee';
import type { AttendeeResponse, PaginatedAttendeeResponse } from '../../../../core/attendee/types/attendee';
import { CACHE_CONFIG } from '../../../../common/utils/constants';
import { useCachedResource } from '../../hooks';

type AttendeesData = {
  attendees: AttendeeResponse[];
  totalAttendees: number;
};

export function useAttendeesData(eventId: string | null) {
  const key = eventId ? `attendees:${eventId}` : null;

  const fetcher = useCallback(async (): Promise<AttendeesData> => {
    if (!eventId) {
      throw new Error('Event ID is required');
    }
    const response = await attendeeService.listAttendees({ eventId, size: 100 });
    const data = response as PaginatedAttendeeResponse;
    return {
      attendees: data?.content ?? [],
      totalAttendees: data?.totalElements ?? 0,
    };
  }, [eventId]);

  const { data, loading, error, refresh, setData } = useCachedResource<AttendeesData>({
    key,
    fetcher,
    ttlMs: CACHE_CONFIG.EVENTS_CACHE_DURATION,
    enabled: Boolean(eventId),
    initialData: { attendees: [], totalAttendees: 0 },
  });

  const memo = useMemo(
    () => ({
      attendees: data?.attendees ?? [],
      totalAttendees: data?.totalAttendees ?? 0,
      loading,
      error,
      refresh,
      setData,
    }),
    [data, loading, error, refresh, setData]
  );

  return memo;
}
