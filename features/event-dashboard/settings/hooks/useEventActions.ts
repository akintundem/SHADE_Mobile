import { useCallback, useState } from 'react';
import { eventService } from '../../../../core/events/services/event';
import type { EventResponse, CloneEventRequest } from '../../../../core/events/types/event';

type UseEventActionsOptions = {
  eventId: string;
  onEventUpdated?: (event: EventResponse) => void;
};

type UseEventActionsReturn = {
  isLoading: boolean;
  error: Error | null;
  archiveEvent: (reason?: string) => Promise<EventResponse>;
  restoreEvent: () => Promise<EventResponse>;
  cloneEvent: (options?: CloneEventRequest) => Promise<EventResponse>;
  toggleRegistration: (open: boolean) => Promise<EventResponse>;
  removeCoverImage: () => Promise<void>;
};

export function useEventActions({
  eventId,
  onEventUpdated,
}: UseEventActionsOptions): UseEventActionsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const archiveEvent = useCallback(
    async (reason?: string): Promise<EventResponse> => {
      if (isLoading) throw new Error('Action in progress');
      setIsLoading(true);
      setError(null);

      try {
        const result = await eventService.archiveEvent(eventId, reason);
        onEventUpdated?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [eventId, isLoading, onEventUpdated]
  );

  const restoreEvent = useCallback(async (): Promise<EventResponse> => {
    if (isLoading) throw new Error('Action in progress');
    setIsLoading(true);
    setError(null);

    try {
      const result = await eventService.restoreEvent(eventId);
      onEventUpdated?.(result);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [eventId, isLoading, onEventUpdated]);

  const cloneEvent = useCallback(
    async (options?: CloneEventRequest): Promise<EventResponse> => {
      if (isLoading) throw new Error('Action in progress');
      setIsLoading(true);
      setError(null);

      try {
        const result = await eventService.cloneEvent(eventId, options);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [eventId, isLoading]
  );

  const toggleRegistration = useCallback(
    async (open: boolean): Promise<EventResponse> => {
      if (isLoading) throw new Error('Action in progress');
      setIsLoading(true);
      setError(null);

      try {
        const action = open ? 'open' : 'close';
        const result = await eventService.updateRegistrationState(eventId, action);
        onEventUpdated?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [eventId, isLoading, onEventUpdated]
  );

  const removeCoverImage = useCallback(async (): Promise<void> => {
    if (isLoading) throw new Error('Action in progress');
    setIsLoading(true);
    setError(null);

    try {
      await eventService.removeCoverImage(eventId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [eventId, isLoading]);

  return {
    isLoading,
    error,
    archiveEvent,
    restoreEvent,
    cloneEvent,
    toggleRegistration,
    removeCoverImage,
  };
}
