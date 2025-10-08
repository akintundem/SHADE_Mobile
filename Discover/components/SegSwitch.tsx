import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarRange, LayoutGrid } from 'lucide-react-native';

type Props = { value: 'events' | 'collections'; onChange: (v: 'events' | 'collections') => void };

export const SegSwitch = ({ value, onChange }: Props) => (
  <View style={{ marginHorizontal: 16, marginTop: 8, backgroundColor: '#111827', borderRadius: 12, padding: 4, flexDirection: 'row' }}>
    <Tab label="Events" Icon={CalendarRange} active={value === 'events'} onPress={() => onChange('events')} />
    <Tab label="Collections" Icon={LayoutGrid} active={value === 'collections'} onPress={() => onChange('collections')} />
  </View>
);

const Tab = ({ label, Icon, active, onPress }: any) => (
  <TouchableOpacity onPress={onPress} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: active ? '#0B0B0B' : 'transparent' }}>
    <Icon size={14} color="#E5E7EB" />
    <Text style={{ color: '#E5E7EB', fontWeight: active ? '700' : '500' }}>{label}</Text>
  </TouchableOpacity>
);

