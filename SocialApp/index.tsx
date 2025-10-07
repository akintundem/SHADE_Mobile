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
const ComposeScreen = React.lazy(() => import('../Compose/ComposeScreen'));
import EdgeSwipeToCompose from '../gestures/EdgeSwipeToCompose';

type Props = {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
};

export default function SocialApp({ user, onLogout }: Props) {
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'home' | 'discover' | 'map' | 'profile'>('home');
  const [isComposeOpen, setComposeOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      {tab === 'home' ? (
        <HomeScreen user={user} onTabChange={setTab} onCreatePost={() => setComposeOpen(true)} />
      ) : tab === 'discover' ? (
        <DiscoverScreen user={user} onTabChange={setTab} />
      ) : tab === 'map' ? (
        <React.Suspense fallback={null}>
          <LazyMapScreen user={user} onTabChange={setTab} />
        </React.Suspense>
      ) : (
        <React.Suspense fallback={null}>
          <ProfileScreen user={user} onTabChange={setTab} onOpenCompose={() => setComposeOpen(true)} onLogout={async () => {
            if (loading) return;
            setLoading(true);
            await authService.logout();
            setLoading(false);
            onLogout();
          }} />
        </React.Suspense>
      )}

      {/* Edge-swipe opener like stories (left-edge → right swipe) */}
      {!isComposeOpen && tab === 'home' ? (
        <EdgeSwipeToCompose enabled onOpen={() => setComposeOpen(true)} />
      ) : null}

      {isComposeOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: '#FFFFFF', zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <ComposeScreen onClose={() => setComposeOpen(false)} />
          </React.Suspense>
        </View>
      ) : null}
    </View>
  );
}
