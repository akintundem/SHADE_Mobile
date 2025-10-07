import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut, User as UserIcon } from 'lucide-react-native';
import { User } from '../types';
import { authService } from '../services/authService';
import HomeScreen from '../Home/HomeScreen';

type Props = {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
};

export default function SocialApp({ user, onLogout }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <HomeScreen user={user} />

      <SafeAreaView edges={['bottom']} style={{ position: 'absolute', right: 16, bottom: 90 }}>
        <TouchableOpacity
          onPress={async () => {
            if (loading) return;
            setLoading(true);
            await authService.logout();
            setLoading(false);
            onLogout();
          }}
          accessibilityLabel="Logout"
          style={{
            height: 44,
            borderRadius: 22,
            backgroundColor: '#ef4444',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            paddingHorizontal: 14,
            gap: 6,
          }}
        >
          <LogOut color="#fff" size={18} />
          <Text style={{ color: '#fff', fontWeight: '600' }}>{loading ? 'Logging out...' : 'Logout'}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}
