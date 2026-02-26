import React from 'react';
import { View, Text, TouchableOpacity, TextStyle } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type IconType = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

type HeaderAction = {
  icon: IconType;
  onPress: () => void;
  accessibilityLabel?: string;
  disabled?: boolean;
  size?: number;
  iconSize?: number;
  strokeWidth?: number;
  variant?: 'plain' | 'filled';
  backgroundColor?: string;
  iconColor?: string;
};

type Props = {
  title: string;
  leftAction?: HeaderAction;
  rightAction?: HeaderAction;
  titleSize?: number;
  titleWeight?: TextStyle['fontWeight'];
  titleAlign?: TextStyle['textAlign'];
  paddingHorizontal?: number;
  paddingTop?: number;
  paddingBottom?: number;
  showDivider?: boolean;
  reserveActionSpace?: boolean;
};

export function ScreenHeader({
  title,
  leftAction,
  rightAction,
  titleSize,
  titleWeight,
  titleAlign = 'center',
  paddingHorizontal,
  paddingTop,
  paddingBottom,
  showDivider = true,
  reserveActionSpace = true,
}: Props) {
  const { colors } = useTheme();

  const leftSize = leftAction?.size ?? 32;
  const rightSize = rightAction?.size ?? 32;
  const placeholderWidth = reserveActionSpace ? Math.max(leftSize, rightSize) : 0;

  const renderAction = (action?: HeaderAction, placeholderWidthOverride?: number) => {
    if (!action) {
      return placeholderWidthOverride ? <View style={{ width: placeholderWidthOverride }} /> : null;
    }

    const size = action.size ?? 32;
    const variant = action.variant ?? 'plain';
    
    const getBackgroundClasses = () => {
      if (variant === 'filled') {
        if (action.disabled) {
          return 'bg-light-border-light dark:bg-dark-border-light';
        }
        return action.backgroundColor 
          ? '' 
          : 'bg-txt-primary dark:bg-txt-dark-primary';
      }
      return 'bg-transparent';
    };

    const getIconColor = () => {
      if (action.iconColor) {
        return action.iconColor;
      }
      if (variant === 'filled') {
        if (action.disabled) {
          return colors.text.disabled;
        }
        return colors.text.inverse;
      }
      return colors.text.primary;
    };

    const Icon = action.icon;

    return (
      <TouchableOpacity
        onPress={action.onPress}
        disabled={action.disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={action.accessibilityLabel}
        className={`items-center justify-center rounded-full ${getBackgroundClasses()}`}
        style={{
          width: size,
          height: size,
          backgroundColor: variant === 'filled' && action.backgroundColor ? action.backgroundColor : undefined,
        }}
      >
        <Icon
          size={action.iconSize ?? Math.round(size * 0.5)}
          color={getIconColor()}
          strokeWidth={action.strokeWidth ?? 2.5}
        />
      </TouchableOpacity>
    );
  };

  const getPaddingClasses = () => {
    const px = paddingHorizontal !== undefined ? `px-[${paddingHorizontal}px]` : 'px-xl';
    const pt = paddingTop !== undefined ? `pt-[${paddingTop}px]` : 'pt-md';
    const pb = paddingBottom !== undefined ? `pb-[${paddingBottom}px]` : 'pb-md';
    return `${px} ${pt} ${pb}`;
  };

  const getTitleClasses = () => {
    const sizeClass = titleSize !== undefined ? `text-[${titleSize}px]` : 'text-sm';
    const weightClass = titleWeight ?? 'font-semibold';
    const alignClass = titleAlign === 'left' ? 'text-left' : titleAlign === 'right' ? 'text-right' : 'text-center';
    return `${sizeClass} ${weightClass} ${alignClass} text-txt-primary dark:text-txt-dark-primary`;
  };

  return (
    <View
      className={`flex-row items-center justify-between ${getPaddingClasses()} bg-light-background dark:bg-dark-background`}
    >
      {renderAction(leftAction, placeholderWidth)}
      <Text className={getTitleClasses()} numberOfLines={1}>
        {title}
      </Text>
      {renderAction(rightAction, placeholderWidth)}
    </View>
  );
}
