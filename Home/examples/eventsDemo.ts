import { EventItem } from '../components/EventCard';

export const demoEvents: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Taylor Swift Eras – Wembley',
    description: 'Historic performance at Wembley. Stadium breaking attendance records.',
    startAt: 'Jun 21, 2025',
    venue: 'Wembley Stadium',
    city: 'London',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop',
    stats: { posts: 2, comments: 201, likes: 1126 },
    tag: 'Event',
    hashtags: ['eras', 'wembley', 'live'],
    cosigners: ['@mike', '@jess'],
    cosignedCount: 42000,
  },
  {
    id: 'evt-2',
    title: 'Afrobeats All Stars – Lagos',
    description: 'A night of hits and culture.',
    endAt: 'May 9, 2025',
    venue: 'Tafawa Balewa Square',
    city: 'Lagos',
    imageUrl: 'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?q=80&w=1400&auto=format&fit=crop',
    stats: { posts: 5, comments: 90, likes: 560 },
    tag: 'Event',
    hashtags: ['afrobeats', 'night'],
    cosigners: ['@tunde'],
    cosignedCount: 12000,
  },
  {
    id: 'evt-3',
    title: 'Coachella 2025 – Weekend 1',
    description: 'World-class performances and art.',
    endAt: 'Apr 14, 2025',
    venue: 'Empire Polo Club',
    city: 'Indio',
    state: 'CA',
    imageUrl: 'https://images.unsplash.com/photo-1506158775495-ecf6f1f1b1b5?q=80&w=1400&auto=format&fit=crop',
    stats: { posts: 10, comments: 300, likes: 2100 },
    tag: 'Festival',
    hashtags: ['coachella', 'festival', 'desert'],
    cosigners: ['@zoe', '@amy', '@kai'],
    cosignedCount: 99000,
  },
];


