import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, TouchableOpacity, Animated, RefreshControl } from 'react-native';
import { HomeHeader } from './components/HomeHeader';
import { EventCard, EventItem } from './components/EventCard';
import { EmptyFeed } from './components/EmptyFeed';
import { TabBar } from './components/TabBar';
import { SafeAreaWrapper } from '../components/SafeAreaWrapper';
import { EventListSkeleton, EmptyState } from '../components/LoadingStates';
import { useTheme } from '../theme/ThemeProvider';
import { User, Event, EventStatus } from '../types';
import { eventService } from '../services/eventService';
import { ErrorHandler } from '../utils/errorHandler';
import { Flame, Clock, Calendar } from 'lucide-react-native';

type Props = {
  user: User;
  events?: EventItem[];
  onCreatePost?: () => void;
  onOpenMenu?: () => void;
  onOpenChat?: () => void;
  showExampleWhenEmpty?: boolean;
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
};

export default function HomeScreen({ user, events = [], onOpenMenu, onOpenChat, showExampleWhenEmpty = true, onTabChange }: Props) {
  const { colors, spacing, brand, borderRadius, typography, shadows } = useTheme();
  const [seg, setSeg] = useState<'live' | 'past'>('live');
  const [fetchedEvents, setFetchedEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
    const isPastByStatus = [EventStatus.COMPLETED, EventStatus.CANCELLED].includes(event.eventStatus);
    const isPast = isPastByDate || isPastByStatus;

    return {
      id: event.id,
      title: event.name,
      description: event.description ?? undefined,
      venue: event.targetAudience ?? (event.isPublic ? 'Open to everyone' : 'Invite only'),
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

  // Pulse animation for the Live indicator
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 0.35, duration: 600, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <SafeAreaWrapper edges={['top']}>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: spacing.xl }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <HomeHeader user={user} onOpenMenu={onOpenMenu} onOpenChat={onOpenChat} />

        {/* Segmented control */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
          <View style={{
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: 28,
            padding: spacing.xs,
            borderWidth: 1,
            borderColor: colors.border,
            ...shadows.sm,
          }}>
            {/* Live */}
            <TouchableOpacity
              onPress={() => setSeg('live')}
              activeOpacity={0.9}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.full,
                backgroundColor: seg === 'live' ? colors.primary : 'transparent',
                ...(seg === 'live' ? shadows.sm : {}),
              }}
            >
              <Animated.View style={{ opacity: pulse }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: seg === 'live' ? colors.text.inverse : colors.primary }} />
              </Animated.View>
              <Flame size={16} color={seg === 'live' ? colors.text.inverse : colors.text.secondary} />
              <Text style={{
                color: seg === 'live' ? colors.text.inverse : colors.text.secondary,
                fontWeight: seg === 'live' ? typography.weight.semibold : typography.weight.medium,
                fontSize: typography.size.sm,
              }}>Live</Text>
            </TouchableOpacity>

            {/* Past */}
            <TouchableOpacity
              onPress={() => setSeg('past')}
              activeOpacity={0.9}
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: spacing.xs,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.full,
                backgroundColor: seg === 'past' ? colors.primary : 'transparent',
                ...(seg === 'past' ? shadows.sm : {}),
              }}
            >
              <Clock size={16} color={seg === 'past' ? colors.text.inverse : colors.text.secondary} />
              <Text style={{
                color: seg === 'past' ? colors.text.inverse : colors.text.secondary,
                fontWeight: seg === 'past' ? typography.weight.semibold : typography.weight.medium,
                fontSize: typography.size.sm,
              }}>Past</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Feed */}
        <View style={{ paddingHorizontal: spacing.xl, marginTop: spacing['2xl'], gap: spacing['2xl'] }}>
          {isLoading ? (
            <EventListSkeleton count={3} />
          ) : (seg === 'live' ? liveEvents : pastEvents).length === 0 ? (
            <EmptyState
              icon={<Calendar size={48} color={colors.text.tertiary} />}
              title={`No ${seg === 'live' ? 'Live' : 'Past'} Events`}
              subtitle={seg === 'live' 
                ? "No events are happening right now. Check back later or create your own event!"
                : "No past events to show. Your event history will appear here."
              }
              action={seg === 'live' ? {
                label: "Create Event",
                onPress: () => {},
              } : undefined}
            />
          ) : (
            (seg === 'live' ? liveEvents : pastEvents).map(item => <EventCard key={item.id} item={item} />)
          )}
        </View>
      </ScrollView>

      <TabBar active="home" onChange={onTabChange} />
    </SafeAreaWrapper>
  );
}
