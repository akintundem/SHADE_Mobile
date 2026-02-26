import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  onPress: () => void;
  disabled?: boolean;
  showBorder?: boolean;
};

export function ManageMenuItem({
  icon: Icon,
  title,
  subtitle,
  onPress,
  disabled = false,
  showBorder = true,
}: Props) {
  const { colors } = useTheme();
  const iconColor = colors.text.primary;
  const tertiary = colors.text.tertiary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
      disabled={disabled}
      className="flex-row items-center py-lg"
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      <Icon size={18} color={iconColor} strokeWidth={2} />
      <View className="flex-1 ml-md">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
          {title}
        </Text>
        <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
          {subtitle}
        </Text>
      </View>
      <ChevronRight size={18} color={tertiary} strokeWidth={2} />
    </TouchableOpacity>
  );
}
