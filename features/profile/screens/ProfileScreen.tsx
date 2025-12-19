import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ProfileHeader } from '../components/ProfileHeader';
import { EventMiniCard } from '../components/EventMiniCard';
import { TabBar } from '../../events/Home/components/TabBar';
import SettingsScreen from './SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import { User } from '../../auth/types/auth';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = { user: User; onTabChange?: (tab: 'home' | 'manage' | 'profile') => void; onLogout?: () => void };

export default function ProfileScreen({ user, onTabChange, onLogout }: Props) {
  const { colors, brand, typography, spacing, borderRadius } = useTheme();
  const [view, setView] = useState<'profile' | 'settings' | 'edit'>('profile');
  const [section, setSection] = useState<'posts' | 'events'>('events');

  if (view === 'settings') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <SettingsScreen user={user} onClose={() => setView('profile')} onLogout={onLogout} />
        <TabBar active="profile" onChange={onTabChange} />
      </View>
    );
  }

  if (view === 'edit') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <EditProfileScreen user={user} onBack={() => setView('profile')} />
        <TabBar active="profile" onChange={onTabChange} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: spacing['6xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader user={user} onEditProfile={() => setView('edit')} onOpenSettings={() => setView('settings')} />

        <View style={{ marginTop: spacing.xl }}>
          {/* Wealthsimple-style Flat Navigation */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: spacing.xl,
            borderBottomWidth: 1,
            borderBottomColor: colors.divider,
          }}>
            {[
              { key: 'events', label: 'Events' },
              { key: 'posts', label: 'Posts' },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setSection(t.key as any)}
                activeOpacity={0.7}
                style={{
                  paddingVertical: spacing.lg,
                  marginRight: spacing['2xl'],
                  borderBottomWidth: section === t.key ? 2 : 0,
                  borderBottomColor: colors.text.primary,
                }}
              >
                <Text style={{
                  color: section === t.key ? colors.text.primary : colors.text.tertiary,
                  fontWeight: section === t.key ? typography.weight.bold : typography.weight.medium,
                  fontSize: typography.size.base,
                  letterSpacing: -0.2,
                }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.xl }}>
            {section === 'events' ? (
              <View style={{ gap: spacing.xl }}>
                <EventMiniCard
                  title="Tech Conference 2024"
                  date="Nov 14, 2024"
                  location="San Francisco, CA"
                  tagLeft="upcoming"
                  tagRight="Creator"
                  imageUrl="https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1400&auto=format&fit=crop"
                />
                <View style={{ height: 1, backgroundColor: colors.divider, opacity: 0.5 }} />
                <EventMiniCard
                  title="Live Sessions Night"
                  date="May 22, 2025"
                  location="Los Angeles, CA"
                  tagLeft="completed"
                  tagRight="Creator"
                  imageUrl="https://images.unsplash.com/photo-1461784180009-21121b2f2045?q=80&w=1400&auto=format&fit=crop"
                />
              </View>
            ) : (
              <View style={{
                alignItems: 'center',
                paddingVertical: spacing['7xl'],
              }}>
                <Text style={{
                  color: colors.text.tertiary,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.medium,
                }}>
                  No posts yet
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <TabBar active="profile" onChange={onTabChange} />
    </SafeAreaView>
  );
}
