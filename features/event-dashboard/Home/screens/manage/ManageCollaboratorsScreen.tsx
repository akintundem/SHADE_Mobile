import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, UserPlus, Users, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
type Collaborator = {
  collaboratorId: string;
  email: string;
  role: string;
  permissions?: string[];
  notes?: string;
};

const INITIAL_COLLABORATORS: Collaborator[] = [
  {
    collaboratorId: 'collab-1',
    email: 'jamie.fox@capsule.app',
    role: 'ORGANIZER',
    permissions: ['EDIT_EVENT', 'MANAGE_GUESTS'],
    notes: 'Lead organizer',
  },
  {
    collaboratorId: 'collab-2',
    email: 'sasha.lee@capsule.app',
    role: 'COORDINATOR',
    permissions: ['MANAGE_GUESTS'],
    notes: 'Guest experience',
  },
];

const ManageCollaboratorsScreen = () => {
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('COLLABORATOR');
  const [permissions, setPermissions] = useState('');
  const [notes, setNotes] = useState('');
  const [invite, setInvite] = useState(true);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    setCollaborators(INITIAL_COLLABORATORS);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleAdd = useCallback(async () => {
    if (!email) {
      Alert.alert('Missing email', 'Enter a collaborator email.');
      return;
    }
    setBusy(true);
    try {
      const result: Collaborator = {
        collaboratorId: `collab-${Date.now()}`,
        email,
        role,
        permissions: permissions
          .split(',')
          .map(item => item.trim())
          .filter(Boolean),
        notes: notes || undefined,
      };
      setCollaborators(current => [result, ...current]);
      setEmail('');
      setPermissions('');
      setNotes('');
      setMessage('');
      Alert.alert('Success', 'Collaborator added.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to add collaborator.');
    } finally {
      setBusy(false);
    }
  }, [email, invite, message, notes, permissions, role]);

  const handleRemove = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        setCollaborators(current => current.filter(item => item.collaboratorId !== id));
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to remove collaborator.');
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.md,
          borderBottomWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.lg,
              textTransform: 'uppercase',
            }}
          >
            Collaborators
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.lg,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>EMAIL</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="colleague@example.com"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="email-address"
            autoCapitalize="none"
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>ROLE</Text>
          <TextInput
            value={role}
            onChangeText={setRole}
            placeholder="COLLABORATOR"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="characters"
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>
            PERMISSIONS (OPTIONAL)
          </Text>
          <TextInput
            value={permissions}
            onChangeText={setPermissions}
            placeholder="EDIT_EVENT,MANAGE_GUESTS"
            placeholderTextColor={colors.text.tertiary}
            autoCapitalize="characters"
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>NOTES</Text>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Lead coordinator"
            placeholderTextColor={colors.text.tertiary}
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.sm,
              color: colors.text.primary,
            }}
          />
        </View>
        <View style={{ gap: spacing.sm }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>INVITATION MESSAGE</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Welcome aboard!"
            placeholderTextColor={colors.text.tertiary}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              color: colors.text.primary,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />
        </View>
        <TouchableOpacity
          onPress={() => setInvite(prev => !prev)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
        >
          <View
            style={{
              width: 18,
              height: 18,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: colors.text.primary,
              backgroundColor: invite ? colors.text.primary : colors.background,
            }}
          />
          <Text style={{ color: colors.text.primary }}>Send invitation email</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAdd}
          disabled={busy}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing.sm,
            paddingVertical: spacing.md,
            borderRadius: borderRadius.lg,
            borderWidth: 1,
            borderColor: colors.text.primary,
            backgroundColor: colors.text.primary,
          }}
        >
          <UserPlus size={18} color={colors.background} />
          <Text style={{ color: colors.background, fontWeight: typography.weight.semibold }}>
            Invite collaborator
          </Text>
        </TouchableOpacity>

        <View style={{ gap: spacing.md }}>
          {collaborators.map(collaborator => (
            <View
              key={collaborator.collaboratorId}
              style={{
                borderWidth: 1,
                borderColor: colors.text.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                gap: spacing.xs,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <Users size={20} color={colors.text.primary} />
                <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
                  {collaborator.email}
                </Text>
              </View>
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                Role: {collaborator.role}
              </Text>
              {collaborator.permissions?.length ? (
                <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                  Permissions: {collaborator.permissions.join(', ')}
                </Text>
              ) : null}
              {collaborator.notes ? (
                <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                  Notes: {collaborator.notes}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={() => handleRemove(collaborator.collaboratorId)}
                disabled={busy}
                style={{ marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
              >
                <Trash2 size={16} color={colors.error?.text ?? '#ef4444'} />
                <Text style={{ color: colors.error?.text ?? '#ef4444' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageCollaboratorsScreen;
