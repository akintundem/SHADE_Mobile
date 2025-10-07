import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User as UserIcon } from 'lucide-react-native';
import { User } from '../types';
import { authService } from '../services/authService';

type Props = {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
};

export default function SocialApp({ user, onLogout }: Props) {
  const [loading, setLoading] = useState(false);
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 24, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <UserIcon size={20} color="#111827" />
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#111827' }}>
            Welcome, {user.name || user.email}
          </Text>
        </View>

        <Text style={{ color: '#6B7280' }}>You are signed in.</Text>

        <TouchableOpacity
          onPress={async () => {
            if (loading) return;
            setLoading(true);
            await authService.logout();
            setLoading(false);
            onLogout();
          }}
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
          <Text style={{ color: '#fff', fontWeight: '600' }}>{loading ? 'Logging out...' : 'Log out'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
