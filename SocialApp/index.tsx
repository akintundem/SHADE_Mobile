import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User as UserIcon } from 'lucide-react-native';
import { User } from '../types';

type Props = {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
};

export default function SocialApp({ user, onLogout }: Props) {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <UserIcon size={20} color="#111827" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
            Welcome, {user.name || user.email}
          </Text>
        </View>

        <Text style={{ color: '#6B7280' }}>
          This is a placeholder for the main app screen.
        </Text>

        <TouchableOpacity
          onPress={onLogout}
          style={{
            height: 48,
            borderRadius: 12,
            backgroundColor: '#ef4444',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
            marginTop: 8,
          }}
        >
          <LogOut color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '600' }}>Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

