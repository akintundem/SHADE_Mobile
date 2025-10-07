import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Menu, Plus } from 'lucide-react-native';
import { User } from '../../types';

type Props = {
  user: User;
  onOpenMenu?: () => void;
  onCreatePost?: () => void;
};

export const HomeHeader = ({ user, onOpenMenu, onCreatePost }: Props) => {
  const name = user.name || user.email;
  return (
    <View style={{ backgroundColor: '#FFFFFF' }}>
      <View
        style={{
          height: 48,
          paddingHorizontal: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <TouchableOpacity onPress={onOpenMenu} hitSlop={10}>
          <Menu size={22} color="#111827" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onCreatePost} hitSlop={10}>
          <Plus size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: '700', color: '#111827', textAlign: 'center' }}>
          Welcome back, {name}
        </Text>
        <Text style={{ marginTop: 6, color: '#6B7280', textAlign: 'center' }}>
          Discover amazing events happening around you
        </Text>
      </View>
    </View>
  );
};

