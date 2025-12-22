import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Users, Plus } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { EventCollaboratorResponse } from '../../../../core/events/types/event';
import { EventUserType } from '../../../../core/events/types/event';
import { LoadingOverlay } from '../../../../common/components/LoadingStates';
import { useDebounce } from '../../../../common/hooks/useDebounce';
import { CollaboratorsList } from '../CollaboratorsList';
import { AddCollaboratorModal } from '../AddCollaboratorModal';
import { EditCollaboratorModal } from '../EditCollaboratorModal';
import { CollaborationUser } from '../types';

type Props = {
  eventId: string;
  onBack: () => void;
};

const buildMockCollaborators = (eventId: string): EventCollaboratorResponse[] => [
  {
    collaboratorId: 'collab-1',
    eventId,
    email: 'jamie.fox@capsule.app',
    userName: 'Jamie Fox',
    role: EventUserType.ORGANIZER,
    registrationStatus: 'CONFIRMED',
    invitedAt: '2024-01-05T10:00:00Z',
  },
  {
    collaboratorId: 'collab-2',
    eventId,
    email: 'sasha.lee@capsule.app',
    userName: 'Sasha Lee',
    role: EventUserType.COORDINATOR,
    registrationStatus: 'PENDING',
    invitedAt: '2024-01-10T12:30:00Z',
  },
  {
    collaboratorId: 'collab-3',
    eventId,
    email: 'brent.chen@capsule.app',
    userName: 'Brent Chen',
    role: EventUserType.STAFF,
    registrationStatus: 'CONFIRMED',
    invitedAt: '2024-01-12T09:15:00Z',
  },
];

const MOCK_DIRECTORY: CollaborationUser[] = [
  {
    id: 'user-1',
    name: 'Nina Perez',
    email: 'nina.perez@capsule.app',
    profileImageUrl: null,
  },
  {
    id: 'user-2',
    name: 'Liam Patel',
    email: 'liam.patel@capsule.app',
    profileImageUrl: null,
  },
  {
    id: 'user-3',
    name: 'Avery Blake',
    email: 'avery.blake@capsule.app',
    profileImageUrl: null,
  },
  {
    id: 'user-4',
    name: 'Morgan Reed',
    email: 'morgan.reed@capsule.app',
    profileImageUrl: null,
  },
];

export default function CollaborationScreen({ eventId, onBack }: Props) {
  const { colors, spacing, typography, borderRadius } = useTheme();
  const [collaborators, setCollaborators] = useState<EventCollaboratorResponse[]>(
    () => buildMockCollaborators(eventId),
  );
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CollaborationUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<CollaborationUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<EventUserType>(EventUserType.COORDINATOR);
  const [inviteEmail, setInviteEmail] = useState('');

  // Edit state
  const [editingCollaborator, setEditingCollaborator] = useState<EventCollaboratorResponse | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchCollaborators = useCallback(() => {
    if (!eventId) return;

    setLoading(true);
    setError(null);
    setCollaborators(buildMockCollaborators(eventId));
    setLoading(false);
  }, [eventId]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    fetchCollaborators();
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

  const searchUsers = (query: string) => {
    setSearching(true);
    const normalized = query.trim().toLowerCase();
    const existingCollaboratorEmails = new Set(
      collaborators.map(c => c.email.toLowerCase()),
    );
    const results = MOCK_DIRECTORY.filter(user => {
      const match =
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized);
      return match && !existingCollaboratorEmails.has(user.email.toLowerCase());
    });
    setSearchResults(results);
    setSearching(false);
  };

  const handleSelectUser = (user: CollaborationUser | null) => {
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

    setLoading(true);
    const newCollaborator: EventCollaboratorResponse = {
      collaboratorId: `collab-${Date.now()}`,
      eventId,
      email,
      userName: selectedUser?.name ?? undefined,
      role: selectedRole,
      registrationStatus: 'PENDING',
      invitedAt: new Date().toISOString(),
    };

    setCollaborators(prev => [newCollaborator, ...prev]);
    setShowAddModal(false);
    setSelectedUser(null);
    setInviteEmail('');
    setSearchQuery('');
    setSearchResults([]);
    setLoading(false);
    Alert.alert('Success', 'Collaborator added successfully');
  };

  const handleUpdateRole = async (collaboratorId: string, newRole: EventUserType) => {
    setCollaborators(prev =>
      prev.map(c =>
        c.collaboratorId === collaboratorId ? { ...c, role: newRole } : c,
      ),
    );
    setShowEditModal(false);
    setEditingCollaborator(null);
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
          onPress: () => {
            setCollaborators(prev => prev.filter(c => c.collaboratorId !== collaboratorId));
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
