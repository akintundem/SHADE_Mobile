import React from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';

type Props = {
  title: string;
  description: string;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onTitleBlur: () => void;
  onDescriptionBlur: () => void;
  titleError?: string;
  descriptionError?: string;
};

export function EventBasicsStep({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  onTitleBlur,
  onDescriptionBlur,
  titleError,
  descriptionError,
}: Props) {
  const { colors, typography, spacing, borderRadius } = useTheme();

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
          Event Basics
        </Text>
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
          }}
        >
          Let's start with the essentials
        </Text>
      </View>

      <View style={{ gap: spacing.lg }}>
        <View>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
              marginBottom: spacing.sm,
            }}
          >
            Event Name
          </Text>
          <TextInput
            placeholder="Give your event a name..."
            placeholderTextColor={colors.text.tertiary}
            value={title}
            onChangeText={onTitleChange}
            onBlur={onTitleBlur}
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              fontSize: typography.size.base,
              color: colors.text.primary,
              minHeight: 48,
            }}
          />
          {titleError && (
            <Text style={{ color: colors.semantic.error, fontSize: typography.size.xs, marginTop: spacing.xs }}>
              {titleError}
            </Text>
          )}
        </View>

        <View>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.medium,
              marginBottom: spacing.sm,
            }}
          >
            Description
          </Text>
          <TextInput
            placeholder="Describe your event..."
            placeholderTextColor={colors.text.tertiary}
            multiline
            numberOfLines={6}
            value={description}
            onChangeText={onDescriptionChange}
            onBlur={onDescriptionBlur}
            style={{
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              fontSize: typography.size.base,
              color: colors.text.primary,
              minHeight: 120,
              textAlignVertical: 'top',
            }}
          />
          {descriptionError && (
            <Text style={{ color: colors.semantic.error, fontSize: typography.size.xs, marginTop: spacing.xs }}>
              {descriptionError}
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

