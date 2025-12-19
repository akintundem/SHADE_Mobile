import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  icon?: React.ReactNode;
  label: string;
};

export function FieldLabel({ icon, label }: Props) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
      }}
    >
      {icon}
      <Text style={{ color: colors.text.primary }}>{label}</Text>
    </View>
  );
}

