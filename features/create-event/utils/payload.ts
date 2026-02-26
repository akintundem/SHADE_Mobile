import { EventStatus, EventType, type CreateEventRequest } from '../../../core/events/types/event';
import type { CreateEventFormState } from '../types';
import { buildEventMetadata, serializeMetadata } from './metadata';
import { sanitizeVenue } from './venue';

export function buildCreateEventPayload(state: CreateEventFormState): CreateEventRequest {
  const startDateTime = `${state.startDate}T${state.startTime}:00.000Z`;
  const endDateTime = state.endDate && state.endTime
    ? `${state.endDate}T${state.endTime}:00.000Z`
    : startDateTime;

  const metadata = buildEventMetadata({
    free: state.free,
    price: state.price,
    enableContrib: state.enableContrib,
    contributionAmount: state.contributionAmount,
    locationSearchQuery: state.locationSearchQuery,
  });

  const parsedCapacity = state.capacity ? Number(state.capacity) : undefined;

  return {
    name: state.title.trim(),
    description: state.description.trim(),
    eventType: state.selectedEventType || EventType.PARTY,
    eventStatus: EventStatus.DRAFT,
    startDateTime,
    endDateTime,
    capacity: Number.isFinite(parsedCapacity) ? parsedCapacity : undefined,
    isPublic: state.isPublic,
    requiresApproval: !state.isPublic,
    venue: sanitizeVenue(state.venue),
    metadata: serializeMetadata(metadata),
  };
}
