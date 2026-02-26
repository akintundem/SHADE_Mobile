import type {
  EventAccessType,
  EventData,
  EventResponse,
  UserEventContext,
} from '../../../core/events/types/event';
import type { EventPermissions } from '../hooks/useEventPermissions';

export type EventDashboardContextState = {
  eventId: string | null;
  eventData: EventData | null;
  event: EventResponse | null;
  loading: boolean;
  error: Error | null;
  accessType?: EventAccessType | null;
  userContext?: UserEventContext | null;
  canManageEvent: boolean;
  permissions: EventPermissions;
};

export type EventDashboardContextActions = {
  refresh: (force?: boolean) => Promise<void>;
  setEvent: (event: EventResponse | null) => void;
  updateEvent: (patch: Partial<EventResponse>) => void;
};

export type EventDashboardContextValue = EventDashboardContextState & EventDashboardContextActions;

