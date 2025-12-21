import React from 'react';
import { View, Text } from 'react-native';
import { CheckCircle, Clock, XCircle } from 'lucide-react-native';
import { EventCollaboratorResponse } from '../../../../../core/events/types';
import { CollaboratorCard } from './CollaboratorCard';

type CollaboratorStatus = 'CONFIRMED' | 'PENDING' | 'DECLINED';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ComponentType<any> }> = {
  CONFIRMED: { label: 'Confirmed', color: '#10B981', icon: CheckCircle },
  PENDING: { label: 'Waiting', color: '#F59E0B', icon: Clock },
  DECLINED: { label: 'Not Interested', color: '#EF4444', icon: XCircle },
};

type Props = {
  collaborators: EventCollaboratorResponse[];
  onCollaboratorPress: (collaborator: EventCollaboratorResponse) => void;
  onRemove: (collaboratorId: string, email: string) => void;
  getInitials: (name?: string, email?: string) => string;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
};

function getStatus(collaborator: EventCollaboratorResponse): CollaboratorStatus {
  const status = collaborator.registrationStatus?.toUpperCase();
  if (status === 'CONFIRMED' || status === 'ACCEPTED') return 'CONFIRMED';
  if (status === 'DECLINED' || status === 'REJECTED') return 'DECLINED';
  return 'PENDING';
}

export function CollaboratorsList({
  collaborators,
  onCollaboratorPress,
  onRemove,
  getInitials,
  colors,
  spacing,
  typography,
  borderRadius,
}: Props) {
  const grouped: Record<CollaboratorStatus, EventCollaboratorResponse[]> = {
    CONFIRMED: [],
    PENDING: [],
    DECLINED: [],
  };

  collaborators.forEach(collaborator => {
    const status = getStatus(collaborator);
    grouped[status].push(collaborator);
  });

  return (
    <View style={{ gap: spacing.xl }}>
      {/* Confirmed Collaborators */}
      {grouped.CONFIRMED.length > 0 && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <CheckCircle size={16} color={STATUS_CONFIG.CONFIRMED.color} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.base,
                fontWeight: typography.weight.bold,
              }}
            >
              Confirmed ({grouped.CONFIRMED.length})
            </Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {grouped.CONFIRMED.map(collaborator => (
              <CollaboratorCard
                key={collaborator.collaboratorId}
                collaborator={collaborator}
                onPress={() => onCollaboratorPress(collaborator)}
                onRemove={() => onRemove(collaborator.collaboratorId, collaborator.email)}
                getInitials={getInitials}
                colors={colors}
                spacing={spacing}
                typography={typography}
                borderRadius={borderRadius}
              />
            ))}
          </View>
        </View>
      )}

      {/* Pending Collaborators */}
      {grouped.PENDING.length > 0 && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <Clock size={16} color={STATUS_CONFIG.PENDING.color} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.base,
                fontWeight: typography.weight.bold,
              }}
            >
              Waiting ({grouped.PENDING.length})
            </Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {grouped.PENDING.map(collaborator => (
              <CollaboratorCard
                key={collaborator.collaboratorId}
                collaborator={collaborator}
                onPress={() => onCollaboratorPress(collaborator)}
                onRemove={() => onRemove(collaborator.collaboratorId, collaborator.email)}
                getInitials={getInitials}
                colors={colors}
                spacing={spacing}
                typography={typography}
                borderRadius={borderRadius}
              />
            ))}
          </View>
        </View>
      )}

      {/* Declined Collaborators */}
      {grouped.DECLINED.length > 0 && (
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <XCircle size={16} color={STATUS_CONFIG.DECLINED.color} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.base,
                fontWeight: typography.weight.bold,
              }}
            >
              Not Interested ({grouped.DECLINED.length})
            </Text>
          </View>
          <View style={{ gap: spacing.sm }}>
            {grouped.DECLINED.map(collaborator => (
              <CollaboratorCard
                key={collaborator.collaboratorId}
                collaborator={collaborator}
                onPress={() => onCollaboratorPress(collaborator)}
                onRemove={() => onRemove(collaborator.collaboratorId, collaborator.email)}
                getInitials={getInitials}
                colors={colors}
                spacing={spacing}
                typography={typography}
                borderRadius={borderRadius}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

