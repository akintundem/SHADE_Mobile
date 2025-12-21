import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { User } from '../../../core/auth/types/auth';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { authService } from '../../../core/auth/services/authService';
const ProfileScreen = React.lazy(() => import('../../profile/screens/ProfileScreen'));

type Props = {
  user: User;
  onLogout: () => void;
};

// Placeholder screens for events-dashboard (removed to focus on create-events)
const PlaceholderScreen = ({ title, onTabChange }: { title: string; onTabChange?: (tab: 'home' | 'manage' | 'profile') => void }) => {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.xl }}>
      <Text style={{ color: colors.text.primary, fontSize: typography.size.lg, fontWeight: typography.weight.semibold }}>
        {title}
      </Text>
      <Text style={{ color: colors.text.tertiary, fontSize: typography.size.sm, marginTop: spacing.md, textAlign: 'center' }}>
        Events dashboard has been removed. Focus on create-events feature.
      </Text>
    </View>
  );
};

export default function MainApp({ user, onLogout }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'home' | 'manage' | 'profile'>('profile');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {tab === 'home' ? (
        <PlaceholderScreen title="Home" onTabChange={setTab as any} />
      ) : tab === 'manage' ? (
        <PlaceholderScreen title="Manage" onTabChange={setTab as any} />
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
