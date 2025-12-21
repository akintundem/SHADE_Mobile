import React, { useState } from 'react';
import { ScrollView, View, RefreshControl, TouchableOpacity } from 'react-native';
import { HomeHeader } from '../components/HomeHeader';
import { EventSegmentedControl, SegmentType } from '../components/EventSegmentedControl';
import { EventCard, EventItem } from '../components/EventCard';
import { TabBar } from '../components/TabBar';
import { SafeAreaWrapper } from '../../../../common/components/SafeAreaWrapper';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { User } from '../../../../core/auth/types/auth';
import { useEvents } from '../hooks/useEvents';
import { useEventFilters } from '../hooks/useEventFilters';
import { convertEventsToItems } from '../utils/eventUtils';
import { EventListSkeleton, EmptyState } from '../../../../common/components/LoadingStates';
import { Calendar, Plus } from 'lucide-react-native';

type Props = {
  user: User;
  events?: EventItem[];
  onCreateEvent?: () => void;
  onOpenMenu?: () => void;
  onOpenCamera?: () => void;
  onOpenGallery?: () => void;
  onTabChange?: (tab: 'home' | 'manage' | 'profile') => void;
};

export default function ManageScreen({
  user,
  events = [],
  onCreateEvent,
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

      <TabBar active="manage" onChange={onTabChange as any} />
    </SafeAreaWrapper>
  );
}
