import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type ToggleButtonVariant = 'default' | 'outline';
type ToggleButtonSize = 'sm' | 'md' | 'lg';

type Props = {
  isActive: boolean;
  activeLabel: string;
  inactiveLabel: string;
  isLoading?: boolean;
  onPress: () => void;
  variant?: ToggleButtonVariant;
  size?: ToggleButtonSize;
  disabled?: boolean;
};

export function ToggleButton({
  isActive,
  activeLabel,
  inactiveLabel,
  isLoading = false,
  onPress,
  variant = 'default',
  size = 'md',
  disabled = false,
}: Props) {
  const { colors } = useTheme();
  const sizeClasses = {
    sm: { container: 'px-[10px] py-[5px]', text: 'text-xs' },
    md: { container: 'px-[14px] py-[8px]', text: 'text-sm' },
    lg: { container: 'px-[18px] py-[10px]', text: 'text-sm' },
  }[size];

  const isDisabled = disabled || isLoading;

  // Build dynamic classes based on state
  const getContainerClasses = () => {
    const baseClasses = `border rounded-full flex-row items-center justify-center ${sizeClasses.container}`;
    
    if (isDisabled && !isLoading) {
      return `${baseClasses} bg-light-border-light dark:bg-dark-border border-light-border-light dark:border-dark-border`;
    }
    
    if (variant === 'outline') {
      if (isActive) {
        return `${baseClasses} bg-transparent border-brand-primary dark:border-txt-inverse`;
      }
      return `${baseClasses} bg-transparent border-light-border dark:border-dark-border`;
    }
    
    if (isActive) {
      return `${baseClasses} bg-brand-primary dark:bg-txt-inverse border-brand-primary dark:border-txt-inverse`;
    }
    
    return `${baseClasses} bg-transparent border-light-border dark:border-dark-border`;
  };

  const getTextClasses = () => {
    const baseClasses = `font-semibold tracking-[0.2px] ${sizeClasses.text}`;
    
    if (isDisabled && !isLoading) {
      return `${baseClasses} text-txt-disabled dark:text-txt-dark-tertiary`;
    }
    
    if (variant === 'outline') {
      if (isActive) {
        return `${baseClasses} text-brand-primary dark:text-txt-inverse`;
      }
      return `${baseClasses} text-txt-primary dark:text-txt-dark-primary`;
    }
    
    if (isActive) {
      return `${baseClasses} text-txt-inverse dark:text-txt-primary`;
    }
    
    return `${baseClasses} text-txt-primary dark:text-txt-dark-primary`;
  };

  const getActivityIndicatorColor = () => {
    if (isDisabled && !isLoading) {
      return colors.text.disabled;
    }
    if (isActive) {
      return colors.text.inverse;
    }
    return colors.text.primary;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      className={getContainerClasses()}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={getActivityIndicatorColor()} />
      ) : (
        <Text className={getTextClasses()}>
          {isActive ? activeLabel : inactiveLabel}
        </Text>
      )}
    </TouchableOpacity>
  );
}
