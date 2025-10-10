import React from 'react';
import { View, Text } from 'react-native';
import { ImageOff } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';

export const EmptyFeed = () => {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 28, borderWidth: 1, borderColor: colors.border, borderRadius: 12, backgroundColor: colors.surface }}>
      <ImageOff size={20} color={colors.textSecondary} />
      <Text style={{ marginTop: 8, color: colors.textSecondary }}>No posts yet</Text>
    </View>
  );
};

