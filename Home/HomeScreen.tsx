import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { HomeHeader } from './components/HomeHeader';
import { EventCard, EventItem } from './components/EventCard';
import { TabBar } from './components/TabBar';
import { SafeAreaWrapper } from '../components/SafeAreaWrapper';
import { EventListSkeleton, EmptyState } from '../components/LoadingStates';
import { useTheme } from '../theme/ThemeProvider';
import { User, Event, EventStatus } from '../types';
import { eventService } from '../services/eventService';
import { ErrorHandler } from '../utils/errorHandler';
import { Calendar } from 'lucide-react-native';

type Props = {
  user: User;
  events?: EventItem[];
  onCreatePost?: () => void;
  onCreateEvent?: () => void;
  onOpenMenu?: () => void;
  onOpenChat?: () => void;
  showExampleWhenEmpty?: boolean;
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
};

export default function HomeScreen({
  user,
  events = [],
  onOpenMenu,
  onOpenChat,
  onCreateEvent,
  showExampleWhenEmpty: _showExampleWhenEmpty = true,
  onTabChange,
}: Props) {
  const { colors, spacing, borderRadius, typography, isDark, brand } =
    useTheme();
  const [seg, setSeg] = useState<'live' | 'all' | 'past'>('live');
  const [fetchedEvents, setFetchedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { width: screenWidth } = Dimensions.get('window');

  // Fetch events from the service
  const fetchEvents = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await eventService.getEvents({ page: 1, size: 20 });
      setFetchedEvents(response.events);
    } catch (error) {
      ErrorHandler.handle(error, 'fetchEvents');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchEvents(false);
    setRefreshing(false);
  }, [fetchEvents]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Convert API events to EventItem format for compatibility
  const convertToEventItem = (event: Event): EventItem => {
    const now = new Date();
    const endDate = event.endDateTime ? new Date(event.endDateTime) : null;
    const isPastByDate = endDate ? endDate < now : false;
    const isPastByStatus = [
      EventStatus.COMPLETED,
      EventStatus.CANCELLED,
    ].includes(event.eventStatus);
    const isPast = isPastByDate || isPastByStatus;

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

  const dataset = [...events, ...fetchedEvents.map(convertToEventItem)];
  const liveEvents = dataset.filter(e => !e.isPast);
  const pastEvents = dataset.filter(e => e.isPast);
  const allEvents = dataset;
  const activeEvents =
    seg === 'live' ? liveEvents : seg === 'past' ? pastEvents : allEvents;
  const emptyTitle =
    seg === 'live'
      ? 'No Live Events'
      : seg === 'past'
      ? 'No Past Events'
      : 'No Events Yet';
  const emptySubtitle =
    seg === 'live'
      ? 'No events are happening right now. Check back later or create your own event!'
      : seg === 'past'
      ? 'No past events to show. Your event history will appear here.'
      : 'Events you create or join will appear here.';

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={{ flex: 1 }}>
        {/* Fixed Header Section */}
        <View style={{ backgroundColor: colors.background }}>
          <HomeHeader
            user={user}
            onOpenMenu={onOpenMenu}
            onOpenChat={onOpenChat}
          />

          {/* Segmented control - Fixed */}
          <View
            style={{
              paddingHorizontal: spacing.xl,
              marginTop: spacing.md,
              // paddingBottom: spacing.sm,
            }}
          >
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}
            >
              {[
                { key: 'live' as const, label: 'Live' },
                { key: 'all' as const, label: 'All' },
                { key: 'past' as const, label: 'Past' },
              ].map(tab => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setSeg(tab.key)}
                  activeOpacity={0.7}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    paddingVertical: spacing.md,
                  }}
                >
                  <Text
                    style={{
                      color:
                        seg === tab.key
                          ? colors.text.primary
                          : colors.text.tertiary,
                      fontWeight:
                        seg === tab.key
                          ? typography.weight.semibold
                          : typography.weight.medium,
                      fontSize: typography.size.base,
                    }}
                  >
                    {tab.label}
                  </Text>
                  <View
                    style={{
                      marginTop: spacing.xs,
                      height: 4,
                      width: 28,
                      borderRadius: 2,
                      backgroundColor:
                        seg === tab.key ? colors.text.primary : 'transparent',
                    }}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Live indicator - Fixed */}
          {/* {seg === 'live' && activeEvents.length > 0 && (
            <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.md }}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.xs,
                  backgroundColor: brand.primary,
                  paddingHorizontal: spacing.lg,
                  paddingVertical: spacing.xs,
                  borderRadius: borderRadius.full,
                }}
              >
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF3B30' }} />
                <Text
                  style={{
                    color: colors.text.inverse,
                    fontWeight: typography.weight.semibold,
                    fontSize: typography.size.xs,
                    letterSpacing: 1,
                  }}
                >
                  LIVE NOW
                </Text>
              </View>
            </View>
          )} */}
        </View>

        {/* Scrollable Events Feed */}
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
          {isLoading ? (
            <EventListSkeleton count={3} />
          ) : activeEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar size={48} color={colors.text.tertiary} />}
              title={emptyTitle}
              subtitle={emptySubtitle}
              action={
                seg === 'live'
                  ? {
                      label: 'Create Event',
                      onPress: () => {
                        onCreateEvent?.();
                      },
                    }
                  : undefined
              }
            />
          ) : (
            <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg }}>
              {activeEvents.map(item => (
                <EventCard key={item.id} item={item} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>

      <TabBar active="home" onChange={onTabChange} />
    </SafeAreaWrapper>
  );
}
