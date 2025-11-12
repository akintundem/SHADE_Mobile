import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

export const Footer = () => {
  const { colors, typography, spacing } = useTheme();
  
  return (
    <View style={{ marginTop: spacing['4xl'], alignItems: 'center' }}>
      <View style={{ 
        height: 1, 
        backgroundColor: colors.divider, 
        alignSelf: 'stretch',
        marginBottom: spacing.lg,
      }} />
      <Text style={{ 
        color: colors.text.tertiary,
        fontSize: typography.size.xs,
        textAlign: 'center',
        lineHeight: 18,
      }}>
        By continuing, you agree to our{' '}
        <Text style={{ 
          color: colors.text.primary,
          fontWeight: typography.weight.semibold,
        }}>
          Terms of Service
        </Text>
        {' '}and{' '}
        <Text style={{ 
          color: colors.text.primary,
          fontWeight: typography.weight.semibold,
        }}>
          Privacy Policy
        </Text>
      </Text>
    </View>
  );
};

