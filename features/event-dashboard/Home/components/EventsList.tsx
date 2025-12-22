import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { EventCard, EventItem } from './EventCard';
import { EventListSkeleton, EmptyState } from '../../../../common/components/LoadingStates';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { Calendar } from 'lucide-react-native';
import { eventService } from '../../../../core/events/services/event';
import { EventResponse } from '../../../../core/events/types/event';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { convertEventsToItems } from '../utils/eventUtils';

type Props = {
  events?: EventItem[];
  onCreateEvent?: () => void;
  showCreateAction?: boolean;
  onEventPress?: (item: EventItem) => void;
};

export const EventsList = ({
  events = [],
  onCreateEvent,
  showCreateAction = false,
  onEventPress,
}: Props) => {
  const { colors, spacing } = useTheme();
  const [serverEvents, setServerEvents] = useState<EventResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await eventService.listEvents({
        page: 0,
        size: 20,
        isPublic: true,
      });
      setServerEvents(response.content || []);
    } catch (error) {
      ErrorHandler.handle(error, 'loadEvents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadEvents();
    } finally {
      setRefreshing(false);
    }
  }, [loadEvents]);

  const allEvents = useMemo(() => {
    return [...events, ...convertEventsToItems(serverEvents)];
  }, [events, serverEvents]);

  const emptyState = useMemo(() => ({
    title: 'No Events Yet',
    subtitle: 'Events you create or join will appear here.',
  }), []);

  const content = isLoading ? (
    <EventListSkeleton count={3} />
  ) : allEvents.length === 0 ? (
    <EmptyState
      icon={<Calendar size={48} color={colors.text.tertiary} />}
      title={emptyState.title}
      subtitle={emptyState.subtitle}
      action={
        showCreateAction && onCreateEvent
          ? {
            label: 'Create Event',
            onPress: onCreateEvent,
          }
          : undefined
      }
    />
  ) : (
    <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg }}>
      {allEvents.map(item => (
        <EventCard key={item.id} item={item} onPress={onEventPress} />
      ))}
    </View>
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingBottom: spacing.xl }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.text.primary}
          colors={[colors.text.primary]}
        />
      }
    >
      {content}
    </ScrollView>
  );
};
