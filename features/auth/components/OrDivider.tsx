import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

export const OrDivider = () => {
  const { colors, typography, spacing } = useTheme();
  
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing.xl,
    }}>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
      <Text style={{
        marginHorizontal: spacing.md,
        color: colors.text.tertiary,
        fontSize: typography.size.sm,
        fontWeight: typography.weight.medium,
      }}>
        or
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.divider }} />
    </View>
  );
};

