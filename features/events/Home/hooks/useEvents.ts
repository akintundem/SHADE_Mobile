import { useState, useEffect, useCallback } from 'react';
import { Event } from '../../types/events';
import { eventService } from '../../services/eventService';
import { ErrorHandler } from '../../../../common/utils/errorHandler';

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await eventService.getEvents({
        page: 0,
        size: 20,
        isPublic: true,
      });
      setEvents(response.content || []);
    } catch (error) {
      ErrorHandler.handle(error, 'fetchEvents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents(false);
    setRefreshing(false);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    isLoading,
    refreshing,
    onRefresh,
    refetch: fetchEvents,
  };
};

