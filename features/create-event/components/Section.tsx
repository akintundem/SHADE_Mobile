import React from 'react';
import { View, Text } from 'react-native';

type Props = {
  title: string;
  children: React.ReactNode;
};

export function Section({ title, children }: Props) {
  return (
    <View className="px-lg pt-lg">
      <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary mb-md">
        {title}
      </Text>
      {children}
    </View>
  );
}
