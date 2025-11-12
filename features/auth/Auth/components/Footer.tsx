import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

export const Footer = () => {
  const { colors, typography, spacing } = useTheme();
  
  return (
    <View style={{ marginTop: spacing['3xl'], alignItems: 'center' }}>
      <Text style={{ 
        color: colors.text.tertiary,
        fontSize: typography.size.xs,
        textAlign: 'center',
        lineHeight: 16,
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

