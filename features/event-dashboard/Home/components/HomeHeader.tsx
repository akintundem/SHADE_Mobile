import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { User } from '../../../../core/auth/types/auth';

type Props = {
  user: User;
  onOpenMenu?: () => void;
  onOpenCamera?: () => void;
  onOpenGallery?: () => void;
};

export const HomeHeader = ({
  user: _user,
  onOpenMenu: _onOpenMenu,
  onOpenCamera: _onOpenCamera,
  onOpenGallery: _onOpenGallery,
}: Props) => {
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
