import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { EventAccessType, UserEventContext, EventResponse, EventData } from '../../../core/events/types/event';
import { useEventDashboardData } from '../hooks/useEventDashboardData';
import { useEventPermissions } from '../hooks/useEventPermissions';
import type { EventDashboardContextValue } from '../types';

type EventDashboardProviderProps = {
  eventId?: string | null;
  initialEvent?: EventResponse | null;
  initialData?: EventData | null;
  initialAccessType?: EventAccessType | null;
  initialUserContext?: UserEventContext | null;
  children: ReactNode;
};

const EventDashboardContext = createContext<EventDashboardContextValue | null>(null);

export function EventDashboardProvider({
  eventId,
  initialEvent = null,
  initialData = null,
  initialAccessType = null,
  initialUserContext = null,
  children,
}: EventDashboardProviderProps) {
  const {
    eventData,
    event,
    loading,
    error,
    refresh,
    setEvent,
    updateEvent,
  } = useEventDashboardData({
    eventId: eventId ?? null,
    initialEvent,
    initialData,
  });

  const accessType = event?.accessType ?? initialAccessType ?? null;
  const userContext = event?.userContext ?? initialUserContext ?? null;

  const canManageEvent = Boolean(userContext?.isOwner || userContext?.isCollaborator);

  const permissions = useEventPermissions(userContext);

  const value = useMemo<EventDashboardContextValue>(
    () => ({
      eventId: eventId ?? null,
      eventData,
      event,
      loading,
      error,
      accessType,
      userContext,
      canManageEvent,
      permissions,
      refresh,
      setEvent,
      updateEvent,
    }),
    [
      eventId,
      eventData,
      event,
      loading,
      error,
      accessType,
      userContext,
      canManageEvent,
      permissions,
      refresh,
      setEvent,
      updateEvent,
    ]
  );

  return (
    <EventDashboardContext.Provider value={value}>
      {children}
    </EventDashboardContext.Provider>
  );
}

export function useEventDashboard(): EventDashboardContextValue {
  const context = useContext(EventDashboardContext);
  if (!context) {
    throw new Error('useEventDashboard must be used within an EventDashboardProvider');
  }
  return context;
}

