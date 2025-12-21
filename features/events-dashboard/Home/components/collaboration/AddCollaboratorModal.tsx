import React from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';
import { PublicUserResponse } from '../../../../../../core/auth/types/auth';
import { EventUserType } from '../../../../../core/events/types';
import { UserSearchInput } from './UserSearchInput';
import { SearchResultsList } from './SearchResultsList';
import { SelectedUserDisplay } from './SelectedUserDisplay';
import { EmailInput } from './EmailInput';
import { RoleSelection } from './RoleSelection';

type Props = {
  visible: boolean;
  onClose: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: PublicUserResponse[];
  searching: boolean;
  onSelectUser: (user: PublicUserResponse | null) => void;
  onClearSelectedUser: () => void;
  selectedUser: PublicUserResponse | null;
  inviteEmail: string;
  onInviteEmailChange: (email: string) => void;
  selectedRole: EventUserType;
  onRoleChange: (role: EventUserType) => void;
  onAdd: () => void;
  loading: boolean;
  colors: any;
  spacing: any;
  typography: any;
  borderRadius: any;
  getInitials: (name?: string, email?: string) => string;
};

export function AddCollaboratorModal({
  visible,
  onClose,
  searchQuery,
  onSearchChange,
  searchResults,
  searching,
  onSelectUser,
  onClearSelectedUser,
  selectedUser,
  inviteEmail,
  onInviteEmailChange,
  selectedRole,
  onRoleChange,
  onAdd,
  loading,
  colors,
  spacing,
  typography,
  borderRadius,
  getInitials,
}: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <SafeAreaView edges={['bottom']} style={{ backgroundColor: colors.background }}>
            <View
              style={{
                backgroundColor: colors.background,
                borderTopLeftRadius: borderRadius['2xl'],
                borderTopRightRadius: borderRadius['2xl'],
                maxHeight: '95%',
                minHeight: '70%',
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: spacing.xl,
                  paddingVertical: spacing.lg,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: colors.text.primary,
                    fontSize: typography.size.xl,
                    fontWeight: typography.weight.bold,
                  }}
                >
                  Add Collaborator
                </Text>
                <TouchableOpacity onPress={onClose}>
                  <X size={24} color={colors.text.primary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: spacing.xl, paddingBottom: spacing['3xl'] }}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
              >
                {/* Search Input */}
                <UserSearchInput
                  searchQuery={searchQuery}
                  onSearchChange={onSearchChange}
                  searching={searching}
                  colors={colors}
                  spacing={spacing}
                  typography={typography}
                  borderRadius={borderRadius}
                />

                {/* Search Results */}
                {searchQuery.length >= 2 && (
                  <SearchResultsList
                    searchResults={searchResults}
                    selectedUser={selectedUser}
                    onSelectUser={(user) => onSelectUser(user)}
                    getInitials={getInitials}
                    colors={colors}
                    spacing={spacing}
                    typography={typography}
                    borderRadius={borderRadius}
                  />
                )}

                {/* Email Input */}
                {!selectedUser && (
                  <EmailInput
                    email={inviteEmail}
                    onEmailChange={onInviteEmailChange}
                    colors={colors}
                    spacing={spacing}
                    typography={typography}
                    borderRadius={borderRadius}
                  />
                )}

                {/* Selected User Display */}
                {selectedUser && (
                  <SelectedUserDisplay
                    selectedUser={selectedUser}
                    onClear={onClearSelectedUser}
                    getInitials={getInitials}
                    colors={colors}
                    spacing={spacing}
                    typography={typography}
                    borderRadius={borderRadius}
                  />
                )}

                {/* Role Selection */}
                <RoleSelection
                  selectedRole={selectedRole}
                  onRoleChange={onRoleChange}
                  colors={colors}
                  spacing={spacing}
                  typography={typography}
                  borderRadius={borderRadius}
                />

                {/* Add Button */}
                <TouchableOpacity
                  onPress={onAdd}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? colors.border : colors.brand.primary,
                    borderRadius: borderRadius.lg,
                    paddingVertical: spacing.lg,
                    paddingHorizontal: spacing.xl,
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 56,
                    marginTop: spacing.lg,
                  }}
                >
                  <Text
                    style={{
                      color: '#FFFFFF',
                      fontSize: typography.size.lg,
                      fontWeight: typography.weight.bold,
                    }}
                  >
                    {loading ? 'Adding...' : 'Add Collaborator'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </SafeAreaView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

