import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, View, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, UserPlus, Users } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import Button from '../../../../common/components/ui/Button';
import {
  CollaboratorInviteStatus,
  EventCollaboratorResponse,
  CollaboratorInviteResponse,
} from '../../../../core/collaboration/types/collaboration';
import { collaborationService } from '../../../../core/collaboration/services/collaboration';
import { InviteCollaboratorModal } from '../components/InviteCollaboratorModal';
import { EditCollaboratorModal } from '../components/EditCollaboratorModal';
import { AddCollaboratorModal } from '../components/AddCollaboratorModal';
import { SectionLabel, StatPill, CollaboratorRow, InviteRow } from '../components';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { useCollaborationData } from '../hooks';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

export function CollaborationManagementScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const refreshTint = colors.text.primary;

  const [refreshing, setRefreshing] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCollaborator, setEditingCollaborator] = useState<EventCollaboratorResponse | null>(null);

  const { collaborators, invites, loading, error, refresh } = useCollaborationData(eventId);

  const handleRemoveCollaborator = useCallback(
    async (collaborator: EventCollaboratorResponse) => {
      if (!eventId) return;

      Alert.alert(
        t('RemoveCollaborator'),
        t('RemoveCollaboratorConfirm', {
          name: collaborator.userName || collaborator.email || t('Collaborator'),
        }),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Remove'),
            style: 'destructive',
            onPress: async () => {
              try {
                await collaborationService.removeCollaborator(eventId, collaborator.collaboratorId);
                await refresh(true);
              } catch (err) {
                ErrorHandler.handle(err, 'removeCollaborator');
              }
            },
          },
        ],
      );
    },
    [eventId, t, refresh],
  );

  const handleEditCollaborator = useCallback((collaborator: EventCollaboratorResponse) => {
    setEditingCollaborator(collaborator);
  }, []);

  const handleRevokeInvite = useCallback(
    async (invite: CollaboratorInviteResponse) => {
      if (!eventId) return;

      Alert.alert(
        t('RevokeInvite'),
        t('RevokeInviteConfirm', { email: invite.inviteeEmail || t('Collaborator') }),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Revoke'),
            style: 'destructive',
            onPress: async () => {
              try {
                await collaborationService.revokeInvite(eventId, invite.inviteId);
                await refresh(true);
              } catch (err) {
                ErrorHandler.handle(err, 'revokeInvite');
              }
            },
          },
        ],
      );
    },
    [eventId, t, refresh],
  );

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await refresh(true);
    setRefreshing(false);
  }, [eventId, refresh]);

  const pendingInvites = useMemo(
    () => invites.filter(invite => invite.status === CollaboratorInviteStatus.PENDING),
    [invites],
  );

  const bottomGutter = useMemo(
    () => Math.max(16, Math.min(insets.bottom, 20)),
    [insets.bottom],
  );

  if (!eventId) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('EventNotFound')}
            subtitle={t('WeCouldNotDetermineEvent')}
            action={{ label: t('GoBack'), onPress: goBack }}
          />
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return <LoadingOverlay visible={true} message={t('LoadingCollaboration')} />;
  }

  if (error && collaborators.length === 0 && invites.length === 0) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('FailedToLoadCollaboration')}
            subtitle={error?.message || t('SomethingWentWrong')}
            action={{ label: t('TryAgain'), onPress: () => refresh(true) }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={t('Collaboration')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
        rightAction={
          permissions.canManageCollaborators
            ? {
                icon: UserPlus,
                onPress: () => setShowInviteModal(true),
                size: 32,
                variant: 'filled',
              }
            : undefined
        }
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={refreshTint}
            colors={[refreshTint]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="px-xl pt-xl" style={{ paddingBottom: bottomGutter }}>
          <View className="mb-2xl">
            <View className="mb-xl">
              <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary mb-sm">
                {t('Collaboration')}
              </Text>
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
                {t('CollaborationSubtitle')}
              </Text>
            </View>

            <View className="flex-row flex-wrap mb-xl gap-lg">
              <StatPill icon={Users} label={t('Collaborators')} value={collaborators.length} />
              <StatPill icon={Mail} label={t('PendingInvites')} value={pendingInvites.length} />
            </View>

            {permissions.canManageCollaborators && (
              <View className="flex-row items-center justify-between pt-lg border-t border-t-[0.5px] border-light-border-muted dark:border-dark-border-strong">
                <View className="flex-row gap-sm">
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => setShowInviteModal(true)}
                    leftIcon={<UserPlus size={16} color={colors.text.inverse} strokeWidth={2.4} />}
                  >
                    {t('InviteCollaborator')}
                  </Button>
                  <Button size="sm" variant="outline" onPress={() => setShowAddModal(true)}>
                    {t('AddDirectly')}
                  </Button>
                </View>
                {pendingInvites.length > 0 && (
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                    {pendingInvites.length} {t('PendingInvites')}
                  </Text>
                )}
              </View>
            )}
          </View>

          <View className="mb-2xl">
            <SectionLabel label={t('Collaborators')} />
            {collaborators.length === 0 ? (
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                {t('NoCollaboratorsYet')}
              </Text>
            ) : (
              <View>
                {collaborators.map((collaborator: EventCollaboratorResponse, index) => (
                  <CollaboratorRow
                    key={collaborator.collaboratorId}
                    collaborator={collaborator}
                    isLast={index === collaborators.length - 1}
                    onEdit={permissions.canManageCollaborators ? handleEditCollaborator : undefined}
                    onRemove={permissions.canManageCollaborators ? handleRemoveCollaborator : undefined}
                  />
                ))}
              </View>
            )}
          </View>

          <View className="mb-2xl">
            <SectionLabel label={t('Invites')} />
            {invites.length === 0 ? (
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                {t('NoInvitesYet')}
              </Text>
            ) : (
              <View>
                {invites.map((invite, index) => (
                  <InviteRow
                    key={invite.inviteId}
                    invite={invite}
                    isLast={index === invites.length - 1}
                    onRevoke={permissions.canManageCollaborators ? handleRevokeInvite : undefined}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <InviteCollaboratorModal
        visible={showInviteModal}
        eventId={eventId}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => refresh(true)}
      />

      <EditCollaboratorModal
        visible={!!editingCollaborator}
        eventId={eventId}
        collaborator={editingCollaborator}
        onClose={() => setEditingCollaborator(null)}
        onSuccess={() => refresh(true)}
      />

      <AddCollaboratorModal
        visible={showAddModal}
        eventId={eventId}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => refresh(true)}
      />
    </View>
  );
}
