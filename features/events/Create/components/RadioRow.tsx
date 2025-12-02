import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  label: string;
  active: boolean;
  onPress: () => void;
};

export function RadioRow({ label, active, onPress }: Props) {
  const { colors, spacing, brand } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.sm,
      }}
    >
      <View
        style={{
          height: 20,
          width: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: active ? brand.primary : colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {active ? (
          <View
            style={{
              height: 10,
              width: 10,
              borderRadius: 5,
              backgroundColor: brand.primary,
            }}
          />
        ) : null}
      </View>
      <Text style={{ color: colors.text.primary }}>{label}</Text>
    </TouchableOpacity>
  );
}

