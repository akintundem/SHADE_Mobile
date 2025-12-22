import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { EventCollaboratorResponse } from '../../../../core/events/types/event';
import { EventUserType } from '../../../../core/events/types/event';
import { RoleSelection } from './RoleSelection';

type Props = {
  visible: boolean;
  collaborator: EventCollaboratorResponse | null;
  selectedRole: EventUserType;
  onRoleChange: (role: EventUserType) => void;
  onUpdate: (role: EventUserType) => void;
  onClose: () => void;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
};

export function EditCollaboratorModal({
  visible,
  collaborator,
  selectedRole,
  onRoleChange,
  onUpdate,
  onClose,
  colors,
  spacing,
  typography,
  borderRadius,
}: Props) {
  if (!collaborator) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: borderRadius['2xl'],
              borderTopRightRadius: borderRadius['2xl'],
              padding: spacing.xl,
            }}
          >
            {/* Header */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: spacing.xl,
              }}
            >
              <Text
                style={{
                  color: colors.text.primary,
                  fontSize: typography.size.xl,
                  fontWeight: typography.weight.bold,
                }}
              >
                Update Role
              </Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {/* Collaborator Info */}
            <View style={{ marginBottom: spacing.xl }}>
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
            </View>

            {/* Role Selection */}
            <RoleSelection
              selectedRole={selectedRole}
              onRoleChange={onRoleChange}
              colors={colors}
              spacing={spacing}
              typography={typography}
              borderRadius={borderRadius}
            />

            {/* Update Button */}
            <TouchableOpacity
              onPress={() => onUpdate(selectedRole)}
              style={{
                backgroundColor: colors.brand.primary,
                borderRadius: borderRadius.md,
                padding: spacing.md,
                alignItems: 'center',
                marginBottom: spacing.md,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.bold,
                }}
              >
                Update Role
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

