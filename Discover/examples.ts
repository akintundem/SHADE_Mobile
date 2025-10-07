import { TrendingItem } from './components/TrendingCard';
import { RecentItem } from './components/RecentCard';

export const trendingExamples: TrendingItem[] = [
  {
    id: 'taylor-eras-london',
    typeLabel: 'Concert',
    archived: true,
    title: 'Taylor Swift Eras Tour - London',
    date: 'Jun 21, 2024',
    location: 'Wembley Stadium, London',
    description: "Historic performance at Wembley Stadium breaking attendance records",
    imageUrl:
      'https://images.unsplash.com/photo-1464375117522-1311d6a5b81a?q=80&w=1400&auto=format&fit=crop',
    stats: { attendees: 90000, posts: 78 },
    hashtags: ['taylor-swift', 'eras-tour'],
  },
  {
    id: 'rock-in-rio-2024',
    typeLabel: 'Music Festival',
    archived: true,
    title: 'Rock in Rio 2024',
    date: 'Sep 12, 2024',
    location: 'Rio de Janeiro, Brazil',
    description: "Brazil's legendary festival returns with an incredible lineup",
    imageUrl:
      'https://images.unsplash.com/photo-1461360228754-6e81c478b882?q=80&w=1400&auto=format&fit=crop',
    stats: { attendees: 700000, posts: 156 },
    hashtags: ['rock-in-rio', 'brazil'],
  },
];

export const recentExamples: RecentItem[] = [
  {
    id: 'summer-music-festival',
    tag: 'Festival',
    title: 'Summer Music Festival',
    date: 'Oct 8, 2025',
    location: 'Central Park, New York',
    description: 'Annual summer music festival featuring top artists',
    imageUrl: 'https://images.unsplash.com/photo-1507874457470-272b3c8d8ee2?q=80&w=1400&auto=format&fit=crop',
    status: 'upcoming',
  },
  {
    id: 'jazz-night-concert',
    tag: 'Concert',
    title: 'Jazz Night Concert',
    date: 'Oct 7, 2025',
    location: 'Blue Note Jazz Club, NYC',
    description: 'Intimate jazz performance in the city',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1400&auto=format&fit=crop',
    status: 'upcoming',
  },
  {
    id: 'beach-party-weekend',
    tag: 'Party',
    title: 'Beach Party Weekend',
    date: 'Oct 9, 2025',
    location: 'Miami Beach, Florida',
    imageUrl: 'https://images.unsplash.com/photo-1470014464490-58f4b4ee0a44?q=80&w=1400&auto=format&fit=crop',
    status: 'upcoming',
  },
];

