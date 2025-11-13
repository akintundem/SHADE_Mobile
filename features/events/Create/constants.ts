import { EventType } from '../../../shared/types';

export const STEPS = [
  { id: 0, title: 'Event Basics', subtitle: 'Start creating your event' },
  { id: 1, title: 'Categorize', subtitle: 'Help people find your event' },
  { id: 2, title: 'When', subtitle: 'Schedule your event' },
  { id: 3, title: 'Location', subtitle: 'Where is your event' },
  { id: 4, title: 'Access & Capacity', subtitle: 'Set who can attend your event' },
  { id: 5, title: 'Team & Contributions', subtitle: 'Add collaborators and funding options' },
  { id: 6, title: 'Review', subtitle: 'Double-check everything looks good' },
];

export const AVAILABLE_TAGS = [
  'Music',
  'Amapiano',
  'Fashion',
  'Food',
  'Culture',
  'Dance',
  'Art',
  'Sports',
  'Tech',
  'Business',
  'Networking',
  'Workshop',
];

export const EVENT_CATEGORIES = [
  { label: 'Conference', value: EventType.CONFERENCE },
  { label: 'Party', value: EventType.PARTY },
  { label: 'Concert', value: EventType.CONCERT },
  { label: 'Workshop', value: EventType.WORKSHOP },
  { label: 'Networking', value: EventType.NETWORKING },
  { label: 'Exhibition', value: EventType.TRADE_SHOW },
];

