import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Settings, Pencil } from 'lucide-react-native';
import { User } from '../../types';

type Props = {
  user: User;
  onOpenMenu?: () => void; // deprecated
  onCreate?: () => void; // deprecated
  onEditProfile?: () => void;
  onOpenSettings?: () => void;
};

export const ProfileHeader = ({ user, onOpenMenu, onCreate, onEditProfile, onOpenSettings }: Props) => {
  return (
    <View style={{ backgroundColor: '#FFFFFF' }}>
      <View style={{ height: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 12 }}>
        <TouchableOpacity onPress={onEditProfile} hitSlop={10} accessibilityLabel="Edit profile">
          <Pencil size={20} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onOpenSettings} hitSlop={10} accessibilityLabel="Open settings">
          <Settings size={20} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'center', paddingBottom: 12 }}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop' }}
          style={{ height: 92, width: 92, borderRadius: 46, marginBottom: 12 }}
        />
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827' }}>{user.name || 'Member'}</Text>
        <Text style={{ marginTop: 4, color: '#6B7280' }}>@{(user.name || user.email).toLowerCase().split('@')[0].replace(/\s+/g, '-')}</Text>

        <View style={{ flexDirection: 'row', gap: 24, marginTop: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#111827', fontWeight: '700' }}>0</Text>
            <Text style={{ color: '#6B7280' }}>Followers</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#111827', fontWeight: '700' }}>0</Text>
            <Text style={{ color: '#6B7280' }}>Following</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: '#111827', fontWeight: '700' }}>0</Text>
            <Text style={{ color: '#6B7280' }}>Interests</Text>
          </View>
        </View>

        {/* Top actions moved to header; keep area clean below */}
      </View>
    </View>
  );
};
