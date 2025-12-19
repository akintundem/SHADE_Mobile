import React, { useState } from 'react';
import { View } from 'react-native';
import { User } from '../../../core/auth/types/auth';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../../../core/auth/services/authService';
import HomeScreen from '../../events/Home/screens/HomeScreen';
import ManageScreen from '../../events/Home/screens/ManageScreen';
const ProfileScreen = React.lazy(() => import('../../profile/screens/ProfileScreen'));
const CreateEventScreen = React.lazy(() => import('../../events/Create/screens/CreateEventScreen'));

type Props = {
  user: User;
  onLogout: () => void;
};

export default function MainApp({ user, onLogout }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'home' | 'manage' | 'profile'>('home');
  const [isCreateEventOpen, setCreateEventOpen] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {tab === 'home' ? (
        <HomeScreen
          user={user}
          onTabChange={setTab as any}
          onCreateEvent={() => setCreateEventOpen(true)}
        />
      ) : tab === 'manage' ? (
        <ManageScreen
          user={user}
          onTabChange={setTab as any}
          onCreateEvent={() => setCreateEventOpen(true)}
        />
      ) : (
        <React.Suspense fallback={null}>
          <ProfileScreen 
            user={user} 
            onTabChange={setTab} 
            onLogout={async () => {
              if (loading) return;
              try {
                setLoading(true);
                // Wait for successful logout response from backend
                await authService.logout();
                // Only navigate to login screen after successful logout
                onLogout();
              } catch (err) {
                // Don't navigate if logout fails
              } finally {
                setLoading(false);
              }
            }} 
          />
        </React.Suspense>
      )}

      {isCreateEventOpen ? (
        <View style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: colors.background, zIndex: 100 }}>
          <React.Suspense fallback={null}>
            <CreateEventScreen onClose={() => setCreateEventOpen(false)} />
          </React.Suspense>
        </View>
      ) : null}
    </View>
  );
}

