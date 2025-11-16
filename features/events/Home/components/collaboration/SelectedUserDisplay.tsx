import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { X } from 'lucide-react-native';
import { UserResponse } from '../../../../shared/types/auth';

type Props = {
  selectedUser: UserResponse;
  onClear: () => void;
  getInitials: (name?: string, email?: string) => string;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
};

export function SelectedUserDisplay({
  selectedUser,
  onClear,
  getInitials,
  colors,
  spacing,
  typography,
  borderRadius,
}: Props) {
  return (
    <View
      style={{
        backgroundColor: colors.brand.primary + '10',
        borderRadius: borderRadius.md,
        padding: spacing.md,
        marginBottom: spacing.lg,
        borderWidth: 1,
        borderColor: colors.brand.primary + '30',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.brand.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text
            style={{
              color: colors.brand.primary,
              fontSize: typography.size.sm,
              fontWeight: typography.weight.bold,
            }}
          >
            {getInitials(selectedUser.name, selectedUser.email)}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.medium,
            }}
          >
            {selectedUser.name}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.size.sm,
            }}
          >
            {selectedUser.email}
          </Text>
        </View>
        <TouchableOpacity onPress={onClear}>
          <X size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

