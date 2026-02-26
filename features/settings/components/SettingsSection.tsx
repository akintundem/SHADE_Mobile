import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  title: string;
};

export function SettingsSection({ title }: Props) {
  return (
    <View className="px-xl pt-xl pb-sm bg-light-background dark:bg-dark-background">
      <Text className="text-xs font-semibold uppercase tracking-wider text-txt-tertiary dark:text-txt-dark-tertiary">
        {title}
      </Text>
    </View>
  );
}
