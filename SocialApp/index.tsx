import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User as UserIcon } from 'lucide-react-native';
import { User } from '../types';
import { authService } from '../services/authService';
import HomeScreen from '../Home/HomeScreen';
import DiscoverScreen from '../Discover/DiscoverScreen';
// Lazy-load MapScreen to avoid initializing native map module until needed
// This also sidesteps import-time errors if native module isn't linked yet
const LazyMapScreen = React.lazy(() => import('../Map/MapScreen'));

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
        <HomeScreen user={user} onTabChange={setTab} />
      )}

      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', right: 16, bottom: 90 }}>
        <TouchableOpacity
          onPress={async () => {
            if (loading) return;
            setLoading(true);
            await authService.logout();
            setLoading(false);
            onLogout();
          }}
          accessibilityLabel="Logout"
          style={{
            height: 44,
            borderRadius: 22,
            backgroundColor: '#ef4444',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            paddingHorizontal: 14,
            gap: 6,
          }}
        >
          <LogOut color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '600' }}>{loading ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
