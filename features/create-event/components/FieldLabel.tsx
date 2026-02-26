import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  icon?: React.ReactNode;
  label: string;
};

export function FieldLabel({ icon, label }: Props) {
  return (
    <View className="flex-row items-center gap-xs mb-xs">
      {icon}
      <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
        {label}
      </Text>
    </View>
  );
}
