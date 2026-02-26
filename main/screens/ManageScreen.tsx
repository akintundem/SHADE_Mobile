import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Calendar, Ticket } from 'lucide-react-native';
import { useTheme } from '../../common/theme/ThemeProvider';
import { User } from '../../core/auth/types/auth';
import { eventService } from '../../core/events/services/event';
import { attendeeService } from '../../core/attendee/services/attendee';
import { EventResponse, EventStatus } from '../../core/events/types/event';
import { ErrorHandler } from '../../common/utils/errorHandler';
import { EmptyState } from '../../common/components/LoadingStates';
import { RootStackNavigationProp } from '../../navigation/types';
import { getImageUrl } from '../../config/appConfig';
import {
  HostingCard,
  AttendingCard,
  HostingSkeleton,
  AttendingSkeleton,
  ManageHeader,
  HostingSummaryChips,
} from './manage/components';

type Tab = 'hosting' | 'attending';

type Props = {
  user: User;
  onCreateEvent: () => void;
};

export default function ManageScreen({ onCreateEvent: _onCreateEvent }: Props) {
  const { colors } = useTheme();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [activeTab, setActiveTab] = useState<Tab>('hosting');

  const [upcomingEvents, setUpcomingEvents] = useState<EventResponse[]>([]);
  const [pastEvents, setPastEvents] = useState<EventResponse[]>([]);
  const [hostingLoading, setHostingLoading] = useState(true);
  const [hostingRefreshing, setHostingRefreshing] = useState(false);

  const [attendingEvents, setAttendingEvents] = useState<EventResponse[]>([]);
  const [attendingLoading, setAttendingLoading] = useState(true);
  const [attendingRefreshing, setAttendingRefreshing] = useState(false);

  const fetchHosting = useCallback(async (isRefresh = false) => {
    if (isRefresh) setHostingRefreshing(true);
    else setHostingLoading(true);
    try {
      const [upcoming, past] = await Promise.all([
        eventService.listMyEvents({ timeframe: 'UPCOMING', size: 20, sortBy: 'startDateTime', sortDirection: 'ASC' }),
        eventService.listMyEvents({ timeframe: 'PAST', size: 5, sortBy: 'startDateTime', sortDirection: 'DESC' }),
      ]);
      setUpcomingEvents(upcoming.content ?? []);
      setPastEvents(past.content ?? []);
    } catch (err) {
      ErrorHandler.handle(err, 'ManageScreen.fetchHosting');
    } finally {
      setHostingLoading(false);
      setHostingRefreshing(false);
    }
  }, []);

  const fetchAttending = useCallback(async (isRefresh = false) => {
    if (isRefresh) setAttendingRefreshing(true);
    else setAttendingLoading(true);
    try {
      const result = await attendeeService.getInvitedEvents({ page: 0, size: 30 });
      setAttendingEvents(result.content ?? []);
    } catch (err) {
      ErrorHandler.handle(err, 'ManageScreen.fetchAttending');
    } finally {
      setAttendingLoading(false);
      setAttendingRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchHosting(); }, [fetchHosting]);
  useEffect(() => { fetchAttending(); }, [fetchAttending]);

  const handleHostingPress = useCallback((event: EventResponse) => {
    navigation.navigate('EventAdmin', {
      eventId: event.id,
      title: event.name,
      imageUrl: getImageUrl(event.coverImageUrl) ?? undefined,
      status: event.eventStatus,
      accessType: event.accessType,
      userContext: event.userContext,
      ticketTypes: event.ticketTypes,
    });
  }, [navigation]);

  const handleAttendingPress = useCallback((event: EventResponse) => {
    navigation.navigate('EventDetail', {
      eventId: event.id,
      accessType: event.accessType,
      userContext: event.userContext,
      ticketTypes: event.ticketTypes,
    });
  }, [navigation]);

  const handleTicketsPress = useCallback((event: EventResponse) => {
    navigation.navigate('TicketsManagement', {
      eventId: event.id,
      userContext: event.userContext,
    });
  }, [navigation]);

  const handleFeedPress = useCallback((event: EventResponse) => {
    navigation.navigate('EventFeeds', {
      eventId: event.id,
      eventName: event.name,
      coverImageUrl: getImageUrl(event.coverImageUrl) ?? undefined,
      userContext: event.userContext,
    });
  }, [navigation]);

  const isRefreshing = activeTab === 'hosting' ? hostingRefreshing : attendingRefreshing;
  const onRefresh = useCallback(
    () => activeTab === 'hosting' ? fetchHosting(true) : fetchAttending(true),
    [activeTab, fetchHosting, fetchAttending],
  );

  const activeCount = upcomingEvents.filter(e =>
    e.eventStatus === EventStatus.REGISTRATION_OPEN ||
    e.eventStatus === EventStatus.PUBLISHED ||
    e.eventStatus === EventStatus.IN_PROGRESS,
  ).length;
  const totalAttendees = upcomingEvents.reduce((s, e) => s + (e.currentAttendeeCount ?? 0), 0);

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ManageHeader activeTab={activeTab} onTabChange={setActiveTab} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.text.primary}
            colors={[colors.text.primary]}
          />
        }
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
      >
        {activeTab === 'hosting' ? (
          hostingLoading ? (
            <View className="pt-md">
              {[0, 1, 2].map(i => <HostingSkeleton key={i} />)}
            </View>
          ) : upcomingEvents.length === 0 && pastEvents.length === 0 ? (
            <EmptyState
              icon={<Calendar size={26} color={colors.text.tertiary} strokeWidth={1.5} />}
              title="No events yet"
              subtitle="Events you create will appear here"
            />
          ) : (
            <View className="pt-sm">
              <HostingSummaryChips
                upcomingCount={upcomingEvents.length}
                activeCount={activeCount}
                totalAttendees={totalAttendees}
              />
              {upcomingEvents.length > 0 && (
                <View className="mb-sm">
                  <Text className="text-xs font-semibold uppercase tracking-[0.6px] text-txt-tertiary dark:text-txt-dark-tertiary mb-md">
                    Upcoming
                  </Text>
                  {upcomingEvents.map(event => (
                    <HostingCard key={event.id} event={event} onPress={() => handleHostingPress(event)} />
                  ))}
                </View>
              )}
              {pastEvents.length > 0 && (
                <View>
                  <Text className="text-xs font-semibold uppercase tracking-[0.6px] text-txt-tertiary dark:text-txt-dark-tertiary mb-md mt-sm">
                    Recent
                  </Text>
                  {pastEvents.map(event => (
                    <HostingCard key={event.id} event={event} onPress={() => handleHostingPress(event)} />
                  ))}
                </View>
              )}
            </View>
          )
        ) : (
          attendingLoading ? (
            <View className="pt-md">
              {[0, 1, 2].map(i => <AttendingSkeleton key={i} />)}
            </View>
          ) : attendingEvents.length === 0 ? (
            <EmptyState
              icon={<Ticket size={26} color={colors.text.tertiary} strokeWidth={1.5} />}
              title="Nothing here yet"
              subtitle="Events you've been invited to or have tickets for will appear here"
            />
          ) : (
            <View className="pt-sm">
              <Text className="text-xs font-semibold uppercase tracking-[0.6px] text-txt-tertiary dark:text-txt-dark-tertiary mb-md">
                {attendingEvents.length} event{attendingEvents.length !== 1 ? 's' : ''}
              </Text>
              {attendingEvents.map(event => (
                <AttendingCard
                  key={event.id}
                  event={event}
                  onPress={() => handleAttendingPress(event)}
                  onTicketsPress={() => handleTicketsPress(event)}
                  onFeedPress={() => handleFeedPress(event)}
                />
              ))}
            </View>
          )
        )}
      </ScrollView>
    </View>
  );
}
