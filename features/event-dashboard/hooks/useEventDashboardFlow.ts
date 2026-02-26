import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../../../navigation/types';
import type { UserEventContext } from '../../../core/events/types/event';

export function useEventDashboardFlow(
  eventId: string | null,
  userContext?: UserEventContext | null
) {
  const navigation = useNavigation<RootStackNavigationProp>();

  const goBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('MainTabs');
    }
  }, [navigation]);

  const ctx = userContext ?? null;

  const goToBudget = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('BudgetManagement', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToTimeline = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('TimelineManagement', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToCollaboration = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('CollaborationManagement', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToRSVP = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('RSVPManagement', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToTickets = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('TicketsManagement', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToFeeds = useCallback(
    (params?: { eventName?: string; coverImageUrl?: string }) => {
      if (!eventId) return;
      navigation.navigate('EventFeeds', { eventId, ...params });
    },
    [eventId, navigation]
  );

  const goToTicketApprovals = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('TicketApprovals', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToTicketWaitlist = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('TicketWaitlist', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToEventWaitlist = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('EventWaitlist', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToMediaLibrary = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('MediaLibrary', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToAssets = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('Assets', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  const goToReminders = useCallback(() => {
    if (!eventId) return;
    navigation.navigate('Reminders', { eventId, userContext: ctx });
  }, [eventId, ctx, navigation]);

  return {
    goBack,
    goToBudget,
    goToTimeline,
    goToCollaboration,
    goToRSVP,
    goToTickets,
    goToFeeds,
    goToTicketApprovals,
    goToTicketWaitlist,
    goToEventWaitlist,
    goToMediaLibrary,
    goToAssets,
    goToReminders,
  };
}

