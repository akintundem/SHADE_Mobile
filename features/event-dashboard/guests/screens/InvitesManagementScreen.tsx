import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, Plus, RefreshCw, Send, Upload, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { attendeeService } from '../../../../core/attendee/services/attendee';
import { AttendeeInviteResponse, AttendeeInviteStatus } from '../../../../core/attendee/types/attendee';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { AddGuestModal } from '../components/AddGuestModal';
import { BulkInviteModal } from '../components/BulkInviteModal';
import { InviteGuestModal } from '../components/InviteGuestModal';
import { InviteDetailModal } from '../components/InviteDetailModal';
import Button from '../../../../common/components/ui/Button';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const StatusPill = ({ label, status }: { label: string; status: AttendeeInviteStatus }) => {
  const containerClassBase = 'px-sm py-[2px] rounded-full border';
  let containerClass = `${containerClassBase} bg-light-border dark:bg-dark-border border-light-border dark:border-dark-border`;
  let textClass = 'text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary';

  switch (status) {
    case AttendeeInviteStatus.ACCEPTED:
      containerClass = `${containerClassBase} bg-semantic-success-light dark:bg-semantic-success/20 border-semantic-success`;
      textClass = 'text-xs font-medium text-semantic-success';
      break;
    case AttendeeInviteStatus.DECLINED:
    case AttendeeInviteStatus.REVOKED:
      containerClass = `${containerClassBase} bg-semantic-error-light dark:bg-semantic-error/20 border-semantic-error`;
      textClass = 'text-xs font-medium text-semantic-error';
      break;
    case AttendeeInviteStatus.EXPIRED:
      break;
    default:
      break;
  }

  return (
    <View className={containerClass}>
      <Text className={textClass}>{label}</Text>
    </View>
  );
};

const InviteRow = ({
  invite,
  isLast,
  onRevoke,
  onResend,
  onPress,
}: {
  invite: AttendeeInviteResponse;
  isLast: boolean;
  onRevoke?: (invite: AttendeeInviteResponse) => void;
  onResend?: (invite: AttendeeInviteResponse) => void;
  onPress: (invite: AttendeeInviteResponse) => void;
}) => {
  const { t } = useI18n();
  const { colors } = useTheme();
  const canResend = onResend && (invite.status === AttendeeInviteStatus.ACCEPTED || invite.status === AttendeeInviteStatus.DECLINED);
  const canRevoke = onRevoke && invite.status !== AttendeeInviteStatus.REVOKED && invite.status !== AttendeeInviteStatus.EXPIRED;

  const statusLabels: Record<AttendeeInviteStatus, string> = {
    [AttendeeInviteStatus.ACCEPTED]: t('Accepted'),
    [AttendeeInviteStatus.DECLINED]: t('Declined'),
    [AttendeeInviteStatus.REVOKED]: t('Revoked'),
    [AttendeeInviteStatus.EXPIRED]: t('Expired'),
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(invite)}
      className="flex-row items-start py-lg"
    >
      <View className="w-10 h-10 items-center justify-center">
        <Mail size={18} color={colors.text.tertiary} strokeWidth={2.2} />
      </View>
      <View className="flex-1 ml-md">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
          {invite.inviteeEmail || t('Guest')}
        </Text>
        <View className="flex-row flex-wrap items-center mb-sm gap-sm">
          <StatusPill label={statusLabels[invite.status] || formatEnumLabel(invite.status)} status={invite.status} />
        </View>
        {invite.message && (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
            {invite.message}
          </Text>
        )}
      </View>
      <View className="flex-row items-center gap-sm">
        {canResend && (
          <TouchableOpacity
            onPress={() => onResend!(invite)}
            className="p-sm"
          >
            <RefreshCw size={16} color={colors.text.tertiary} strokeWidth={2} />
          </TouchableOpacity>
        )}
        {canRevoke && (
          <TouchableOpacity
            onPress={() => onRevoke!(invite)}
            className="p-sm"
          >
            <X size={16} color={colors.semantic.error} strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export function InvitesManagementScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const refreshTint = colors.text.primary;

  const [invites, setInvites] = useState<AttendeeInviteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [showInviteGuestModal, setShowInviteGuestModal] = useState(false);
  const [selectedInviteId, setSelectedInviteId] = useState<string | null>(null);

  const fetchInvites = useCallback(async (force = false) => {
    if (!eventId) return;
    if (loading && !force) return;

    setLoading(!force);
    setError(null);

    try {
      const response = await attendeeService.listInvites(eventId);
      setInvites(response.content || []);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorHandler.handle(err, 'listInvites');
    } finally {
      setLoading(false);
    }
  }, [eventId, loading]);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await fetchInvites(true);
    setRefreshing(false);
  }, [eventId, fetchInvites]);

  const handleRevoke = useCallback(
    async (invite: AttendeeInviteResponse) => {
      if (!eventId) return;

      Alert.alert(
        t('RevokeInvite'),
        t('RevokeInviteConfirm', { email: invite.inviteeEmail || t('Guest') }),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Revoke'),
            style: 'destructive',
            onPress: async () => {
              try {
                await attendeeService.revokeInvite(eventId, invite.inviteId);
                await fetchInvites(true);
              } catch (err) {
                ErrorHandler.handle(err, 'revokeInvite');
              }
            },
          },
        ]
      );
    },
    [eventId, t, fetchInvites]
  );

  const handleResend = useCallback(
    async (invite: AttendeeInviteResponse) => {
      if (!eventId) return;

      Alert.alert(
        t('ResendInvite'),
        t('ResendInviteConfirm', { email: invite.inviteeEmail || t('Guest') }),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Resend'),
            onPress: async () => {
              try {
                await attendeeService.resendInvite(eventId, invite.inviteId, { sendEmail: true });
                await fetchInvites(true);
              } catch (err) {
                ErrorHandler.handle(err, 'resendInvite');
              }
            },
          },
        ]
      );
    },
    [eventId, t, fetchInvites]
  );

  const activeInvites = useMemo(
    () => invites.filter(invite => invite.status === AttendeeInviteStatus.ACCEPTED),
    [invites]
  );

  const bottomGutter = useMemo(
    () => Math.max(16, Math.min(insets.bottom, 20)),
    [insets.bottom]
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
    return <LoadingOverlay visible={true} message={t('LoadingInvites')} />;
  }

  if (error && invites.length === 0) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('FailedToLoadInvites')}
            subtitle={error?.message || t('SomethingWentWrong')}
            action={{ label: t('TryAgain'), onPress: () => fetchInvites(true) }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={t('Invitations')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
        rightAction={
          permissions.canManageCollaborators
            ? { icon: Plus, onPress: () => setShowAddGuestModal(true), size: 32, variant: 'filled' }
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
                {t('Invitations')}
              </Text>
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
                {t('ManageEventInvitations')}
              </Text>
            </View>

            <View className="flex-row items-center justify-between pt-lg border-t border-t-[0.5px] border-light-border-muted dark:border-dark-border-strong">
              {permissions.canManageCollaborators && (
                <View className="flex-row gap-sm flex-wrap">
                  <Button
                    size="sm"
                    variant="primary"
                    onPress={() => setShowAddGuestModal(true)}
                    leftIcon={<Plus size={16} color={colors.text.inverse} strokeWidth={2.4} />}
                  >
                    {t('AddGuest')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => setShowInviteGuestModal(true)}
                    leftIcon={<Send size={16} strokeWidth={2.4} />}
                  >
                    {t('SendInvite')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => setShowBulkInviteModal(true)}
                    leftIcon={<Upload size={16} strokeWidth={2.4} />}
                  >
                    {t('BulkInvite')}
                  </Button>
                </View>
              )}
              {activeInvites.length > 0 && (
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                  {activeInvites.length} {t('ActiveInvites')}
                </Text>
              )}
            </View>
          </View>

          <View className="mb-2xl">
            <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
              {t('Invites')}
            </Text>
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
                    onRevoke={permissions.canManageCollaborators ? handleRevoke : undefined}
                    onResend={permissions.canManageCollaborators ? handleResend : undefined}
                    onPress={(inv) => setSelectedInviteId(inv.inviteId)}
                  />
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {eventId && (
        <>
          <AddGuestModal
            visible={showAddGuestModal}
            eventId={eventId}
            onClose={() => setShowAddGuestModal(false)}
            onSuccess={() => fetchInvites(true)}
          />
          <BulkInviteModal
            visible={showBulkInviteModal}
            eventId={eventId}
            onClose={() => setShowBulkInviteModal(false)}
            onSuccess={() => fetchInvites(true)}
          />
          <InviteGuestModal
            visible={showInviteGuestModal}
            eventId={eventId}
            onClose={() => setShowInviteGuestModal(false)}
            onSuccess={() => fetchInvites(true)}
          />
          <InviteDetailModal
            visible={!!selectedInviteId}
            eventId={eventId}
            inviteId={selectedInviteId}
            onClose={() => setSelectedInviteId(null)}
          />
        </>
      )}
    </View>
  );
}
