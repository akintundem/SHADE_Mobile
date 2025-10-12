import React from 'react';
import { EventProfileScreen } from '../components/EventProfileScreen';
import { useRoute, useNavigation } from '@react-navigation/native';

type Params = { title: string; imageUrl?: string; bio?: string; posts?: any[] };

export const EventProfileRoute = () => {
  const route = useRoute() as any;
  const navigation = useNavigation();
  const { title, imageUrl, bio, posts } = (route.params || {}) as Params;

  const examplePosts = [
    {
      id: 'ap-1',
      user: { name: 'Maya Johnson', handle: 'essencefan', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop' },
      timestamp: '2h',
      text: 'What a night! Crowd was electric 🔥',
    },
    {
      id: 'ap-2',
      user: { name: 'Leo Park', handle: 'leop', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop', verified: true },
      timestamp: '1h',
      photos: [imageUrl || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop'],
      text: 'From the pit. Unreal energy!',
    },
    {
      id: 'ap-3',
      user: { name: 'Naomi', handle: 'nao', avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=300&auto=format&fit=crop' },
      timestamp: '45m',
      text: 'Backstage vibes before the encore.',
    },
    {
      id: 'ap-4',
      user: { name: 'Dev', handle: 'dev', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=300&auto=format&fit=crop' },
      timestamp: '30m',
      photos: [
        'https://images.unsplash.com/photo-1546484489-8d43d2a2d4d1?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1533139502658-0198f920d8e8?q=80&w=1400&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1400&auto=format&fit=crop',
      ],
    },
    {
      id: 'ap-5',
      user: { name: 'Luca', handle: 'luca', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop', verified: true },
      timestamp: '12m',
      text: 'Short clip from the encore 🔊',
      video: 'https://www.w3schools.com/html/mov_bbb.mp4',
    },
  ];

  return (
    <EventProfileScreen
      onClose={() => (navigation as any).goBack()}
      title={title || 'Event'}
      imageUrl={imageUrl}
      bio={bio || 'Live thoughts and media from the community.'}
      posts={(posts && posts.length > 0) ? posts : examplePosts}
    />
  );
};


