import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function RadioRow({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center gap-sm py-sm"
      activeOpacity={0.7}
    >
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${
          active
            ? 'border-brand-primary'
            : 'border-light-border dark:border-dark-border'
        }`}
      >
        {active ? (
          <View className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
        ) : null}
      </View>
      <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
        {label}
      </Text>
    </TouchableOpacity>
  );
}
