import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text } from 'react-native';
import { ProfileHeader } from './components/ProfileHeader';
import { EventMiniCard } from './components/EventMiniCard';
import { TabBar } from '../Home/components/TabBar';
import SettingsScreen from './SettingsScreen';
import EditProfileScreen from './EditProfileScreen';
import { User } from '../types';

type Props = { user: User; onTabChange?: (tab: 'home' | 'discover' | 'map' | 'profile') => void; onLogout?: () => void };

export default function ProfileScreen({ user, onTabChange, onLogout }: Props) {
  const [view, setView] = useState<'profile' | 'settings' | 'edit'>('profile');
  const [section, setSection] = useState<'posts' | 'events'>('events');

  if (view === 'settings') {
    return (
      <View style={{ flex: 1 }}>
        <SettingsScreen onClose={() => setView('profile')} onLogout={onLogout} />
        <TabBar active="profile" onChange={onTabChange} />
      </View>
    );
  }

  if (view === 'edit') {
    return (
      <View style={{ flex: 1 }}>
        <EditProfileScreen user={user} onBack={() => setView('profile')} />
        <TabBar active="profile" onChange={onTabChange} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 96 }}>
        <ProfileHeader user={user} onEditProfile={() => setView('edit')} onOpenSettings={() => setView('settings')} />

        <View style={{ paddingHorizontal: 16, marginTop: 8 }}>
          {/* Segmented control */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
            {[
              { key: 'posts', label: 'Posts' },
              { key: 'events', label: 'Events' },
            ].map(t => (
              <Text
                key={t.key}
                onPress={() => setSection(t.key as any)}
                style={{
                  color: section === t.key ? '#111827' : '#6B7280',
                  fontWeight: section === t.key ? '700' : '400',
                  paddingBottom: 6,
                  borderBottomWidth: section === t.key ? 2 : 0,
                  borderColor: '#111827',
                }}
              >
                {t.label}
              </Text>
            ))}
          </View>

          {section === 'events' ? (
            <View>
              <EventMiniCard
                title="Tech Conference 2024"
                date="Nov 14, 2024"
                location="San Francisco, CA"
                tagLeft="upcoming"
                tagRight="Creator"
                imageUrl="https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1400&auto=format&fit=crop"
              />
              <View style={{ height: 12 }} />
              <EventMiniCard
                title="Live Sessions Night"
                date="May 22, 2025"
                location="Los Angeles, CA"
                tagLeft="completed"
                tagRight="Creator"
                imageUrl="https://images.unsplash.com/photo-1461784180009-21121b2f2045?q=80&w=1400&auto=format&fit=crop"
              />
            </View>
          ) : section === 'posts' ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: '#6B7280' }}>No posts yet</Text>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <Text style={{ color: '#6B7280' }}>No posts yet</Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TabBar active="profile" onChange={onTabChange} />
    </SafeAreaView>
  );
}
