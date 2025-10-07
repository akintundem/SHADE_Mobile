import React, { useState } from 'react';
import { View } from 'react-native';
import { User } from '../types';
import { authService } from '../services/authService';
import HomeScreen from '../Home/HomeScreen';
import DiscoverScreen from '../Discover/DiscoverScreen';
// Lazy-load MapScreen to avoid initializing native map module until needed
// This also sidesteps import-time errors if native module isn't linked yet
const LazyMapScreen = React.lazy(() => import('../Map/MapScreen'));
const ProfileScreen = React.lazy(() => import('../Profile/ProfileScreen'));

type Props = {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
};

export default function SocialApp({ user, onLogout }: Props) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'home' | 'discover' | 'map' | 'profile'>('home');

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {tab === 'home' ? (
        <HomeScreen user={user} onTabChange={setTab} />
      ) : tab === 'discover' ? (
        <DiscoverScreen user={user} onTabChange={setTab} />
      ) : tab === 'map' ? (
        <React.Suspense fallback={null}>
          <LazyMapScreen user={user} onTabChange={setTab} />
        </React.Suspense>
      ) : (
        <React.Suspense fallback={null}>
          <ProfileScreen user={user} onTabChange={setTab} onLogout={async () => {
            if (loading) return;
            setLoading(true);
            await authService.logout();
            setLoading(false);
            onLogout();
          }} />
        </React.Suspense>
      )}
    </View>
  );
}
