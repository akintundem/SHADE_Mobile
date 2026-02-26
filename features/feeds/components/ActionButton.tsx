import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  icon: any;
  value?: number;
  onPress: () => void;
  active?: boolean;
};

export function ActionButton({ icon: Icon, value, onPress, active = false }: Props) {
  const { colors } = useTheme();
  const activeColor = colors.semantic.error;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center gap-[5px] p-xs"
    >
      <Icon
        size={15}
        color={active ? activeColor : colors.text.tertiary}
        fill={active ? activeColor : 'none'}
        strokeWidth={2}
      />
      {typeof value === 'number' && value > 0 && (
        <Text
          className={`text-xs font-medium ${active ? 'text-semantic-error' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}
        >
          {value}
        </Text>
      )}
    </TouchableOpacity>
  );
}
