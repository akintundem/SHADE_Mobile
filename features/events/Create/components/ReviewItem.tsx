import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../../../shared/theme/ThemeProvider';

type Props = {
  label: string;
  value: string;
  onEdit: () => void;
};

export function ReviewItem({ label, value, onEdit }: Props) {
  const { colors, typography, spacing, brand } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm, marginBottom: 4 }}>
          {label}
        </Text>
        <Text style={{ color: colors.text.primary, fontSize: typography.size.base }}>
          {value}
        </Text>
      </View>
      <TouchableOpacity onPress={onEdit} style={{ paddingLeft: spacing.md }}>
        <Text style={{ color: brand.secondary, fontSize: typography.size.sm }}>
          Edit
        </Text>
      </TouchableOpacity>
    </View>
  );
}

