import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { CheckCircle } from 'lucide-react-native';
import { PublicUserResponse } from '../../../../../../core/auth/types/auth';

type Props = {
  searchResults: PublicUserResponse[];
  selectedUser: PublicUserResponse | null;
  onSelectUser: (user: PublicUserResponse) => void;
  getInitials: (name?: string, email?: string) => string;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
};

export function SearchResultsList({
  searchResults,
  selectedUser,
  onSelectUser,
  getInitials,
  colors,
  spacing,
  typography,
  borderRadius,
}: Props) {
  if (searchResults.length === 0) return null;

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
        Select a user
      </Text>
      <View style={{ gap: spacing.md }}>
        {searchResults.map(user => (
          <TouchableOpacity
            key={user.id}
            onPress={() => onSelectUser(user)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              padding: spacing.lg,
              backgroundColor: colors.surface,
              borderRadius: borderRadius.lg,
              borderWidth: selectedUser?.id === user.id ? 3 : 2,
              borderColor: selectedUser?.id === user.id ? colors.brand.primary : colors.border,
            }}
          >
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors.brand.primary + '20',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: spacing.md,
              }}
            >
              {user.profileImageUrl ? (
                <Image source={{ uri: user.profileImageUrl }} style={{ width: 48, height: 48, borderRadius: 24 }} />
              ) : (
                <Text
                  style={{
                    color: colors.brand.primary,
                    fontSize: typography.size.sm,
                    fontWeight: typography.weight.bold,
                  }}
                >
                  {getInitials(user.name, user.email)}
                </Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.medium,
                }}
              >
                {user.name}
              </Text>
              <Text
                style={{
                  color: colors.text.secondary,
                  fontSize: typography.size.sm,
                }}
              >
                {user.email}
              </Text>
            </View>
            {selectedUser?.id === user.id && <CheckCircle size={20} color={colors.brand.primary} />}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

