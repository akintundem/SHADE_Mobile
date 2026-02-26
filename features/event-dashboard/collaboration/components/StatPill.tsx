import React from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type IconType = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

type Props = {
  icon: IconType;
  label: string;
  value: number;
};

export function StatPill({ icon: Icon, label, value }: Props) {
  const { colors } = useTheme();
  return (
    <View className="flex-1 min-w-[140px] py-md">
      <View className="flex-row items-center gap-sm mb-xs">
        <Icon size={14} color={colors.text.tertiary} strokeWidth={2.2} />
        <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary">
          {label}
        </Text>
      </View>
      <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary tracking-tight">
        {value}
      </Text>
    </View>
  );
}
