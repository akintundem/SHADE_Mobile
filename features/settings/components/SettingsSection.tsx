import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  title: string;
};

export function SettingsSection({ title }: Props) {
  const { colors, spacing, typography } = useTheme();

  return (
    <View
      style={{ 
        paddingHorizontal: spacing.xl, 
        paddingTop: spacing.xl, 
        paddingBottom: spacing.sm,
        backgroundColor: colors.background,
      }}
    >
      <Text
        style={{
          color: colors.text.tertiary,
          fontWeight: typography.weight.semibold,
          fontSize: typography.size.xs,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

