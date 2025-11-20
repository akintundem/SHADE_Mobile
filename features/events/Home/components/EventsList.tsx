import React from 'react';
import { View } from 'react-native';
import { EventCard, EventItem } from './EventCard';
import { EventListSkeleton, EmptyState } from '../../../../shared/components/LoadingStates';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { Calendar } from 'lucide-react-native';

type Props = {
  events: EventItem[];
  isLoading: boolean;
  emptyState: {
    title: string;
    subtitle: string;
  };
  onCreateEvent?: () => void;
  showCreateAction?: boolean;
};

export const EventsList = ({
  events,
  isLoading,
  emptyState,
  onCreateEvent,
  showCreateAction = false,
}: Props) => {
  const { colors, spacing } = useTheme();

  if (isLoading) {
    return <EventListSkeleton count={3} />;
  }

  if (events.length === 0) {
    return (
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
    );
  }

  return (
    <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg }}>
      {events.map(item => (
        <EventCard key={item.id} item={item} />
      ))}
    </View>
  );
};
