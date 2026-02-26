import { getImageUrl } from '../../../../config/appConfig';
import { Event, EventStatus, EventAccessType } from '../../../../core/events/types/event';
import { EventItem } from '../components/EventCard';

// TEST FLAG: Set to true to force test access types on events
const TEST_ACCESS_TYPES = true;

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
export const convertEventToItem = (event: Event, index?: number): EventItem => {
  const isPast = isEventPast(event);

  // For testing: assign different access types to different events
  let testAccessType = event.accessType;
  if (TEST_ACCESS_TYPES && !event.accessType) {
    // Rotate between access types for testing (based on event index or id)
    const testIndex = index ?? parseInt(event.id.replace(/\D/g, '').slice(-1) || '0', 10);
    const accessTypes = [
      EventAccessType.TICKETED,
      EventAccessType.RSVP_REQUIRED,
      EventAccessType.INVITE_ONLY,
      EventAccessType.OPEN,
    ];
    testAccessType = accessTypes[testIndex % accessTypes.length];
  }

  return {
    id: event.id,
    ownerId: event.ownerId ?? undefined,
    title: event.name,
    description: event.description ?? undefined,
    venue: event.venue?.address ?? undefined,
    city: event.venue?.city ?? undefined,
    state: event.venue?.state ?? undefined,
    startAt: event.startDateTime ?? undefined,
    endAt: event.endDateTime ?? undefined,
    imageUrl: getImageUrl(event.coverImageUrl) ?? undefined,
    status: event.eventStatus,
    isPublic: event.isPublic,
    isPast,
    isLive: !isPast,
    capacity: event.capacity ?? undefined,
    attendeeCount: event.currentAttendeeCount ?? undefined,
    // Access control fields - use test value if available
    accessType: testAccessType ?? undefined,
    userContext: event.userContext ?? undefined,
    ticketTypes: event.ticketTypes ?? undefined,
  };
};

/**
 * Converts multiple API Events to EventItem format
 */
export const convertEventsToItems = (events: Event[]): EventItem[] => {
  return events.map((event, index) => convertEventToItem(event, index));
};
