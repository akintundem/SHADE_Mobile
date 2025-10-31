/**
 * Event utility functions for Shade app
 */

export type EventType = 'concert' | 'festival' | 'trip' | 'party' | 'conference' | 'exhibition';

export interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: {
    name: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  type: EventType;
  image?: string;
  cosigners: string[];
  creators: string[];
  isLive?: boolean;
}

/**
 * Check if an event is currently live
 */
export function isEventLive(startDate: string, endDate?: string): boolean {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  return now >= start && now <= end;
}

/**
 * Format event date range
 */
export const formatEventDate = (startDate: string, endDate?: string): string => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : null;

  const startFormatted = start.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  if (end && end.toDateString() !== start.toDateString()) {
    const endFormatted = end.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    return `${startFormatted} - ${endFormatted}`;
  }

  return startFormatted;
};

/**
 * Get event type color class (for web)
 */
export const getEventTypeColor = (type: EventType): string => {
  switch (type) {
    case 'concert': return 'bg-purple-500';
    case 'festival': return 'bg-yellow-500';
    case 'trip': return 'bg-gray-900';
    case 'party': return 'bg-pink-500';
    case 'conference': return 'bg-green-500';
    case 'exhibition': return 'bg-orange-500';
    default: return 'bg-gray-500';
  }
};

/**
 * Get event type color hex value
 */
export const getEventTypeColorHex = (type: EventType): string => {
  switch (type) {
    case 'concert': return '#a855f7';
    case 'festival': return '#eab308';
    case 'trip': return '#000000';
    case 'party': return '#ec4899';
    case 'conference': return '#10b981';
    case 'exhibition': return '#f97316';
    default: return '#6b7280';
  }
};

/**
 * Get event type icon
 */
export const getEventTypeIcon = (type: EventType): string => {
  switch (type) {
    case 'concert': return '🎵';
    case 'festival': return '🎪';
    case 'trip': return '✈️';
    case 'party': return '🎉';
    case 'conference': return '💼';
    case 'exhibition': return '🎨';
    default: return '📍';
  }
};

/**
 * Get event status
 */
export const getEventStatus = (startDate: string, endDate?: string): 'upcoming' | 'live' | 'ended' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;

  if (now < start) return 'upcoming';
  if (now >= start && now <= end) return 'live';
  return 'ended';
};

/**
 * Get participant count
 */
export const getParticipantCount = (event: Event): number => {
  return event.cosigners.length + event.creators.length;
};

/**
 * Check if user is participating in event
 */
export const isUserParticipating = (event: Event, userId: string): boolean => {
  return event.cosigners.includes(userId) || event.creators.includes(userId);
};

/**
 * Get event duration in hours
 */
export const getEventDuration = (startDate: string, endDate?: string): number => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : start;
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
};

/**
 * Format event duration
 */
export const formatEventDuration = (startDate: string, endDate?: string): string => {
  const duration = getEventDuration(startDate, endDate);
  
  if (duration < 1) {
    return 'Less than 1 hour';
  } else if (duration === 1) {
    return '1 hour';
  } else if (duration < 24) {
    return `${duration} hours`;
  } else {
    const days = Math.floor(duration / 24);
    const hours = duration % 24;
    if (hours === 0) {
      return days === 1 ? '1 day' : `${days} days`;
    } else {
      return `${days}d ${hours}h`;
    }
  }
};
