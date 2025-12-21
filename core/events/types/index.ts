// Re-export all types from event.ts
export * from './event';

// Type aliases for backward compatibility
export type Event = import('./event').EventResponse;
export type EventData = import('./event').EventResponse | import('./event').EventFeedResponse | import('./event').EventCapacityResponse | import('./event').EventVisibilityResponse;

// Helper type guards
export function isFullEventResponse(data: EventData): data is import('./event').EventResponse {
  return 'name' in data && 'eventType' in data;
}

export function isFeedResponse(data: EventData): data is import('./event').EventFeedResponse {
  return 'posts' in data && 'eventId' in data;
}

// Placeholder types for features that may not be fully implemented yet
// These can be removed or properly implemented as needed
export type TimelineDTO = any;
export type TaskDTO = any;
export type BudgetDTO = any;
export type ExpenseDTO = any;
export type InvitationDTO = any;
export type AttendeeDTO = any;
export type Vendor = any;
// FeedPost is already exported from event.ts

