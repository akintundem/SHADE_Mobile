import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
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
  const { colors, disabledButtonBackground } = useTheme();
  const isDisabled = disabled || loading;
  // Size classes
  const sizeClasses = {
    container: {
      sm: 'px-lg h-[44px]',
      md: 'px-xl h-[48px]',
      lg: 'px-2xl h-[52px]',
    },
    text: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  };

  // Button container classes (disabled bg overridden via style for primary/secondary/danger)
  const getButtonClasses = () => {
    const baseClasses = 'flex-row items-center justify-center rounded-2xl gap-sm';
    const sizeClass = sizeClasses.container[size];
    const widthClass = fullWidth ? 'w-full' : '';
    
    let variantClasses = '';
    switch (variant) {
      case 'primary':
      case 'secondary':
        variantClasses = isDisabled ? '' : 'bg-black dark:bg-white';
        break;
      case 'outline':
        variantClasses = `bg-transparent border ${isDisabled ? 'border-light-border dark:border-dark-border' : 'border-black dark:border-white'}`;
        break;
      case 'ghost':
        variantClasses = 'bg-transparent';
        break;
      case 'danger':
        variantClasses = isDisabled ? '' : 'bg-semantic-error';
        break;
    }
    
    return `${baseClasses} ${sizeClass} ${widthClass} ${variantClasses}`;
  };

  const getBackgroundStyle = () => {
    if (!isDisabled) return undefined;
    if (variant === 'primary' || variant === 'secondary' || variant === 'danger') {
      return { backgroundColor: disabledButtonBackground };
    }
    return undefined;
  };

  // Text classes
  const getTextClasses = () => {
    const baseClasses = 'font-medium tracking-[0.2px]';
    const sizeClass = sizeClasses.text[size];
    
    let colorClass = '';
    switch (variant) {
      case 'primary':
      case 'secondary':
        colorClass = isDisabled ? 'text-txt-tertiary dark:text-txt-dark-tertiary' : 'text-white dark:text-black';
        break;
      case 'danger':
        colorClass = isDisabled ? 'text-txt-tertiary dark:text-txt-dark-tertiary' : 'text-txt-inverse';
        break;
      case 'outline':
        colorClass = isDisabled
          ? 'text-txt-disabled dark:text-txt-dark-tertiary'
          : 'text-black dark:text-white';
        break;
      case 'ghost':
        colorClass = isDisabled 
          ? 'text-txt-disabled dark:text-txt-dark-tertiary' 
          : 'text-txt-primary dark:text-txt-dark-primary';
        break;
    }
    
    return `${baseClasses} ${sizeClass} ${colorClass}`;
  };

  const getActivityIndicatorColor = () => {
    if (variant === 'primary') {
      return colors.text.inverse;
    }
    if (variant === 'outline' || variant === 'ghost') {
      return colors.text.primary;
    }
    return colors.text.inverse;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={getButtonClasses()}
      style={[getBackgroundStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={getActivityIndicatorColor()}
        />
      ) : (
        <>
          {leftIcon}
          <Text className={getTextClasses()}>{children}</Text>
          {rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
}
