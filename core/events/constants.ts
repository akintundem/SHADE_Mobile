import { EventType } from './types/event';

// Event categories mapped to EventType enum
export const EVENT_CATEGORIES = [
  { value: EventType.CONFERENCE, label: 'Conference' },
  { value: EventType.WORKSHOP, label: 'Workshop' },
  { value: EventType.SEMINAR, label: 'Seminar' },
  { value: EventType.MEETING, label: 'Meeting' },
  { value: EventType.PARTY, label: 'Party' },
  { value: EventType.WEDDING, label: 'Wedding' },
  { value: EventType.BIRTHDAY, label: 'Birthday' },
  { value: EventType.CORPORATE_EVENT, label: 'Corporate Event' },
  { value: EventType.TRADE_SHOW, label: 'Trade Show' },
  { value: EventType.CONCERT, label: 'Concert' },
  { value: EventType.FESTIVAL, label: 'Festival' },
  { value: EventType.SPORTS_EVENT, label: 'Sports Event' },
  { value: EventType.CHARITY_EVENT, label: 'Charity Event' },
  { value: EventType.NETWORKING, label: 'Networking' },
  { value: EventType.TRAINING, label: 'Training' },
  { value: EventType.RETREAT, label: 'Retreat' },
  { value: EventType.OTHER, label: 'Other' },
];

// Step definitions for the create event flow
type Step = {
  id: number;
  title: string;
  subtitle: string;
};

export const STEPS: Step[] = [
  { id: 0, title: 'Basics', subtitle: 'Title & Description' },
  { id: 1, title: 'Category', subtitle: 'Event Type' },
  { id: 2, title: 'When', subtitle: 'Date & Time' },
  { id: 3, title: 'Location', subtitle: 'Venue' },
  { id: 4, title: 'Access', subtitle: 'Public & Pricing' },
  { id: 5, title: 'Contributions', subtitle: 'Team Funding' },
  { id: 6, title: 'Review', subtitle: 'Final Check' },
];

