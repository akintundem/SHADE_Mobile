import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Mail, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { EventCollaboratorResponse } from '../../../../shared/types';
import { EventUserType } from '../../../../../shared/types/enums';

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

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  CONFIRMED: { label: 'Confirmed', color: '#10B981', icon: CheckCircle },
  PENDING: { label: 'Waiting', color: '#F59E0B', icon: Clock },
  DECLINED: { label: 'Not Interested', color: '#EF4444', icon: XCircle },
};

type Props = {
  collaborator: EventCollaboratorResponse;
  onPress: () => void;
  onRemove: () => void;
  getInitials: (name?: string, email?: string) => string;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
};

export function CollaboratorCard({
  collaborator,
  onPress,
  onRemove,
  getInitials,
  colors,
  spacing,
  typography,
  borderRadius,
}: Props) {
  const status = collaborator.registrationStatus?.toUpperCase();
  const isConfirmed = status === 'CONFIRMED' || status === 'ACCEPTED';
  const isPending = !isConfirmed && status !== 'DECLINED' && status !== 'REJECTED';
  const isDeclined = status === 'DECLINED' || status === 'REJECTED';

  const statusConfig = isConfirmed
    ? STATUS_CONFIG.CONFIRMED
    : isDeclined
    ? STATUS_CONFIG.DECLINED
    : STATUS_CONFIG.PENDING;

  const StatusIcon = statusConfig.icon;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors.surface,
        borderRadius: borderRadius.xl,
        padding: spacing.lg,
        borderWidth: 2,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        {/* Avatar */}
        <View
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.brand.primary + '20',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}
        >
          {collaborator.userName ? (
            <Text
              style={{
                color: colors.brand.primary,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.bold,
              }}
            >
              {getInitials(collaborator.userName, collaborator.email)}
            </Text>
          ) : (
            <Mail size={24} color={colors.brand.primary} />
          )}
        </View>

        {/* Info */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.base,
              fontWeight: typography.weight.bold,
            }}
          >
            {collaborator.userName || collaborator.email}
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.size.sm,
              marginTop: 2,
            }}
          >
            {collaborator.email}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs }}>
            <View
              style={{
                paddingHorizontal: spacing.sm,
                paddingVertical: 2,
                borderRadius: borderRadius.sm,
                backgroundColor: colors.brand.primary + '20',
              }}
            >
              <Text
                style={{
                  color: colors.brand.primary,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                }}
              >
                {ROLE_LABELS[collaborator.role]}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: spacing.xs,
              }}
            >
              <StatusIcon size={12} color={statusConfig.color} />
              <Text
                style={{
                  color: statusConfig.color,
                  fontSize: typography.size.xs,
                  fontWeight: typography.weight.medium,
                }}
              >
                {statusConfig.label}
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            padding: spacing.sm,
            borderRadius: borderRadius.md,
            backgroundColor: colors.error + '20',
          }}
        >
          <Trash2 size={18} color={colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

