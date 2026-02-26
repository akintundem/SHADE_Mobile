import React, { createContext, useContext, useMemo } from 'react';
import type { UserEventContext } from '../../../core/events/types/event';

export type FeedContextValue = {
  eventId: string;
  eventName: string;
  coverImageUrl?: string | null;
  userContext?: UserEventContext | null;
};

const FeedContext = createContext<FeedContextValue | null>(null);

export type FeedProviderProps = FeedContextValue & {
  children: React.ReactNode;
};

export function FeedProvider({ children, eventId, eventName, coverImageUrl, userContext }: FeedProviderProps) {
  const value = useMemo(
    () => ({
      eventId,
      eventName,
      coverImageUrl: coverImageUrl ?? null,
      userContext: userContext ?? null,
    }),
    [coverImageUrl, eventId, eventName, userContext]
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeedContext(): FeedContextValue {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeedContext must be used within a FeedProvider');
  }
  return context;
}
