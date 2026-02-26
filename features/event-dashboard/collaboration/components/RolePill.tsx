import React from 'react';
import { Text } from 'react-native';

export function RolePill({ label }: { label: string }) {
  return (
    <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
      {label}
    </Text>
  );
}
