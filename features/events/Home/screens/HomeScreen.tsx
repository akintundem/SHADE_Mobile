import React, { useState } from 'react';
import { ScrollView, View, RefreshControl } from 'react-native';
import { HomeHeader } from '../components/HomeHeader';
import { EventSegmentedControl, SegmentType } from '../components/EventSegmentedControl';
import { EventsList } from '../components/EventsList';
import { TabBar } from '../components/TabBar';
import { SafeAreaWrapper } from '../../../../shared/components/SafeAreaWrapper';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { User } from '../../../../shared/types';
import { EventItem } from '../components/EventCard';
import { useEvents } from '../hooks/useEvents';
import { useEventFilters } from '../hooks/useEventFilters';
import { convertEventsToItems } from '../utils/eventUtils';

type Props = {
  user: User;
  events?: EventItem[];
  onCreateEvent?: () => void;
  onOpenMenu?: () => void;
  onOpenChat?: () => void;
  onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void;
};

export default function HomeScreen({
  user,
  events = [],
  onCreateEvent,
  onOpenMenu,
  onOpenChat,
  onTabChange,
}: Props) {
  const { colors, spacing } = useTheme();
  const [activeSegment, setActiveSegment] = useState<SegmentType>('live');

  const { events: fetchedEvents, isLoading, refreshing, onRefresh } = useEvents();
  const allEvents = [...events, ...convertEventsToItems(fetchedEvents)];
  const { filteredEvents, emptyState } = useEventFilters(allEvents, activeSegment);

  return (
    <SafeAreaWrapper edges={['top']}>
      <View style={{ flex: 1 }}>
        <View style={{ backgroundColor: colors.background }}>
          <HomeHeader user={user} onOpenMenu={onOpenMenu} />
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
          <EventsList
            events={filteredEvents}
            isLoading={isLoading}
            emptyState={emptyState}
            onCreateEvent={onCreateEvent}
            showCreateAction={activeSegment === 'live'}
            onOpenChat={onOpenChat}
          />
        </ScrollView>
      </View>

      <TabBar active="home" onChange={onTabChange} />
    </SafeAreaWrapper>
  );
}
