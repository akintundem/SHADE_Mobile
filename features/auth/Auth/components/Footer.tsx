import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

export const Footer = () => {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ 
      paddingHorizontal: spacing['2xl'],
      paddingBottom: Math.max(insets.bottom, spacing.lg),
      paddingTop: spacing.md,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.borderLight,
    }}>
      <Text style={{ 
        color: colors.text.tertiary,
        fontSize: typography.size.xs,
        textAlign: 'center',
        lineHeight: 18,
      }}>
        By continuing, you agree to our{' '}
        <Text style={{ 
          color: colors.text.secondary,
          fontWeight: typography.weight.medium,
        }}>
          Terms of Service
        </Text>
        {' '}and{' '}
        <Text style={{ 
          color: colors.text.secondary,
          fontWeight: typography.weight.medium,
        }}>
          Privacy Policy
        </Text>
      </Text>
    </View>
  );
};

