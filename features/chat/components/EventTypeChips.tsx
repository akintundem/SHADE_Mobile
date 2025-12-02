import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../../common/theme/ThemeProvider';

interface EventType {
  id: string;
  label: string;
  icon: string;
}

interface EventTypeChipsProps {
  eventTypes: EventType[];
  selectedType: string;
  onTypeSelect: (typeId: string) => void;
}

export default function EventTypeChips({ eventTypes, selectedType, onTypeSelect }: EventTypeChipsProps) {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ marginBottom: spacing.md }}
      contentContainerStyle={{ gap: spacing.sm }}
    >
      {eventTypes.map((type) => (
        <TouchableOpacity
          key={type.id}
          onPress={() => onTypeSelect(type.id)}
          style={{
            backgroundColor: selectedType === type.id ? colors.surfaceElevated : colors.surface,
            borderRadius: borderRadius.full,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            ...(selectedType === type.id ? shadows.sm : {}),
          }}
        >
          <Text style={{ fontSize: 16, marginRight: spacing.xs }}>{type.icon}</Text>
          <Text style={{
            color: colors.text.primary,
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium,
          }}>
            {type.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
