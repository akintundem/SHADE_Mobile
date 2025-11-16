import React from 'react';
import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../shared/theme/ThemeProvider';

type Props = {
  isSignUp?: boolean;
};

export const Footer = ({ isSignUp = false }: Props) => {
  const { colors, typography, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  
  return (
    <View style={{ 
      marginTop: isSignUp ? spacing.lg : spacing['3xl'],
      marginBottom: Math.max(insets.bottom, isSignUp ? spacing.md : spacing.lg),
      alignItems: 'center',
    }}>
      <Text style={{ 
        color: colors.text.tertiary,
        fontSize: typography.size.xs,
        textAlign: 'center',
        lineHeight: 18,
        paddingHorizontal: spacing.lg,
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

