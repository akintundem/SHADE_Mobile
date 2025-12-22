import { Event, EventStatus } from '../../../../core/events/types/event';
import { EventItem } from '../components/EventCard';

/**
 * Determines if an event is in the past based on date and status
 */
export const isEventPast = (event: Event): boolean => {
  const now = new Date();
  const endDate = event.endDateTime ? new Date(event.endDateTime) : null;
  const isPastByDate = endDate ? endDate < now : false;
  const isPastByStatus = [
    EventStatus.COMPLETED,
    EventStatus.CANCELLED,
  ].includes(event.eventStatus);
  
  return isPastByDate || isPastByStatus;
};

/**
 * Converts an API Event to EventItem format for UI display
 */
export const convertEventToItem = (event: Event): EventItem => {
  const isPast = isEventPast(event);

  return {
    id: event.id,
    title: event.name,
    description: event.description ?? undefined,
    venue:
      event.targetAudience ??
      (event.isPublic ? 'Open to everyone' : 'Invite only'),
    startAt: event.startDateTime ?? undefined,
    endAt: event.endDateTime ?? undefined,
    imageUrl: event.coverImageUrl ?? undefined,
    status: event.eventStatus,
    isPublic: event.isPublic,
    isPast,
    isLive: !isPast,
  };
};

/**
 * Converts multiple API Events to EventItem format
 */
export const convertEventsToItems = (events: Event[]): EventItem[] => {
  return events.map(convertEventToItem);
};

