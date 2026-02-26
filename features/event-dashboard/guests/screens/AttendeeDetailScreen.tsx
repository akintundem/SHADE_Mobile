import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Mail, MoreVertical, Ticket } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { attendeeService } from '../../../../core/attendee/services/attendee';
import { AttendeeResponse, AttendeeStatus } from '../../../../core/attendee/types/attendee';
import { TicketResponse } from '../../../../core/tickets/types/ticket';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; attendeeId?: string; userContext?: UserEventContext | null };

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

const getInitials = (value?: string | null) => {
  if (!value) return '?';
  const trimmed = value.trim();
  if (!trimmed) return '?';
  if (trimmed.includes('@')) return trimmed[0]?.toUpperCase() || '?';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  const initials = parts
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() || '')
    .join('');
  if (initials) return initials;
  return trimmed.slice(0, 2).toUpperCase();
};

export function AttendeeDetailScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const attendeeId = params.attendeeId ?? null;
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const refreshTint = colors.text.primary;

  const [attendee, setAttendee] = useState<AttendeeResponse | null>(null);
  const [tickets, setTickets] = useState<TicketResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchAttendee = useCallback(async () => {
    if (!attendeeId) return;

    try {
      const data = await attendeeService.getAttendee(attendeeId);
      setAttendee(data);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorHandler.handle(err, 'getAttendee');
    }
  }, [attendeeId]);

  const fetchTickets = useCallback(async () => {
    if (!attendeeId) return;

    try {
      const data = await attendeeService.getTicketsByAttendee(attendeeId, eventId ? { eventId } : undefined);
      setTickets(data);
    } catch (err) {
      ErrorHandler.handle(err, 'getTicketsByAttendee');
    }
  }, [attendeeId, eventId]);

  const loadData = useCallback(async () => {
    if (!attendeeId) return;
    setLoading(true);
    await Promise.all([fetchAttendee(), fetchTickets()]);
    setLoading(false);
  }, [attendeeId, fetchAttendee, fetchTickets]);

  const onRefresh = useCallback(async () => {
    if (!attendeeId) return;
    setRefreshing(true);
    await Promise.all([fetchAttendee(), fetchTickets()]);
    setRefreshing(false);
  }, [attendeeId, fetchAttendee, fetchTickets]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = useCallback(() => {
    if (!attendeeId || !attendee) return;

    Alert.alert(
      t('DeleteAttendee'),
      t('DeleteAttendeeConfirm', { name: attendee.name || attendee.email || t('Guest') }),
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await attendeeService.deleteAttendee(attendeeId);
              goBack();
            } catch (err) {
              ErrorHandler.handle(err, 'deleteAttendee');
            }
          },
        },
      ]
    );
  }, [attendeeId, attendee, t, goBack]);

  const bottomGutter = useMemo(
    () => Math.max(16, Math.min(insets.bottom, 20)),
    [insets.bottom]
  );

  if (!attendeeId) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('AttendeeNotFound')}
            subtitle={t('WeCouldNotDetermineAttendee')}
            action={{ label: t('GoBack'), onPress: goBack }}
          />
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return <LoadingOverlay visible={true} message={t('LoadingAttendee')} />;
  }

  if (error && !attendee) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('FailedToLoadAttendee')}
            subtitle={error?.message || t('SomethingWentWrong')}
            action={{ label: t('TryAgain'), onPress: loadData }}
          />
        </View>
      </View>
    );
  }

  if (!attendee) {
    return null;
  }

  const initials = getInitials(attendee.name || attendee.email);
  const statusLabels: Record<AttendeeStatus, string> = {
    [AttendeeStatus.PENDING]: t('Pending'),
    [AttendeeStatus.CONFIRMED]: t('Confirmed'),
    [AttendeeStatus.DECLINED]: t('Declined'),
    [AttendeeStatus.TENTATIVE]: t('Tentative'),
    [AttendeeStatus.NO_SHOW]: t('NoShow'),
  };

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={attendee.name || t('Guest')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
        rightAction={
          permissions.canManageCollaborators
            ? {
                icon: MoreVertical,
                onPress: () => {
                  Alert.alert(
                    t('AttendeeActions'),
                    t('ChooseAction'),
                    [
                      { text: t('Delete'), style: 'destructive', onPress: handleDelete },
                      { text: t('Cancel'), style: 'cancel' },
                    ]
                  );
                },
                size: 32,
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
          {/* Attendee Info */}
          <View className="mb-2xl">
            <View className="items-center mb-xl">
              <View className="w-20 h-20 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong mb-md">
                <Text className="text-2xl font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {initials}
                </Text>
              </View>
              <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary">
                {attendee.name || t('Guest')}
              </Text>
              {attendee.email && (
                <View className="flex-row items-center gap-sm mt-sm">
                  <Mail size={14} color={colors.text.tertiary} strokeWidth={2} />
                  <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                    {attendee.email}
                  </Text>
                </View>
              )}
            </View>

            <View className="rounded-xl border p-xl bg-light-surface-subtle dark:bg-dark-surface-muted border-light-border-subtle dark:border-dark-border-subtle">
              <View className="mb-md">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('RSVPStatus')}
                </Text>
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                  {attendee.rsvpStatus
                    ? statusLabels[attendee.rsvpStatus] || formatEnumLabel(attendee.rsvpStatus)
                    : t('NoRSVP')}
                </Text>
              </View>

              {attendee.isCheckedIn && (
                <View className="mb-md">
                  <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                    {t('CheckInStatus')}
                  </Text>
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {t('CheckedIn')}
                  </Text>
                </View>
              )}

              {attendee.userId && (
                <View>
                  <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                    {t('UserAccount')}
                  </Text>
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {t('LinkedToAccount')}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Tickets Section */}
          <View className="mb-2xl">
            <View className="flex-row items-center justify-between mb-lg">
              <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary">
                {t('Tickets')}
              </Text>
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                {tickets.length} {t('Total')}
              </Text>
            </View>

            {tickets.length === 0 ? (
              <View className="py-xl items-center">
                <Ticket size={32} color={colors.text.tertiary} strokeWidth={1.5} />
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                  {t('NoTickets')}
                </Text>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center">
                  {t('NoTicketsForAttendee')}
                </Text>
              </View>
            ) : (
              <View className="rounded-xl border bg-light-surface-subtle dark:bg-dark-surface-muted border-light-border-subtle dark:border-dark-border-subtle">
                {tickets.map((ticket, index) => (
                  <View
                    key={ticket.id}
                    className="px-xl py-md"
                  >
                    <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                      {ticket.ticketType?.name || t('Ticket')}
                    </Text>
                    {ticket.status && (
                      <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                        {formatEnumLabel(ticket.status)}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
