import { useState, useEffect, useCallback } from 'react';
import {
  EventResponse,
  EventFeedResponse,
  EventCapacityResponse,
  EventVisibilityResponse,
  EventFeedRequest,
} from '../../core/events/types/event';
import { eventService } from '../../core/events/services/event';
import { ErrorHandler } from '../utils/errorHandler';

type EventData = EventResponse | EventFeedResponse | EventCapacityResponse | EventVisibilityResponse;

function isFullEventResponse(data: EventData): data is EventResponse {
  return 'name' in data && 'eventType' in data;
}

function isFeedResponse(data: EventData): data is EventFeedResponse {
  return 'posts' in data && 'eventId' in data;
}

export interface UseEventReturn {
  eventData: EventData | null;
  loading: boolean;
  error: Error | null;
  isFullScope: boolean;
  isFeedScope: boolean;
  refresh: () => Promise<void>;
}

/**
 * Hook for fetching event data with scope-based response handling
 * Automatically handles both FULL and FEED scope responses
 */
export const useEvent = (
  eventId: string,
  params?: EventFeedRequest,
): UseEventReturn => {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setError(new Error('Event ID is required'));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // If params are provided, assume feed view, otherwise get full event
      const view = params ? 'feed' : 'full';
      const data = await eventService.getEvent(eventId, view, params);
      setEventData(data);
    } catch (err) {
      const errorObj =
        err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      ErrorHandler.handle(err, 'useEvent');
    } finally {
      setLoading(false);
    }
  }, [eventId, params]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const refresh = useCallback(async () => {
    await fetchEvent();
  }, [fetchEvent]);

  return {
    eventData,
    loading,
    error,
    isFullScope: eventData ? isFullEventResponse(eventData) : false,
    isFeedScope: eventData ? isFeedResponse(eventData) : false,
    refresh,
  };
};



