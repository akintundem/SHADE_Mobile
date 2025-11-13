import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

type Props = {
  title: string;
  children: React.ReactNode;
};

export function Section({ title, children }: Props) {
  const { colors, spacing, typography } = useTheme();
  return (
    <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
      <Text
        style={{
          color: colors.text.primary,
          fontWeight: typography.weight.semibold,
          marginBottom: spacing.md,
          fontSize: typography.size.base,
        }}
      >
        {title}
      </Text>
      {children}
    </View>
  );
}

