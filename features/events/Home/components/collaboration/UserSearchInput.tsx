import React from 'react';
import { View, Text, TextInput } from 'react-native';
import { Search } from 'lucide-react-native';

type Props = {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searching: boolean;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
};

export function UserSearchInput({
  searchQuery,
  onSearchChange,
  searching,
  colors,
  spacing,
  typography,
  borderRadius,
}: Props) {
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Text
        style={{
          color: colors.text.primary,
          fontSize: typography.size.base,
          fontWeight: typography.weight.bold,
          marginBottom: spacing.md,
        }}
      >
        Search for users
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: borderRadius.lg,
          borderWidth: 2,
          borderColor: colors.border,
          paddingHorizontal: spacing.lg,
          minHeight: 56,
        }}
      >
        <Search size={22} color={colors.text.secondary} />
        <TextInput
          value={searchQuery}
          onChangeText={onSearchChange}
          placeholder="Search by name or email..."
          placeholderTextColor={colors.text.secondary}
          style={{
            flex: 1,
            padding: spacing.md,
            color: colors.text.primary,
            fontSize: typography.size.base,
            marginLeft: spacing.sm,
          }}
        />
        {searching && (
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>Searching...</Text>
        )}
      </View>
    </View>
  );
}

