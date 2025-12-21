import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ScrollView, View, RefreshControl, TouchableOpacity } from 'react-native';
import { HomeHeader } from '../components/HomeHeader';
import { EventSegmentedControl, SegmentType } from '../components/EventSegmentedControl';
import { EventCard, EventItem } from '../components/EventCard';
import { SafeAreaWrapper } from '../../../../common/components/SafeAreaWrapper';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { User } from '../../../../core/auth/types/auth';
import { eventService } from '../../../../core/events/services/event';
import { Event } from '../../../../core/events/types';
import { convertEventsToItems } from '../utils/eventUtils';
import { EventListSkeleton, EmptyState } from '../../../../common/components/LoadingStates';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { Calendar, Plus } from 'lucide-react-native';

const EMPTY_STATE_CONFIG: Record<SegmentType, { title: string; subtitle: string }> = {
  live: {
    title: 'No Live Events',
    subtitle: 'No events are happening right now. Check back later or create your own event!',
  },
  past: {
    title: 'No Past Events',
    subtitle: 'No past events to show. Your event history will appear here.',
  },
  all: {
    title: 'No Events Yet',
    subtitle: 'Events you create or join will appear here.',
  },
};

type Props = {
  user: User;
  events?: EventItem[];
  onCreateEvent?: () => void;
  onOpenMenu?: () => void;
  onOpenCamera?: () => void;
  onOpenGallery?: () => void;
};

export default function ManageScreen({
  user,
  events = [],
  onCreateEvent,
}: Props) {
  const { colors, spacing } = useTheme();
  const [activeSegment, setActiveSegment] = useState<SegmentType>('live');
  const [fetchedEvents, setFetchedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await eventService.listMyEvents({
        page: 0,
        size: 20,
      });
      setFetchedEvents(response.content || []);
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

  const allEvents = [...events, ...convertEventsToItems(fetchedEvents)];

  const filteredEvents = useMemo(() => {
    switch (activeSegment) {
      case 'live':
        return allEvents.filter(e => !e.isPast);
      case 'past':
        return allEvents.filter(e => e.isPast);
      case 'all':
      default:
        return allEvents;
    }
  }, [allEvents, activeSegment]);

  const emptyState = useMemo(
    () => EMPTY_STATE_CONFIG[activeSegment],
    [activeSegment],
  );

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: colors.background }}>
          <HomeHeader
            title="Manage"
            rightAction={
              onCreateEvent ? (
                <TouchableOpacity
                  onPress={onCreateEvent}
                  activeOpacity={0.8}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.text.primary,
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Create event"
                >
                  <Plus size={20} color={colors.background} />
                </TouchableOpacity>
              ) : null
            }
          />
          <EventSegmentedControl
            activeSegment={activeSegment}
            onSegmentChange={setActiveSegment}
          />
        </View>

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
          <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
            {isLoading ? (
              <EventListSkeleton count={3} />
            ) : filteredEvents.length === 0 ? (
              <EmptyState
                icon={<Calendar size={48} color={colors.text.tertiary} />}
                title={emptyState.title}
                subtitle={emptyState.subtitle}
                action={
                  activeSegment === 'live' && onCreateEvent
                    ? {
                      label: 'Create Event',
                      onPress: onCreateEvent,
                    }
                    : undefined
                }
              />
            ) : (
              <View style={{ gap: spacing.md }}>
                {filteredEvents.map(item => (
                  <EventCard 
                    key={item.id} 
                    item={item}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

    </SafeAreaWrapper>
  );
}
