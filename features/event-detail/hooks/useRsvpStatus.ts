import { useCallback, useEffect, useState } from 'react';
import { attendeeService } from '../../../core/attendee/services/attendee';
import { AttendeeStatus } from '../../../core/attendee/types/attendee';

type UseRsvpStatusOptions = {
  eventId: string;
  enabled?: boolean;
};

type UseRsvpStatusReturn = {
  status: AttendeeStatus | null;
  attendeeId: string | null;
  isLoading: boolean;
  error: Error | null;
  rsvp: () => Promise<void>;
  updateStatus: (status: AttendeeStatus) => Promise<void>;
  cancelRsvp: () => Promise<void>;
  refresh: () => Promise<void>;
};

export function useRsvpStatus({
  eventId,
  enabled = true,
}: UseRsvpStatusOptions): UseRsvpStatusReturn {
  const [status, setStatus] = useState<AttendeeStatus | null>(null);
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!enabled || !eventId) return;

    try {
      const response = await attendeeService.getRsvpStatus(eventId);
      setStatus(response.status ?? null);
      setAttendeeId(response.attendeeId ?? null);
      setError(null);
    } catch (err) {
      // User might not have RSVP'd yet - this is not an error
      setStatus(null);
      setAttendeeId(null);
    }
  }, [enabled, eventId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const rsvp = useCallback(async () => {
    if (isLoading || !eventId) return;
    setIsLoading(true);
    setError(null);

    try {
      await attendeeService.rsvpToEvent(eventId);
      // Refresh to get the updated status
      await fetchStatus();
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [eventId, fetchStatus, isLoading]);

  const updateStatus = useCallback(
    async (newStatus: AttendeeStatus) => {
      if (isLoading || !eventId) return;
      setIsLoading(true);
      setError(null);

      // Optimistic update
      const previousStatus = status;
      setStatus(newStatus);

      try {
        await attendeeService.updateRsvpStatus(eventId, { status: newStatus });
      } catch (err) {
        // Revert on error
        setStatus(previousStatus);
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [eventId, isLoading, status]
  );

  const cancelRsvp = useCallback(async () => {
    if (isLoading || !eventId) return;
    setIsLoading(true);
    setError(null);

    // Optimistic update
    const previousStatus = status;
    const previousAttendeeId = attendeeId;
    setStatus(null);
    setAttendeeId(null);

    try {
      await attendeeService.cancelRsvp(eventId);
    } catch (err) {
      // Revert on error
      setStatus(previousStatus);
      setAttendeeId(previousAttendeeId);
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [attendeeId, eventId, isLoading, status]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchStatus();
    setIsLoading(false);
  }, [fetchStatus]);

  return {
    status,
    attendeeId,
    isLoading,
    error,
    rsvp,
    updateStatus,
    cancelRsvp,
    refresh,
  };
}
