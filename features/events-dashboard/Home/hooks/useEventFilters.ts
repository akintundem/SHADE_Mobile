import { useMemo } from 'react';
import { EventItem } from '../components/EventCard';
import { SegmentType } from '../components/EventSegmentedControl';

type EmptyStateConfig = {
  title: string;
  subtitle: string;
};

const EMPTY_STATE_CONFIG: Record<SegmentType, EmptyStateConfig> = {
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

export const useEventFilters = (
  events: EventItem[],
  activeSegment: SegmentType,
) => {
  const filteredEvents = useMemo(() => {
    switch (activeSegment) {
      case 'live':
        return events.filter(e => !e.isPast);
      case 'past':
        return events.filter(e => e.isPast);
      case 'all':
      default:
        return events;
    }
  }, [events, activeSegment]);

  const emptyState = useMemo(
    () => EMPTY_STATE_CONFIG[activeSegment],
    [activeSegment],
  );

  return {
    filteredEvents,
    emptyState,
  };
};

