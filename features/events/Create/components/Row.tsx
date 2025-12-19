import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function Row({ label, icon, children }: Props) {
  const { colors, spacing } = useTheme();
  return (
    <View style={{ marginBottom: spacing.sm }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs,
          }}
        >
          {icon}
          <Text style={{ color: colors.text.primary }}>{label}</Text>
        </View>
        {children}
      </View>
    </View>
  );
}

