import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  elevated?: boolean;
  noPadding?: boolean;
  style?: any;
};

export default function Card({ children, onPress, elevated = false, noPadding = false, style }: Props) {
  const { colors, borderRadius, spacing, shadows } = useTheme();

  const cardStyle = {
    backgroundColor: elevated ? colors.cardElevated : colors.card,
    borderRadius: borderRadius.xl,
    padding: noPadding ? 0 : spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...(elevated && shadows.md),
  };

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[cardStyle, style]}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[cardStyle, style]}>{children}</View>;
}

