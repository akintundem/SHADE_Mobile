import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  title?: string;
};

export const HomeHeader = ({ title = 'Shade' }: Props) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View
        style={{
          paddingHorizontal: spacing.xl,
          paddingTop: spacing['3xl'],
          paddingBottom: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size['3xl'],
              letterSpacing: -1,
            }}
          >
            {title}
          </Text>
        </View>
      </View>
    </View>
  );
};
