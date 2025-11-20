import React from 'react';
import { View, Text } from 'react-native';
import { User } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

type Props = {
  user: User;
  onOpenMenu?: () => void;
};

export const HomeHeader = ({ }: Props) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <View
        style={{
          height: 46,
          paddingHorizontal: spacing.lg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: spacing.xl,
        }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.bold,
              fontSize: typography.size['2xl'],
              letterSpacing: -0.5,
              textAlign: 'left',
            }}
          >
            Shade
          </Text>
        </View>
      </View>
    </View>
  );
};
