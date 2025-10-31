import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

export interface BaseButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  testID?: string;
}

export const BaseButton: React.FC<BaseButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  testID,
}) => {
  const { colors, spacing, borderRadius, typography, brand } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: 'transparent',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        minHeight: 32,
      },
      medium: {
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: brand.primary,
        borderColor: brand.primary,
      },
      secondary: {
        backgroundColor: colors.surface,
        borderColor: colors.border,
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: brand.primary,
      },
      ghost: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
      },
      danger: {
        backgroundColor: colors.semantic.error,
        borderColor: colors.semantic.error,
      },
    };

    // Disabled styles
    const disabledStyle: ViewStyle = disabled || loading ? {
      opacity: 0.5,
    } : {};

    // Full width style
    const fullWidthStyle: ViewStyle = fullWidth ? {
      width: '100%',
    } : {};

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...disabledStyle,
      ...fullWidthStyle,
      ...style,
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: typography.weight.semibold,
      textAlign: 'center',
    };

    // Size styles
    const sizeStyles: Record<string, TextStyle> = {
      small: {
        fontSize: typography.size.sm,
      },
      medium: {
        fontSize: typography.size.base,
      },
      large: {
        fontSize: typography.size.lg,
      },
    };

    // Variant styles
    const variantStyles: Record<string, TextStyle> = {
      primary: {
        color: '#FFFFFF',
      },
      secondary: {
        color: colors.text.primary,
      },
      outline: {
        color: brand.primary,
      },
      ghost: {
        color: brand.primary,
      },
      danger: {
        color: '#FFFFFF',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <ActivityIndicator 
            size="small" 
            color={variant === 'primary' || variant === 'danger' ? '#FFFFFF' : brand.primary} 
          />
          <Text style={[getTextStyle(), { marginLeft: spacing.sm }]}>
            Loading...
          </Text>
        </>
      );
    }

    const iconElement = icon ? (
      <React.Fragment key="icon">{icon}</React.Fragment>
    ) : null;

    const textElement = (
      <Text key="text" style={getTextStyle()}>
        {title}
      </Text>
    );

    return iconPosition === 'left' 
      ? [iconElement, textElement].filter(Boolean)
      : [textElement, iconElement].filter(Boolean);
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      testID={testID}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};
