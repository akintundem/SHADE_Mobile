import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User } from '../../../core/auth/types/auth';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../../../core/auth/services/authService';
import { TabBar } from '../../profile/components/TabBar';
const ProfileScreen = React.lazy(() => import('../../profile/screens/ProfileScreen'));

type Props = {
  user: User;
  onLogout: () => void;
};

// Home and Manage screens
const HomeScreen = () => {
  const { colors, spacing, typography } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold }}>
          Home
        </Text>
        <Text style={{ color: colors.text.tertiary, fontSize: typography.size.sm, marginTop: spacing.md, textAlign: 'center' }}>
          Home screen content will be displayed here
        </Text>
      </View>
    </SafeAreaView>
  );
};

const ManageScreen = () => {
  const { colors, spacing, typography } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
        <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold }}>
          Manage
        </Text>
        <Text style={{ color: colors.text.tertiary, fontSize: typography.size.sm, marginTop: spacing.md, textAlign: 'center' }}>
          Manage screen content will be displayed here
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default function MainApp({ user, onLogout }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'home' | 'manage' | 'profile'>('home');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {tab === 'home' ? (
        <>
          <HomeScreen />
          <TabBar active="home" onChange={setTab} />
        </>
      ) : tab === 'manage' ? (
        <>
          <ManageScreen />
          <TabBar active="manage" onChange={setTab} />
        </>
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
