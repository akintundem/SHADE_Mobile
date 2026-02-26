import React from 'react';
import { Text } from 'react-native';

export function SectionLabel({ label }: { label: string }) {
  return (
    <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
      {label}
    </Text>
  );
}
