import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  title: string;
  subtitle?: string;
  end?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
};

export const SettingsRow = React.memo(function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  end,
  onPress,
  danger,
}: Props) {
  const { colors } = useTheme();
  const iconColor = danger ? colors.semantic.error : colors.text.primary;
  const titleClass = danger
    ? 'text-sm font-semibold text-semantic-error'
    : 'text-sm font-semibold text-txt-primary dark:text-txt-dark-primary';

  return (
    <View>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        className="px-xl py-md flex-row items-center justify-between bg-light-background dark:bg-dark-background"
        activeOpacity={onPress ? 0.7 : 1}
      >
        <View className="flex-row items-center gap-md flex-1">
          <View className="w-7 h-7 rounded-md bg-light-surface dark:bg-dark-surface items-center justify-center">
            <Icon size={16} color={iconColor} strokeWidth={1.5} />
          </View>
          <View className="flex-1">
            <Text className={`${titleClass} tracking-[-0.1px]`}>
              {title}
            </Text>
            {subtitle ? (
              <Text className="mt-[2px] text-xs text-txt-tertiary dark:text-txt-dark-tertiary" numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
          </View>
        </View>
        {end ?? <ChevronRight size={16} color={colors.text.primary} strokeWidth={1.5} />}
      </TouchableOpacity>
    </View>
  );
});
