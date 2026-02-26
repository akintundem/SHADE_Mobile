import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type StatusBadgeVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'active';

type StatusBadgeSize = 'sm' | 'md';

type Props = {
  label: string;
  variant?: StatusBadgeVariant;
  size?: StatusBadgeSize;
  dot?: boolean;
};

export function StatusBadge({
  label,
  variant = 'default',
  size = 'md',
  dot = false,
}: Props) {
  const { colors, isDark } = useTheme();

  const isSmall = size === 'sm';
  const containerClass = isSmall ? 'px-[6px] py-[2px]' : 'px-sm py-[4px]';
  const textClass = isSmall ? 'text-xs' : 'text-xs';
  const dotClass = isSmall ? 'h-[4px] w-[4px]' : 'h-[6px] w-[6px]';

  const baseClasses = `flex-row items-center gap-[4px] rounded-full ${containerClass}`;
  const textClasses = `font-semibold uppercase tracking-[0.3px] ${textClass}`;

  const getVariantColors = () => {
    switch (variant) {
      case 'success':
      case 'active':
        return {
          bg: isDark ? `${colors.semantic.success}25` : colors.semantic.successLight,
          text: colors.semantic.success,
          dot: colors.semantic.success,
        };
      case 'warning':
      case 'pending':
        return {
          bg: isDark ? `${colors.semantic.warning}25` : colors.semantic.warningLight,
          text: colors.semantic.warning,
          dot: colors.semantic.warning,
        };
      case 'error':
        return {
          bg: isDark ? `${colors.semantic.error}25` : colors.semantic.errorLight,
          text: colors.semantic.error,
          dot: colors.semantic.error,
        };
      case 'info':
        return {
          bg: isDark ? colors.surfaceElevated : colors.borderLight,
          text: colors.text.primary,
          dot: colors.text.primary,
        };
      default:
        return {
          bg: isDark ? colors.surfaceElevated : colors.surface,
          text: colors.text.secondary,
          dot: colors.text.tertiary,
        };
    }
  };

  const variantColors = getVariantColors();

  return (
    <View className={baseClasses} style={{ backgroundColor: variantColors.bg }}>
      {dot && (
        <View
          className={`rounded-full ${dotClass}`}
          style={{ backgroundColor: variantColors.dot }}
        />
      )}
      <Text className={textClasses} style={{ color: variantColors.text }}>
        {label}
      </Text>
    </View>
  );
}
