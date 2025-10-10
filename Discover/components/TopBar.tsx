import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Menu, Plus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = { onPlus?: () => void; theme?: 'light' | 'dark' };

export const TopBar = ({ onPlus }: Props) => {
  const { colors } = useTheme();
  return (
    <View
      style={{
        height: 48,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      <TouchableOpacity hitSlop={10}>
        <Menu size={22} color={colors.textPrimary} />
      </TouchableOpacity>
      <TouchableOpacity hitSlop={10} onPress={onPlus}>
        <Plus size={22} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};
