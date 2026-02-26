import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle,
  ChevronLeft,
  Clock,
  HelpCircle,
  Mail,
  Plus,
  Search,
  Send,
  UserCheck,
  Users,
  UserX,
  X,
  XCircle,
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { AttendeeResponse, AttendeeStatus } from '../../../../core/attendee/types/attendee';
import { AddGuestModal } from '../components/AddGuestModal';
import { VisibilityLevel } from '../../../../core/auth/types/auth';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { useAttendeesData } from '../hooks';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../../../../navigation/types';
import Button from '../../../../common/components/ui/Button';
import { BulkRsvpUpdateModal } from '../components/BulkRsvpUpdateModal';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

type IconType = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

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

const SectionLabel = ({ label }: { label: string }) => (
  <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
    {label}
  </Text>
);

const StatPill = ({ icon: Icon, label, value }: { icon: IconType; label: string; value: number }) => {
  const { colors } = useTheme();

  return (
    <View className="flex-1 min-w-[90px] py-md">
      <View className="flex-row items-center mb-xs gap-sm">
        <Icon size={14} color={colors.text.tertiary} strokeWidth={2.2} />
        <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary">
          {label}
        </Text>
      </View>
      <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary tracking-tight">
        {value}
      </Text>
    </View>
  );
};

const StatusPill = ({ label, status }: { label: string; status: AttendeeStatus }) => {
  const containerClassBase = 'px-sm py-[2px] rounded-full border';
  let containerClass = `${containerClassBase} bg-light-border dark:bg-dark-border border-light-border dark:border-dark-border`;
  let textClass = 'text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary';

  if (status === AttendeeStatus.CONFIRMED) {
    containerClass = `${containerClassBase} bg-semantic-success-light dark:bg-semantic-success/20 border-semantic-success`;
    textClass = 'text-xs font-medium text-semantic-success';
  } else if (status === AttendeeStatus.PENDING) {
    containerClass = `${containerClassBase} bg-semantic-warning-light dark:bg-semantic-warning/20 border-semantic-warning`;
    textClass = 'text-xs font-medium text-semantic-warning';
  } else if (status === AttendeeStatus.DECLINED || status === AttendeeStatus.NO_SHOW) {
    containerClass = `${containerClassBase} bg-semantic-error-light dark:bg-semantic-error/20 border-semantic-error`;
    textClass = 'text-xs font-medium text-semantic-error';
  } else if (status === AttendeeStatus.TENTATIVE) {
    containerClass = `${containerClassBase} bg-semantic-warning-light dark:bg-semantic-warning/20 border-semantic-warning`;
    textClass = 'text-xs font-medium text-semantic-warning';
  }

  return (
    <View className={containerClass}>
      <Text className={textClass}>{label}</Text>
    </View>
  );
};

const GuestRow = ({ 
  attendee, 
  isLast,
  onPress,
  isSelected,
  onToggleSelect,
}: { 
  attendee: AttendeeResponse; 
  isLast: boolean;
  onPress?: (attendee: AttendeeResponse) => void;
  isSelected?: boolean;
  onToggleSelect?: (attendee: AttendeeResponse) => void;
}) => {
  const { t } = useI18n();
  const { colors } = useTheme();
  const initials = getInitials(attendee.name || attendee.email);

  const statusLabels: Record<AttendeeStatus, string> = {
    [AttendeeStatus.PENDING]: t('Pending'),
    [AttendeeStatus.CONFIRMED]: t('Confirmed'),
    [AttendeeStatus.DECLINED]: t('Declined'),
    [AttendeeStatus.TENTATIVE]: t('Tentative'),
    [AttendeeStatus.NO_SHOW]: t('NoShow'),
  };

  const visibilityLabel = attendee.participationVisibility
    ? t(
        attendee.participationVisibility === VisibilityLevel.PUBLIC
          ? 'Public'
          : attendee.participationVisibility === VisibilityLevel.PRIVATE
          ? 'Private'
          : 'FriendsOnly'
      )
    : null;

  const RowComponent = onPress ? TouchableOpacity : View;

  return (
    <RowComponent
      onPress={onPress ? () => onPress(attendee) : undefined}
      onLongPress={onToggleSelect ? () => onToggleSelect(attendee) : undefined}
      activeOpacity={onPress ? 0.7 : 1}
      className={`flex-row items-center py-lg ${
        isSelected ? 'bg-blue-500/5 dark:bg-blue-400/10' : ''
      }`}
    >
      {onToggleSelect && (
        <TouchableOpacity
          onPress={() => onToggleSelect(attendee)}
          className="mr-md"
        >
          <View
            className={`w-5 h-5 rounded border items-center justify-center ${
              isSelected
                ? 'bg-blue-600 dark:bg-blue-300 border-blue-600 dark:border-blue-300'
                : 'bg-transparent border-light-border-emphasis dark:border-dark-border-emphasis'
            }`}
          >
            {isSelected && (
              <CheckCircle size={12} color={colors.text.inverse} strokeWidth={2.5} />
            )}
          </View>
        </TouchableOpacity>
      )}
      <View className="w-10 h-10 rounded-full items-center justify-center">
        <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
          {initials}
        </Text>
      </View>
      <View className="flex-1 ml-md">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
          {attendee.name || t('Guest')}
        </Text>
        {attendee.email && (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
            {attendee.email}
          </Text>
        )}
        {visibilityLabel && (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
            {t('ParticipationVisibilityShort')}: {visibilityLabel}
          </Text>
        )}
      </View>
      <View className="flex-row items-center gap-sm">
        {attendee.isCheckedIn && (
          <CheckCircle size={14} color={colors.semantic.success} strokeWidth={2.2} />
        )}
        {attendee.rsvpStatus && (
          <StatusPill
            label={statusLabels[attendee.rsvpStatus] || formatEnumLabel(attendee.rsvpStatus)}
            status={attendee.rsvpStatus}
          />
        )}
      </View>
    </RowComponent>
  );
};

export function RSVPManagementScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const navigation = useNavigation<RootStackNavigationProp>();
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const refreshTint = colors.text.primary;

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddGuestModal, setShowAddGuestModal] = useState(false);
  const [selectedAttendees, setSelectedAttendees] = useState<AttendeeResponse[]>([]);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);

  const { attendees, totalAttendees, loading, error, refresh } = useAttendeesData(eventId);

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await refresh(true);
    setRefreshing(false);
  }, [eventId, refresh]);

  const confirmedCount = useMemo(
    () => attendees.filter(a => a.rsvpStatus === AttendeeStatus.CONFIRMED).length,
    [attendees]
  );

  const pendingCount = useMemo(
    () => attendees.filter(a => a.rsvpStatus === AttendeeStatus.PENDING).length,
    [attendees]
  );

  const checkedInCount = useMemo(
    () => attendees.filter(a => a.isCheckedIn).length,
    [attendees]
  );

  const filteredAttendees = useMemo(() => {
    if (!searchQuery.trim()) return attendees;
    const query = searchQuery.toLowerCase();
    return attendees.filter(
      a => a.name?.toLowerCase().includes(query) || a.email?.toLowerCase().includes(query)
    );
  }, [attendees, searchQuery]);

  const handleToggleSelect = useCallback((attendee: AttendeeResponse) => {
    setSelectedAttendees(prev => {
      const isSelected = prev.some(a => a.id === attendee.id);
      if (isSelected) {
        return prev.filter(a => a.id !== attendee.id);
      } else {
        return [...prev, attendee];
      }
    });
  }, []);

  const handleBulkUpdateSuccess = useCallback(() => {
    setSelectedAttendees([]);
    setSelectionMode(false);
    refresh(true);
  }, [refresh]);

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
    return <LoadingOverlay visible={true} message={t('LoadingGuests')} />;
  }

  if (error && attendees.length === 0) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('FailedToLoadGuests')}
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
        title={selectionMode ? t('SelectAttendees') : t('GuestList')}
        leftAction={{
          icon: ChevronLeft,
          onPress: selectionMode ? () => {
            setSelectionMode(false);
            setSelectedAttendees([]);
          } : goBack,
          size: 32,
        }}
        rightAction={
          selectionMode
            ? selectedAttendees.length > 0
              ? {
                  icon: Send,
                  onPress: () => setShowBulkUpdateModal(true),
                  size: 32,
                  variant: 'filled',
                }
              : undefined
            : permissions.canManageCollaborators
            ? {
                icon: Mail,
                onPress: () => navigation.navigate('InvitesManagement', { eventId, userContext: params.userContext ?? null }),
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
          <View className="mb-2xl">
            <View className="mb-xl">
              <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary mb-sm">
                {t('GuestList')}
              </Text>
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
                {t('GuestListSubtitle')}
              </Text>
            </View>

            <View className="flex-row flex-wrap mb-xl gap-md">
              <StatPill icon={Users} label={t('Total')} value={totalAttendees} />
              <StatPill icon={UserCheck} label={t('Confirmed')} value={confirmedCount} />
              <StatPill icon={Clock} label={t('Pending')} value={pendingCount} />
              <StatPill icon={CheckCircle} label={t('CheckedIn')} value={checkedInCount} />
            </View>

            <View className="flex-row items-center rounded-lg border px-md py-sm bg-light-surface-soft dark:bg-dark-surface-soft border-light-border-strong dark:border-dark-border-strong">
              <Search size={16} color={colors.text.tertiary} strokeWidth={2.2} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('SearchGuestsByNameOrEmail')}
                placeholderTextColor={colors.text.tertiary}
                className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                </TouchableOpacity>
              )}
            </View>

            {permissions.canViewRSVP && (
            <View className="flex-row items-center justify-between pt-lg border-t border-t-[0.5px] border-light-border-muted dark:border-dark-border-strong mt-lg">
              <View className="flex-row gap-sm">
                <Button
                  size="sm"
                  variant="primary"
                  onPress={() => setShowAddGuestModal(true)}
                  leftIcon={<Plus size={16} color={colors.text.inverse} strokeWidth={2.4} />}
                >
                  {t('AddGuest')}
                </Button>
                {!selectionMode && (
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => setSelectionMode(true)}
                    leftIcon={<Send size={16} strokeWidth={2.4} />}
                  >
                    {t('BulkUpdate')}
                  </Button>
                )}
              </View>
              {selectionMode && selectedAttendees.length > 0 && (
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                  {selectedAttendees.length} {t('Selected')}
                </Text>
              )}
            </View>
            )}
          </View>

          <View className="mb-2xl">
            <SectionLabel label={t('Guests')} />
            {filteredAttendees.length === 0 ? (
              <View className="py-2xl items-center">
                <Users size={32} color={colors.text.tertiary} strokeWidth={1.5} />
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                  {searchQuery ? t('NoGuestsMatchSearch') : t('NoGuestsYet')}
                </Text>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center leading-relaxed">
                  {searchQuery ? t('TryDifferentSearch') : t('AddYourFirstGuest')}
                </Text>
              </View>
            ) : (
              <View>
                {filteredAttendees.map((attendee, index) => (
                  <GuestRow
                    key={attendee.id}
                    attendee={attendee}
                    isLast={index === filteredAttendees.length - 1}
                    onPress={selectionMode ? undefined : (a) => navigation.navigate('AttendeeDetail', { eventId, attendeeId: a.id, userContext: params.userContext ?? null })}
                    isSelected={selectedAttendees.some(a => a.id === attendee.id)}
                    onToggleSelect={selectionMode ? handleToggleSelect : undefined}
                  />
                ))}
              </View>
            )}
          </View>

          {attendees.length > 0 && (
            <View className="rounded-xl border p-xl bg-light-surface-subtle dark:bg-dark-surface-muted border-light-border-subtle dark:border-dark-border-subtle">
              <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
                {t('RSVPSummary')}
              </Text>
              <View className="flex-row flex-wrap gap-lg">
                <View className="flex-row items-center gap-sm">
                  <CheckCircle size={14} color={colors.semantic.success} strokeWidth={2.2} />
                  <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                    {confirmedCount} {t('Confirmed')}
                  </Text>
                </View>
                <View className="flex-row items-center gap-sm">
                  <Clock size={14} color={colors.semantic.warning} strokeWidth={2.2} />
                  <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                    {pendingCount} {t('Pending')}
                  </Text>
                </View>
                <View className="flex-row items-center gap-sm">
                  <XCircle size={14} color={colors.semantic.error} strokeWidth={2.2} />
                  <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                    {attendees.filter(a => a.rsvpStatus === AttendeeStatus.DECLINED).length} {t('Declined')}
                  </Text>
                </View>
                <View className="flex-row items-center gap-sm">
                  <HelpCircle size={14} color={colors.text.tertiary} strokeWidth={2.2} />
                  <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                    {attendees.filter(a => a.rsvpStatus === AttendeeStatus.TENTATIVE).length} {t('Tentative')}
                  </Text>
                </View>
                <View className="flex-row items-center gap-sm">
                  <UserX size={14} color={colors.semantic.error} strokeWidth={2.2} />
                  <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                    {attendees.filter(a => a.rsvpStatus === AttendeeStatus.NO_SHOW).length} {t('NoShow')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {eventId && (
        <>
          <AddGuestModal
            visible={showAddGuestModal}
            eventId={eventId}
            onClose={() => setShowAddGuestModal(false)}
            onSuccess={() => refresh(true)}
          />
          <BulkRsvpUpdateModal
            visible={showBulkUpdateModal}
            eventId={eventId}
            selectedAttendees={selectedAttendees}
            onClose={() => setShowBulkUpdateModal(false)}
            onSuccess={handleBulkUpdateSuccess}
          />
        </>
      )}
    </View>
  );
}
