import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  containerStyle?: StyleProp<ViewStyle>;
  labelLetterSpacing?: number;
};

export function SegmentedToggle<T extends string>({
  value,
  options,
  onChange,
  containerStyle,
  labelLetterSpacing = 0.2,
}: Props<T>) {
  const { colors, spacing, typography, borderRadius, isDark } = useTheme();

  return (
    <View
      style={[
        {
          paddingHorizontal: spacing.xl,
          paddingTop: spacing.lg,
          paddingBottom: spacing.md,
        },
        containerStyle,
      ]}
    >
      <View
        className="flex-row bg-light-surface-subtle dark:bg-dark-surface-muted border border-[0.5px] border-light-border-muted dark:border-dark-border-muted p-[3px]"
        style={{
          borderRadius: borderRadius.xl,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {options.map(option => {
          const isActive = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onChange(option.value)}
              activeOpacity={0.8}
              className={`flex-1 items-center justify-center ${isActive && isDark ? 'bg-neutral-white/10' : ''}`}
              style={{
                paddingVertical: spacing.md,
                paddingHorizontal: spacing.md,
                borderRadius: borderRadius.lg,
                backgroundColor: isActive && !isDark ? colors.text.primary : 'transparent',
              }}
            >
              <Text
                style={{
                  color: isActive
                    ? (isDark ? colors.text.primary : colors.background)
                    : colors.text.secondary,
                  fontSize: typography.size.xs,
                  fontWeight: isActive
                    ? typography.weight.semibold
                    : typography.weight.medium,
                  letterSpacing: labelLetterSpacing,
                }}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
