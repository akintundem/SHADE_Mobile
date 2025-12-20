import React, { useState } from 'react';
import { View } from 'react-native';
import { User } from '../../../core/auth/types/auth';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../../../core/auth/services/authService';
import HomeScreen from '../../events/Home/screens/HomeScreen';
import ManageScreen from '../../events/Home/screens/ManageScreen';
const ProfileScreen = React.lazy(() => import('../../profile/screens/ProfileScreen'));

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
        <HomeScreen
          user={user}
          onTabChange={setTab as any}
        />
      ) : tab === 'manage' ? (
        <ManageScreen
          user={user}
          onTabChange={setTab as any}
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
    </View>
  );
}

