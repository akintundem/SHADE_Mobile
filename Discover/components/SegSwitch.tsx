import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { CalendarRange, LayoutGrid } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = { value: 'events' | 'collections'; onChange: (v: 'events' | 'collections') => void };

export const SegSwitch = ({ value, onChange }: Props) => {
  const { colors } = useTheme();
  return (
    <View style={{ marginHorizontal: 16, marginTop: 8, backgroundColor: colors.textPrimary, borderRadius: 12, padding: 4, flexDirection: 'row' }}>
      <Tab label="Events" Icon={CalendarRange} active={value === 'events'} onPress={() => onChange('events')} />
      <Tab label="Collections" Icon={LayoutGrid} active={value === 'collections'} onPress={() => onChange('collections')} />
    </View>
  );
};

const Tab = ({ label, Icon, active, onPress }: any) => {
  const { colors, isDark } = useTheme();
  return (
    <TouchableOpacity onPress={onPress} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, borderRadius: 10, backgroundColor: active ? (isDark ? '#0B0F14' : '#FFFFFF') : 'transparent' }}>
      <Icon size={14} color={isDark ? '#E5E7EB' : '#E5E7EB'} />
      <Text style={{ color: '#E5E7EB', fontWeight: active ? '700' : '500' }}>{label}</Text>
    </TouchableOpacity>
  );
};

