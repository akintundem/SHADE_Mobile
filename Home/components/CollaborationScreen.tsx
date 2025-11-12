import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { ArrowLeft, Plus, User, Mail, Crown, Shield, Settings, UserPlus } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { EventCollaboratorResponse } from '../../types/events';
import { EventUserType } from '../../types/enums';

type Props = {
  eventId: string;
  onBack: () => void;
  onAddCollaborator?: () => void;
};

// Mock data for demonstration
const mockCollaborators: EventCollaboratorResponse[] = [
  {
    collaboratorId: '1',
    eventId: 'event-1',
    userId: 'user-1',
    email: 'sarah.johnson@email.com',
    role: EventUserType.ORGANIZER,
    permissions: ['EDIT_EVENT', 'MANAGE_GUESTS', 'MANAGE_BUDGET'],
    notes: 'Lead event coordinator',
    sendInvitation: true,
    invitationMessage: null,
    invitationSentAt: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    collaboratorId: '2',
    eventId: 'event-1',
    userId: 'user-2',
    email: 'mike.chen@email.com',
    role: EventUserType.COLLABORATOR,
    permissions: ['VIEW_EVENT', 'MANAGE_GUESTS'],
    notes: 'Handles guest communications',
    sendInvitation: true,
    invitationMessage: null,
    invitationSentAt: '2024-01-16T14:30:00Z',
    createdAt: '2024-01-16T14:30:00Z',
    updatedAt: '2024-01-16T14:30:00Z'
  },
  {
    collaboratorId: '3',
    eventId: 'event-1',
    userId: null,
    email: 'alex.rodriguez@email.com',
    role: EventUserType.COLLABORATOR,
    permissions: ['VIEW_EVENT'],
    notes: null,
    sendInvitation: true,
    invitationMessage: 'Welcome to the team!',
    invitationSentAt: null,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-18T09:15:00Z'
  }
];

export default function CollaborationScreen({ eventId, onBack, onAddCollaborator }: Props) {
  const { colors, typography, spacing, borderRadius, brand } = useTheme();
  const [collaborators, setCollaborators] = useState<EventCollaboratorResponse[]>(mockCollaborators);

  const getRoleIcon = (role: EventUserType) => {
    switch (role) {
      case EventUserType.ORGANIZER:
        return <Crown size={18} color="#f59e0b" />;
      case EventUserType.COLLABORATOR:
        return <Shield size={18} color={colors.text.secondary} />;
      default:
        return <User size={18} color={colors.text.secondary} />;
    }
  };

  const getRoleColor = (role: EventUserType) => {
    switch (role) {
      case EventUserType.ORGANIZER:
        return '#f59e0b';
      case EventUserType.COLLABORATOR:
        return colors.brand.primary;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusBadge = (collaborator: EventCollaboratorResponse) => {
    if (!collaborator.userId && !collaborator.invitationSentAt) {
      return { text: 'Pending', color: '#f59e0b' };
    } else if (!collaborator.userId && collaborator.invitationSentAt) {
      return { text: 'Invited', color: '#3b82f6' };
    } else {
      return { text: 'Active', color: '#22c55e' };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
            <ArrowLeft size={20} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={{
            fontSize: typography.size.xl,
            fontWeight: typography.weight.bold,
            color: colors.text.primary
          }}>
            Team & Collaboration
          </Text>
        </View>
        <TouchableOpacity
          onPress={onAddCollaborator}
          style={{
            backgroundColor: colors.brand.primary,
            borderRadius: borderRadius.md,
            paddingHorizontal: spacing.md,
            paddingVertical: spacing.sm,
            flexDirection: 'row',
            alignItems: 'center',
            gap: spacing.xs
          }}
        >
          <UserPlus size={16} color="#FFFFFF" />
          <Text style={{
            color: '#FFFFFF',
            fontSize: typography.size.sm,
            fontWeight: typography.weight.medium
          }}>
            Invite
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        {collaborators.map((collaborator) => {
          const status = getStatusBadge(collaborator);
          
          return (
            <View
              key={collaborator.collaboratorId}
              style={{
                backgroundColor: colors.surface,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                gap: spacing.md
              }}
            >
              {/* Collaborator Header */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xs }}>
                    <Mail size={16} color={colors.text.secondary} />
                    <Text style={{
                      fontSize: typography.size.base,
                      fontWeight: typography.weight.semibold,
                      color: colors.text.primary
                    }}>
                      {collaborator.email}
                    </Text>
                  </View>
                  
                  {collaborator.notes && (
                    <Text style={{
                      fontSize: typography.size.sm,
                      color: colors.text.secondary,
                      marginBottom: spacing.sm
                    }}>
                      {collaborator.notes}
                    </Text>
                  )}
                </View>

                <TouchableOpacity style={{ padding: spacing.xs }}>
                  <Settings size={18} color={colors.text.secondary} />
                </TouchableOpacity>
              </View>

              {/* Role & Status */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: spacing.sm,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  backgroundColor: getRoleColor(collaborator.role) + '20',
                  borderRadius: borderRadius.sm,
                  borderWidth: 1,
                  borderColor: getRoleColor(collaborator.role)
                }}>
                  {getRoleIcon(collaborator.role)}
                  <Text style={{
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.medium,
                    color: getRoleColor(collaborator.role),
                    textTransform: 'capitalize'
                  }}>
                    {collaborator.role.toLowerCase()}
                  </Text>
                </View>

                <View style={{
                  paddingHorizontal: spacing.sm,
                  paddingVertical: spacing.xs,
                  backgroundColor: status.color + '20',
                  borderRadius: borderRadius.sm,
                  borderWidth: 1,
                  borderColor: status.color
                }}>
                  <Text style={{
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.medium,
                    color: status.color
                  }}>
                    {status.text}
                  </Text>
                </View>
              </View>

              {/* Permissions Preview */}
              {collaborator.permissions.length > 0 && (
                <View>
                  <Text style={{
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.medium,
                    color: colors.text.secondary,
                    marginBottom: spacing.xs,
                    textTransform: 'uppercase'
                  }}>
                    Permissions ({collaborator.permissions.length})
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                    {collaborator.permissions.slice(0, 3).map((permission, index) => (
                      <View
                        key={index}
                        style={{
                          backgroundColor: colors.border,
                          borderRadius: borderRadius.sm,
                          paddingHorizontal: spacing.sm,
                          paddingVertical: spacing.xs
                        }}
                      >
                        <Text style={{
                          fontSize: typography.size.xs,
                          color: colors.text.secondary
                        }}>
                          {permission.replace(/_/g, ' ').toLowerCase()}
                        </Text>
                      </View>
                    ))}
                    {collaborator.permissions.length > 3 && (
                      <View style={{
                        backgroundColor: colors.border,
                        borderRadius: borderRadius.sm,
                        paddingHorizontal: spacing.sm,
                        paddingVertical: spacing.xs
                      }}>
                        <Text style={{
                          fontSize: typography.size.xs,
                          color: colors.text.secondary
                        }}>
                          +{collaborator.permissions.length - 3} more
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}

        {/* Empty State */}
        {collaborators.length === 0 && (
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: spacing['3xl']
          }}>
            <View style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: spacing.lg
            }}>
              <UserPlus size={32} color={colors.text.secondary} />
            </View>
            <Text style={{
              fontSize: typography.size.lg,
              fontWeight: typography.weight.semibold,
              color: colors.text.primary,
              marginBottom: spacing.sm
            }}>
              No team members yet
            </Text>
            <Text style={{
              fontSize: typography.size.sm,
              color: colors.text.secondary,
              textAlign: 'center'
            }}>
              Invite collaborators to help you manage this event
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}