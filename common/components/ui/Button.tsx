import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  children: React.ReactNode;
  onPress?: () => void | Promise<void>;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: any;
};

export default function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  style,
}: Props) {
  const { colors, brand, typography, spacing, borderRadius, shadows } = useTheme();

  const getButtonStyle = () => {
    const baseStyle: any = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.xl,
      paddingHorizontal: size === 'sm' ? spacing.lg : size === 'md' ? spacing.xl : spacing['2xl'],
      height: size === 'sm' ? 44 : size === 'md' ? 48 : 52,
      gap: spacing.sm,
    };

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.text.disabled : brand.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.text.disabled : brand.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.border : brand.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: disabled ? colors.text.disabled : colors.semantic.error,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = () => {
    const baseStyle: any = {
      fontSize: size === 'sm' ? typography.size.xs : size === 'md' ? typography.size.sm : typography.size.base,
      fontWeight: typography.weight.medium,
      letterSpacing: 0.2,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          color: colors.text.inverse,
        };
      case 'secondary':
      case 'danger':
        return {
          ...baseStyle,
          color: '#FFFFFF',
        };
      case 'outline':
        return {
          ...baseStyle,
          color: disabled ? colors.text.disabled : brand.primary,
        };
      case 'ghost':
        return {
          ...baseStyle,
          color: disabled ? colors.text.disabled : colors.text.primary,
        };
      default:
        return baseStyle;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[getButtonStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'primary'
              ? colors.text.inverse
              : variant === 'outline' || variant === 'ghost'
              ? brand.primary
              : '#FFFFFF'
          }
        />
      ) : (
        <>
          {leftIcon}
          <Text style={getTextStyle()}>{children}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}

