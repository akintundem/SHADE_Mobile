import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface BaseCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  testID?: string;
}

export const BaseCard: React.FC<BaseCardProps> = ({
  children,
  onPress,
  variant = 'default',
  padding = 'medium',
  margin = 'none',
  borderRadius = 'medium',
  style,
  testID,
}) => {
  const { colors, spacing, borderRadius: borderRadiusValues, shadows } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.surface,
    };

    // Padding styles
    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      small: { padding: spacing.sm },
      medium: { padding: spacing.md },
      large: { padding: spacing.lg },
    };

    // Margin styles
    const marginStyles: Record<string, ViewStyle> = {
      none: {},
      small: { margin: spacing.sm },
      medium: { margin: spacing.md },
      large: { margin: spacing.lg },
    };

    // Border radius styles
    const borderRadiusStyles: Record<string, ViewStyle> = {
      none: {},
      small: { borderRadius: borderRadiusValues.sm },
      medium: { borderRadius: borderRadiusValues.md },
      large: { borderRadius: borderRadiusValues.lg },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: colors.surface,
        borderWidth: 0,
      },
      elevated: {
        backgroundColor: colors.surface,
        ...shadows.md,
        borderWidth: 0,
      },
      outlined: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      },
      filled: {
        backgroundColor: colors.background,
        borderWidth: 0,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...borderRadiusStyles[borderRadius],
      ...variantStyles[variant],
      ...style,
    };
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={getCardStyle()}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={getCardStyle()} testID={testID}>
      {children}
    </View>
  );
};
