import React from 'react';
import { View, TouchableOpacity } from 'react-native';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  elevated?: boolean;
  noPadding?: boolean;
  style?: any;
};

export default function Card({ children, onPress, elevated = false, noPadding = false, style }: Props) {
  const cardClasses = `rounded-2xl border border-light-border dark:border-dark-border ${
    elevated 
      ? 'bg-light-surface-elevated dark:bg-dark-surface-elevated' 
      : 'bg-light-card dark:bg-dark-card'
  } ${noPadding ? '' : 'p-lg'}`;

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} className={cardClasses} style={style}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={cardClasses} style={style}>{children}</View>;
}

