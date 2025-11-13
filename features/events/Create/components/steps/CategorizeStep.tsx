import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { EventType } from '../../../../../shared/types';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';

const EVENT_CATEGORIES = [
  { label: 'Conference', value: EventType.CONFERENCE },
  { label: 'Party', value: EventType.PARTY },
  { label: 'Concert', value: EventType.CONCERT },
  { label: 'Workshop', value: EventType.WORKSHOP },
  { label: 'Networking', value: EventType.NETWORKING },
  { label: 'Exhibition', value: EventType.TRADE_SHOW },
];

const AVAILABLE_TAGS = [
  'Music',
  'Amapiano',
  'Fashion',
  'Food',
  'Culture',
  'Dance',
  'Art',
  'Sports',
  'Tech',
  'Business',
  'Networking',
  'Workshop',
];

type Props = {
  selectedEventType: EventType | null;
  tags: string[];
  onEventTypeSelect: (type: EventType) => void;
  onTagToggle: (tag: string) => void;
};

export function CategorizeStep({ selectedEventType, tags, onEventTypeSelect, onTagToggle }: Props) {
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

      <View>
        <Text
          style={{
            color: colors.text.primary,
            fontSize: typography.size.base,
            fontWeight: typography.weight.semibold,
            marginBottom: spacing.md,
          }}
        >
          Tags (Optional)
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {AVAILABLE_TAGS.map((tag) => {
            const isSelected = tags.includes(tag);
            return (
              <TouchableOpacity
                key={tag}
                onPress={() => onTagToggle(tag)}
                activeOpacity={0.7}
                style={{
                  borderRadius: borderRadius.full,
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  backgroundColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : colors.surface,
                  borderWidth: 1,
                  borderColor: isSelected ? (isDark ? '#FFFFFF' : '#000000') : colors.border,
                }}
              >
                <Text
                  style={{
                    color: isSelected ? (isDark ? '#000000' : '#FFFFFF') : colors.text.primary,
                    fontWeight: isSelected ? typography.weight.semibold : typography.weight.regular,
                    fontSize: typography.size.sm,
                  }}
                >
                  {tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

