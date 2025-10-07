import { EventItem } from '../components/EventCard';

export const examplePost: EventItem = {
  id: 'example-1',
  title: 'Summer Music Festival 2024',
  description:
    'Three days of incredible music featuring top artists from around the world. Join us for an unforgettable experience.',
  startAt: 'Jul 15 at 6:00 PM',
  venue: 'Golden Gate Park',
  city: 'San Francisco, CA',
  imageUrl:
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?q=80&w=1400&auto=format&fit=crop',
  stats: { posts: 1, comments: 105, likes: 42 },
  tag: 'Festival',
  cosigners: ['C1', 'C2', 'C3', 'C4', 'C5'],
  cosignedCount: 5,
  hashtags: ['music', 'festival', 'summer'],
};

