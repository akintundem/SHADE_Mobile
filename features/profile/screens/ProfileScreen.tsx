import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ProfileHeader } from './components/ProfileHeader';
import { EventMiniCard } from './components/EventMiniCard';
import { TabBar } from '../../events/home/components/TabBar';
import SettingsScreen from './SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import { User } from '../../../shared/types';
import { useTheme } from '../../../shared/theme/ThemeProvider';

type Props = { user: User; onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void; onLogout?: () => void; onOpenCompose?: () => void };

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
        contentContainerStyle={{ paddingBottom: spacing['3xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <ProfileHeader user={user} onEditProfile={() => setView('edit')} onOpenSettings={() => setView('settings')} />

        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          {/* Segmented control */}
          <View style={{ 
            flexDirection: 'row',
            backgroundColor: colors.surface,
            borderRadius: borderRadius.lg,
            padding: spacing.xs,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            {[
              { key: 'posts', label: 'Posts' },
              { key: 'events', label: 'Events' },
            ].map(t => (
              <TouchableOpacity
                key={t.key}
                onPress={() => setSection(t.key as any)}
                activeOpacity={0.7}
                style={{
                  flex: 1,
                  paddingVertical: spacing.md,
                  borderRadius: borderRadius.md,
                  backgroundColor: section === t.key ? brand.primary : 'transparent',
                  alignItems: 'center',
                }}
              >
                <Text style={{
                  color: section === t.key ? '#FFFFFF' : colors.text.secondary,
                  fontWeight: section === t.key ? typography.weight.semibold : typography.weight.medium,
                  fontSize: typography.size.sm,
                }}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {section === 'events' ? (
            <View style={{ marginTop: spacing.lg, gap: spacing.md }}>
              <EventMiniCard
                title="Tech Conference 2024"
                date="Nov 14, 2024"
                location="San Francisco, CA"
                tagLeft="upcoming"
                tagRight="Creator"
                imageUrl="https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1400&auto=format&fit=crop"
              />
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
              paddingVertical: spacing['5xl'],
            }}>
              <Text style={{ 
                color: colors.text.tertiary,
                fontSize: typography.size.base,
              }}>
                No posts yet
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TabBar active="profile" onChange={onTabChange} />
    </SafeAreaView>
  );
}
