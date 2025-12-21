export interface EventExample {
  id: string;
  title: string;
  location: string;
}

export const recentExamples: EventExample[] = [
  {
    id: '1',
    title: 'Coffee Meetup',
    location: 'Downtown Cafe'
  },
  {
    id: '2', 
    title: 'Tech Conference',
    location: 'Convention Center'
  },
  {
    id: '3',
    title: 'Art Gallery Opening',
    location: 'Modern Art Museum'
  },
  {
    id: '4',
    title: 'Music Festival',
    location: 'Central Park'
  },
  {
    id: '5',
    title: 'Book Club Meeting',
    location: 'Public Library'
  }
];
