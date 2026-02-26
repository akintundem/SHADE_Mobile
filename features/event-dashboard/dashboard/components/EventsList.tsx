import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { Calendar } from 'lucide-react-native';
import { EventCard, EventItem } from './EventCard';
import { EventListSkeleton, EmptyState } from '../../../../common/components/LoadingStates';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { convertEventsToItems } from '../utils/eventUtils';
import { SegmentType } from './EventSegmentedControl';
import { useEventList } from '../hooks';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  events?: EventItem[];
  onCreateEvent?: () => void;
  showCreateAction?: boolean;
  onEventPress?: (item: EventItem) => void;
  activeSegment?: SegmentType;
};

export const EventsList = ({
  events = [],
  onCreateEvent,
  showCreateAction = false,
  onEventPress,
  activeSegment: activeSegmentProp,
}: Props) => {
  const { t } = useI18n();
  const { colors } = useTheme();
  const iconColor = colors.text.tertiary;
  const refreshTint = colors.text.primary;

  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, refresh } = useEventList({
    request: {
      page: 0,
      size: 20,
      isPublic: true,
    },
    enabled: true,
    source: activeSegmentProp === 'following' ? 'following' : 'forYou',
  });

  const serverEvents = useMemo(() => data?.content ?? [], [data?.content]);

  const allEvents = useMemo(() => {
    return [...events, ...convertEventsToItems(serverEvents)];
  }, [events, serverEvents]);

  const filteredEvents = useMemo(() => allEvents, [allEvents]);

  const emptyState = useMemo(
    () => ({
      title: t('NoEventsYet'),
      subtitle: t('EventsYouCreateOrJoinWillAppearHere'),
    }),
    [t]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh(true);
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const renderItem = useCallback(
    ({ item }: { item: EventItem }) => (
      <EventCard item={item} onPress={onEventPress} />
    ),
    [onEventPress]
  );

  return (
    <FlatList
      data={filteredEvents}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ListHeaderComponent={<View className="h-1" />}
      ListFooterComponent={<View className="h-5" />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={refreshTint}
          colors={[refreshTint]}
        />
      }
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        loading ? (
          <EventListSkeleton count={3} />
        ) : (
          <EmptyState
            icon={<Calendar size={48} color={iconColor} />}
            title={emptyState.title}
            subtitle={emptyState.subtitle}
            action={
              showCreateAction && onCreateEvent
                ? {
                    label: t('CreateEvent'),
                    onPress: onCreateEvent,
                  }
                : undefined
            }
          />
        )
      }
    />
  );
};
