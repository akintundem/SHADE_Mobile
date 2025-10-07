import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Home, Compass, MapPinned, User } from 'lucide-react-native';

type Props = { active: 'home' | 'discover' | 'map' | 'profile'; onChange?: (tab: Props['active']) => void };

const Item = ({ label, active, onPress, Icon }: { label: string; active: boolean; onPress?: () => void; Icon: any }) => (
  <TouchableOpacity onPress={onPress} style={{ flex: 1, alignItems: 'center', paddingVertical: 8 }}>
    <Icon size={20} color={active ? '#111827' : '#9CA3AF'} />
    <Text style={{ marginTop: 4, color: active ? '#111827' : '#9CA3AF', fontSize: 12 }}>{label}</Text>
  </TouchableOpacity>
);

export const TabBar = ({ active, onChange }: Props) => (
  <View style={{ height: 64, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF', flexDirection: 'row' }}>
    <Item label="Home" active={active === 'home'} onPress={() => onChange?.('home')} Icon={Home} />
    <Item label="Discover" active={active === 'discover'} onPress={() => onChange?.('discover')} Icon={Compass} />
    <Item label="Map" active={active === 'map'} onPress={() => onChange?.('map')} Icon={MapPinned} />
    <Item label="Profile" active={active === 'profile'} onPress={() => onChange?.('profile')} Icon={User} />
  </View>
);

