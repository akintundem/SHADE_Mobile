import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { EventUserType } from '../../../../../core/events/types/event';

const ROLE_LABELS: Record<EventUserType, string> = {
  ORGANIZER: 'Organizer',
  COORDINATOR: 'Coordinator',
  STAFF: 'Staff',
  COLLABORATOR: 'Collaborator',
  VOLUNTEER: 'Volunteer',
  VENDOR: 'Vendor',
  SPEAKER: 'Speaker',
  SPONSOR: 'Sponsor',
  MEDIA: 'Media',
  ATTENDEE: 'Attendee',
  ADMIN: 'Admin',
};

type Props = {
  selectedRole: EventUserType;
  onRoleChange: (role: EventUserType) => void;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
};

export function RoleSelection({ selectedRole, onRoleChange, colors, spacing, typography, borderRadius }: Props) {
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
        Select Role
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: spacing.sm,
        }}
      >
        {Object.values(EventUserType).map(role => (
          <TouchableOpacity
            key={role}
            onPress={() => onRoleChange(role)}
            style={{
              flexBasis: '47%',
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              backgroundColor: selectedRole === role ? colors.brand.primary : colors.surface,
              borderWidth: 2,
              borderColor: selectedRole === role ? colors.brand.primary : colors.border,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
            }}
          >
            <Text
              style={{
                color: selectedRole === role ? '#FFFFFF' : colors.text.primary,
                fontSize: typography.size.base,
                fontWeight: typography.weight.semibold,
                textAlign: 'center',
              }}
            >
              {ROLE_LABELS[role]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
