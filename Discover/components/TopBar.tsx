import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Menu, Plus } from 'lucide-react-native';

export const TopBar = ({ onPlus, theme = 'dark' as 'light' | 'dark' }) => {
  const dark = theme === 'dark';
  return (
    <View
      style={{
        height: 48,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: dark ? '#0B0B0B' : '#FFFFFF',
        borderBottomWidth: dark ? 0 : 1,
        borderColor: '#F3F4F6',
      }}
    >
      <TouchableOpacity hitSlop={10}>
        <Menu size={22} color={dark ? '#E5E7EB' : '#111827'} />
      </TouchableOpacity>
      <TouchableOpacity hitSlop={10} onPress={onPlus}>
        <Plus size={22} color={dark ? '#E5E7EB' : '#111827'} />
      </TouchableOpacity>
    </View>
  );
};
