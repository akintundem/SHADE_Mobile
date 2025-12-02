import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Users, Plus } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { eventService } from '../../services/eventService';
import { authService } from '../../../auth/services/authService';
import { EventCollaboratorResponse, EventCollaboratorRequest } from '../../types/events';
import { EventUserType } from '../../types/enums';
import { UserResponse } from '../../../auth/types/auth';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { LoadingOverlay } from '../../../../common/components/LoadingStates';
import { useDebounce } from '../../../../common/hooks/useDebounce';
import { CollaboratorsList } from './collaboration/CollaboratorsList';
import { AddCollaboratorModal } from './collaboration/AddCollaboratorModal';
import { EditCollaboratorModal } from './collaboration/EditCollaboratorModal';

type Props = {
  eventId: string;
  onBack: () => void;
};

export default function CollaborationScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [collaborators, setCollaborators] = useState<EventCollaboratorResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResponse[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [selectedRole, setSelectedRole] = useState<EventUserType>(EventUserType.COORDINATOR);
  const [inviteEmail, setInviteEmail] = useState('');

  // Edit state
  const [editingCollaborator, setEditingCollaborator] = useState<EventCollaboratorResponse | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchCollaborators = useCallback(async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await eventService.getEventCollaborators(eventId);
      setCollaborators(data);
    } catch (err) {
      const message = (err as { message?: string })?.message || 'Failed to load collaborators';
      setError(message);
      ErrorHandler.handle(err, 'getEventCollaborators');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCollaborators();
    setRefreshing(false);
  }, [fetchCollaborators]);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  // Search users
  useEffect(() => {
    if (debouncedSearchQuery.trim().length >= 2) {
      searchUsers(debouncedSearchQuery);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery]);

  const searchUsers = async (query: string) => {
    try {
      setSearching(true);
      const response = await authService.searchUsers(query, { size: 10 });
      const existingCollaboratorEmails = new Set(collaborators.map(c => c.email.toLowerCase()));
      const results = (response.users || []).filter(
        user => !existingCollaboratorEmails.has(user.email.toLowerCase())
      );
      setSearchResults(results);
    } catch (err) {
      ErrorHandler.handle(err, 'searchUsers');
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectUser = (user: UserResponse | null) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
  };

  const handleAddCollaborator = async () => {
    const email = selectedUser?.email || inviteEmail.trim();

    if (!email) {
      Alert.alert('Error', 'Please select a user or enter an email');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    try {
      setLoading(true);
      const request: EventCollaboratorRequest = {
        ...(selectedUser?.id && { userId: selectedUser.id }),
        email: email,
        role: selectedRole,
        sendInvitation: true,
      };

      const newCollaborator = await eventService.addEventCollaborator(eventId, request);

      setCollaborators(prev => [newCollaborator, ...prev]);
      setShowAddModal(false);
      setSelectedUser(null);
      setInviteEmail('');
      setSearchQuery('');
      setSearchResults([]);
      Alert.alert('Success', 'Collaborator added successfully');
    } catch (err: any) {
      const message = err?.response?.data?.message || err?.message || 'Failed to add collaborator';
      Alert.alert('Error', message);
      ErrorHandler.handle(err, 'addEventCollaborator');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: EventUserType) => {
    try {
      const updated = await eventService.updateEventCollaborator(eventId, collaboratorId, {
        role: newRole,
      });
      setCollaborators(prev =>
        prev.map(c => (c.collaboratorId === collaboratorId ? updated : c))
      );
      setShowEditModal(false);
      setEditingCollaborator(null);
    } catch (err) {
      Alert.alert('Error', 'Failed to update collaborator role');
      ErrorHandler.handle(err, 'updateEventCollaborator');
    }
  };

  const handleRemove = async (collaboratorId: string, email: string) => {
    Alert.alert(
      'Remove Collaborator',
      `Are you sure you want to remove ${email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await eventService.removeEventCollaborator(eventId, collaboratorId);
              setCollaborators(prev => prev.filter(c => c.collaboratorId !== collaboratorId));
            } catch (err) {
              Alert.alert('Error', 'Failed to remove collaborator');
              ErrorHandler.handle(err, 'removeEventCollaborator');
            }
          },
        },
      ]
    );
  };

  const openEditModal = (collaborator: EventCollaboratorResponse) => {
    setEditingCollaborator(collaborator);
    setSelectedRole(collaborator.role);
    setShowEditModal(true);
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
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
          backgroundColor: colors.surface,
        }}
      >
        <TouchableOpacity onPress={onBack} style={{ padding: spacing.sm }}>
          <ChevronLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text
            style={{
              color: colors.text.primary,
              fontSize: typography.size.xl,
              fontWeight: typography.weight.bold,
            }}
          >
            Collaboration
          </Text>
          <Text
            style={{
              color: colors.text.secondary,
              fontSize: typography.size.xs,
              marginTop: 2,
            }}
          >
            {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          style={{
            padding: spacing.sm,
            borderRadius: borderRadius.md,
            backgroundColor: colors.brand.primary,
          }}
        >
          <Plus size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: spacing.xl }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.text.primary} />
        }
      >
        {error && (
          <View
            style={{
              backgroundColor: colors.error + '20',
              borderRadius: borderRadius.md,
              padding: spacing.md,
              marginBottom: spacing.lg,
            }}
          >
            <Text style={{ color: colors.error, fontSize: typography.size.sm }}>{error}</Text>
          </View>
        )}

        {collaborators.length === 0 && !loading ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing['4xl'] }}>
            <Users size={64} color={colors.text.secondary} />
            <Text
              style={{
                color: colors.text.primary,
                fontSize: typography.size.lg,
                fontWeight: typography.weight.bold,
                marginTop: spacing.lg,
              }}
            >
              No collaborators yet
            </Text>
            <Text
              style={{
                color: colors.text.secondary,
                fontSize: typography.size.base,
                marginTop: spacing.sm,
                textAlign: 'center',
              }}
            >
              Add collaborators to help manage your event
            </Text>
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              style={{
                marginTop: spacing.xl,
                paddingHorizontal: spacing.xl,
                paddingVertical: spacing.md,
                borderRadius: borderRadius.lg,
                backgroundColor: colors.brand.primary,
              }}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: typography.size.base,
                  fontWeight: typography.weight.bold,
                }}
              >
                Add Collaborator
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <CollaboratorsList
            collaborators={collaborators}
            onCollaboratorPress={openEditModal}
            onRemove={handleRemove}
            getInitials={getInitials}
            colors={colors}
            spacing={spacing}
            typography={typography}
            borderRadius={borderRadius}
          />
        )}
      </ScrollView>

      {/* Add Collaborator Modal */}
      <AddCollaboratorModal
        visible={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedUser(null);
          setInviteEmail('');
          setSearchQuery('');
          setSearchResults([]);
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchResults={searchResults}
        searching={searching}
        onSelectUser={handleSelectUser}
        onClearSelectedUser={handleClearSelectedUser}
        selectedUser={selectedUser}
        inviteEmail={inviteEmail}
        onInviteEmailChange={setInviteEmail}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onAdd={handleAddCollaborator}
        loading={loading}
        colors={colors}
        spacing={spacing}
        typography={typography}
        borderRadius={borderRadius}
        getInitials={getInitials}
      />

      {/* Edit Collaborator Modal */}
      <EditCollaboratorModal
        visible={showEditModal}
        collaborator={editingCollaborator}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onUpdate={(role) => editingCollaborator && handleUpdateRole(editingCollaborator.collaboratorId, role)}
        onClose={() => {
          setShowEditModal(false);
          setEditingCollaborator(null);
        }}
        colors={colors}
        spacing={spacing}
        typography={typography}
        borderRadius={borderRadius}
      />

      <LoadingOverlay visible={loading && !refreshing} message="Loading..." />
    </SafeAreaView>
  );
}
