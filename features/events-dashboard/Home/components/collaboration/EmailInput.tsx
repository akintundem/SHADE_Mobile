import React from 'react';
import { View, Text, TextInput } from 'react-native';

type Props = {
  email: string;
  onEmailChange: (email: string) => void;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
};

export function EmailInput({ email, onEmailChange, colors, spacing, typography, borderRadius }: Props) {
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: spacing.md,
          marginTop: spacing.md,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        <Text
          style={{
            color: colors.text.secondary,
            fontSize: typography.size.sm,
            marginHorizontal: spacing.md,
          }}
        >
          OR
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      </View>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: typography.size.sm,
          marginBottom: spacing.sm,
        }}
      >
        Add by email
      </Text>
      <TextInput
        value={email}
        onChangeText={onEmailChange}
        placeholder="email@example.com"
        placeholderTextColor={colors.text.secondary}
        keyboardType="email-address"
        autoCapitalize="none"
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          padding: spacing.md,
          borderWidth: 1,
          borderColor: colors.border,
          color: colors.text.primary,
          fontSize: typography.size.base,
        }}
      />
    </View>
  );
}

