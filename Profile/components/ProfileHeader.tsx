import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Menu, Plus, Settings } from 'lucide-react-native';
import { User } from '../../types';

type Props = {
  user: User;
  onOpenMenu?: () => void;
  onCreate?: () => void;
  onEditProfile?: () => void;
  onOpenSettings?: () => void;
};

export const ProfileHeader = ({ user, onOpenMenu, onCreate, onEditProfile, onOpenSettings }: Props) => {
  return (
    <View style={{ backgroundColor: '#FFFFFF' }}>
      <View style={{ height: 48, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity onPress={onOpenMenu} hitSlop={10}>
          <Menu size={22} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCreate} hitSlop={10}>
          <Plus size={22} color="#111827" />
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

        <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
          <TouchableOpacity onPress={onEditProfile} style={{ height: 36, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#111827', fontWeight: '600' }}>Edit profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onOpenSettings} style={{ height: 36, width: 36, borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }}>
            <Settings size={18} color="#111827" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

