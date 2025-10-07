export type Region = {
  id: string;
  name: string;
  coords: [number, number]; // [lng, lat]
  totalEvents: number;
  activeEvents: number;
};

export type MapEvent = {
  id: string;
  title: string;
  type: 'Festival' | 'Concert' | 'Party' | 'Meetup' | 'Other';
  location: string;
  dates: string;
  people?: string; // e.g., '1 people'
  color: string; // hex for dot
};

export const regionsExamples: Region[] = [
  { id: 'nyc', name: 'New York City', coords: [-74.006, 40.7128], totalEvents: 15, activeEvents: 8 },
  { id: 'la', name: 'Los Angeles', coords: [-118.2437, 34.0522], totalEvents: 12, activeEvents: 5 },
  { id: 'chi', name: 'Chicago', coords: [-87.6298, 41.8781], totalEvents: 8, activeEvents: 3 },
  { id: 'aus', name: 'Austin', coords: [-97.7431, 30.2672], totalEvents: 6, activeEvents: 4 },
  { id: 'mia', name: 'Miami', coords: [-80.1918, 25.7617], totalEvents: 9, activeEvents: 2 },
];

export const eventsInViewExamples: MapEvent[] = [
  {
    id: 'ev1',
    title: 'Summer Music Festival',
    type: 'Festival',
    location: 'Central Park, New York',
    dates: 'Oct 8 - Oct 10',
    people: '1 people',
    color: '#F59E0B',
  },
  {
    id: 'ev2',
    title: 'Jazz Night Concert',
    type: 'Concert',
    location: 'Blue Note Jazz Club, NYC',
    dates: 'Oct 7',
    people: '1 people',
    color: '#8B5CF6',
  },
  {
    id: 'ev3',
    title: 'Beach Party Weekend',
    type: 'Party',
    location: 'Miami Beach, Florida',
    dates: 'Oct 9 - Oct 11',
    people: '1 people',
    color: '#EC4899',
  },
];

