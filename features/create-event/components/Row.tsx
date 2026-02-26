import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function Row({ label, icon, children }: Props) {
  return (
    <View className="mb-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-xs">
          {icon}
          <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
            {label}
          </Text>
        </View>
        {children}
      </View>
    </View>
  );
}
