import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/ThemeProvider';
import { Home, Compass, MapPinned, User } from 'lucide-react-native';

type Props = { active: 'home' | 'discover' | 'map' | 'profile'; onChange?: (tab: Props['active']) => void };

const Item = ({ label, active, onPress, Icon }: { label: string; active: boolean; onPress?: () => void; Icon: any }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
      <Icon size={20} color={active ? colors.tint : colors.textSecondary} />
      <Text style={{ marginTop: 4, color: active ? colors.tint : colors.textSecondary, fontSize: 12 }}>{label}</Text>
    </TouchableOpacity>
  );
};

export const TabBar = ({ active, onChange }: Props) => {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  return (
    <View style={{ paddingBottom: Math.max(10, insets.bottom), height: 64 + Math.max(10, insets.bottom), borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.surface, flexDirection: 'row' }}>
      <Item label="Home" active={active === 'home'} onPress={() => onChange?.('home')} Icon={Home} />
      <Item label="Discover" active={active === 'discover'} onPress={() => onChange?.('discover')} Icon={Compass} />
      <Item label="Map" active={active === 'map'} onPress={() => onChange?.('map')} Icon={MapPinned} />
      <Item label="Profile" active={active === 'profile'} onPress={() => onChange?.('profile')} Icon={User} />
    </View>
  );
};

