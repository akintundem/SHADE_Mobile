import React, { forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface BaseInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  helperStyle?: TextStyle;
  variant?: 'default' | 'filled' | 'outlined';
  size?: 'small' | 'medium' | 'large';
}

export const BaseInput = forwardRef<TextInput, BaseInputProps>(({
  label,
  error,
  helperText,
  required = false,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  helperStyle,
  variant = 'outlined',
  size = 'medium',
  ...textInputProps
}, ref) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  const hasError = !!error;
  const hasLeftIcon = !!leftIcon;
  const hasRightIcon = !!rightIcon;

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: spacing.md,
    };

    return {
      ...baseStyle,
      ...containerStyle,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        borderColor: colors.border,
        backgroundColor: 'transparent',
      },
      filled: {
        borderColor: 'transparent',
        backgroundColor: colors.surface,
      },
      outlined: {
        borderColor: hasError ? colors.error : colors.border,
        backgroundColor: colors.surface,
      },
    };

    // Focus styles
    const focusStyle: ViewStyle = {
      borderColor: hasError ? colors.error : colors.primary,
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...focusStyle,
    };
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      flex: 1,
      color: colors.text.primary,
      fontSize: typography.size.md,
    };

    // Size styles
    const sizeStyles: Record<string, TextStyle> = {
      small: {
        fontSize: typography.size.sm,
      },
      medium: {
        fontSize: typography.size.md,
      },
      large: {
        fontSize: typography.size.lg,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...inputStyle,
    };
  };

  const getLabelStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: colors.text.primary,
      fontSize: typography.size.sm,
      fontWeight: typography.weight.medium,
      marginBottom: spacing.xs,
    };

    return {
      ...baseStyle,
      ...labelStyle,
    };
  };

  const getErrorStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: colors.error,
      fontSize: typography.size.xs,
      marginTop: spacing.xs,
    };

    return {
      ...baseStyle,
      ...errorStyle,
    };
  };

  const getHelperStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      color: colors.text.secondary,
      fontSize: typography.size.xs,
      marginTop: spacing.xs,
    };

    return {
      ...baseStyle,
      ...helperStyle,
    };
  };

  return (
    <View style={getContainerStyle()}>
      {label && (
        <Text style={getLabelStyle()}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      
      <View style={getInputContainerStyle()}>
        {hasLeftIcon && (
          <View style={{ marginRight: spacing.sm }}>
            {leftIcon}
          </View>
        )}
        
        <TextInput
          ref={ref}
          style={getInputStyle()}
          placeholderTextColor={colors.text.tertiary}
          {...textInputProps}
        />
        
        {hasRightIcon && (
          <View style={{ marginLeft: spacing.sm }}>
            {rightIcon}
          </View>
        )}
      </View>
      
      {error && (
        <Text style={getErrorStyle()}>
          {error}
        </Text>
      )}
      
      {helperText && !error && (
        <Text style={getHelperStyle()}>
          {helperText}
        </Text>
      )}
    </View>
  );
});
