import React from 'react';
import { View, ViewStyle, TouchableOpacity } from 'react-native';

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
  // Padding classes
  const paddingClasses = {
    none: '',
    small: 'p-sm',
    medium: 'p-md',
    large: 'p-lg',
  };

  // Margin classes
  const marginClasses = {
    none: '',
    small: 'm-sm',
    medium: 'm-md',
    large: 'm-lg',
  };

  // Border radius classes
  const borderRadiusClasses = {
    none: '',
    small: 'rounded-sm',
    medium: 'rounded-md',
    large: 'rounded-lg',
  };

  // Variant classes
  const getVariantClasses = () => {
    switch (variant) {
      case 'default':
        return 'bg-light-surface dark:bg-dark-surface';
      case 'elevated':
        return 'bg-light-surface dark:bg-dark-surface';
      case 'outlined':
        return 'bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border';
      case 'filled':
        return 'bg-light-background dark:bg-dark-background';
      default:
        return 'bg-light-surface dark:bg-dark-surface';
    }
  };

  const getCardClasses = () => {
    const baseClasses = getVariantClasses();
    const paddingClass = paddingClasses[padding];
    const marginClass = marginClasses[margin];
    const borderRadiusClass = borderRadiusClasses[borderRadius];
    
    return `${baseClasses} ${paddingClass} ${marginClass} ${borderRadiusClass}`.trim();
  };

  const cardClasses = getCardClasses();

  if (onPress) {
    return (
      <TouchableOpacity
        className={cardClasses}
        onPress={onPress}
        activeOpacity={0.7}
        testID={testID}
        style={style}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View className={cardClasses} testID={testID} style={style}>
      {children}
    </View>
  );
};
