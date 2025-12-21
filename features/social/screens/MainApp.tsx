import React, { useState } from 'react';
import { View } from 'react-native';
import { User } from '../../../core/auth/types/auth';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../../../core/auth/services/authService';
const ProfileScreen = React.lazy(() => import('../../profile/screens/ProfileScreen'));
const HomeScreen = React.lazy(() => import('../../events-dashboard/Home/screens/HomeScreen'));
const ManageScreen = React.lazy(() => import('../../events-dashboard/Home/screens/ManageScreen'));

type Props = {
  user: User;
  onLogout: () => void;
};

export default function MainApp({ user, onLogout }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'home' | 'manage' | 'profile'>('home');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {tab === 'home' ? (
        <React.Suspense fallback={null}>
          <HomeScreen user={user} onTabChange={setTab} />
        </React.Suspense>
      ) : tab === 'manage' ? (
        <React.Suspense fallback={null}>
          <ManageScreen user={user} onTabChange={setTab} />
        </React.Suspense>
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
    </View>
  );
}
