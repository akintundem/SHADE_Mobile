import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { User } from '../../../../shared/types';
import { useTheme } from '../../../../shared/theme/ThemeProvider';
import { MessageCircle } from 'lucide-react-native';

type Props = {
  user: User;
  onOpenMenu?: () => void;
  onOpenChat?: () => void;
};

export const HomeHeader = ({ onOpenChat }: Props) => {
  const { colors, typography, spacing, brand, borderRadius, shadows } = useTheme();

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
        <TouchableOpacity
          onPress={onOpenChat}
          activeOpacity={0.8}
          style={{
            width: 44,
            height: 44,
            borderRadius: borderRadius.full,
            backgroundColor: brand.primary,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadows.md,
          }}
        >
          <MessageCircle size={22} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    </View>
  );
};
