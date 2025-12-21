import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { EventType } from '../../../../core/events/types/event';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { EVENT_CATEGORIES } from '../../../../core/events/constants';

type Props = {
  selectedEventType: EventType | null;
  onEventTypeSelect: (type: EventType) => void;
};

export function CategorizeStep({ selectedEventType, onEventTypeSelect }: Props) {
  const { colors, typography, spacing, borderRadius, isDark } = useTheme();

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 120,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.xl,
      }}
    >
      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: typography.weight.bold,
            fontSize: typography.size['2xl'],
            marginBottom: spacing.xs,
          }}
        >
          Categorize
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
          }}
        >
          Help people find your event
        </Text>
      </View>

      <View style={{ marginBottom: spacing.xl }}>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.size.base,
            fontWeight: typography.weight.semibold,
            marginBottom: spacing.md,
          }}
        >
          Event Category
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
          {EVENT_CATEGORIES.map((category) => {
            const isSelected = selectedEventType === category.value;
            return (
              <TouchableOpacity
                key={category.value}
                onPress={() => onEventTypeSelect(category.value)}
                activeOpacity={0.7}
                style={{
                  width: '47%',
                  height: 56,
                  borderRadius: borderRadius.lg,
                  borderWidth: 1,
                  borderColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : colors.border,
                  backgroundColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.text.primary,
                    fontWeight: typography.weight.medium,
                    fontSize: typography.size.base,
                  }}
                >
                  {category.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

