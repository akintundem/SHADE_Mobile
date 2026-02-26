import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Clock, Search } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { TicketWaitlistEntryResponse } from '../../../../core/tickets/types/ticket';
import { ticketService } from '../../../../core/tickets/services/ticket';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { ConfirmModal } from '../../../../common/components/ui/ConfirmModal';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { TicketWaitlistEntryRow } from '../components/TicketWaitlistEntryRow';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

export function TicketWaitlistScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const refreshTint = colors.text.primary;

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [entries, setEntries] = useState<TicketWaitlistEntryResponse[]>([]);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showFulfillConfirm, setShowFulfillConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadEntries = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ticketService.listWaitlist(eventId);
      setEntries(data.content || []);
    } catch (err) {
      setError(err as Error);
      ErrorHandler.handle(err, 'listWaitlist');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  }, [eventId, loadEntries]);

  const handleFulfill = useCallback(async () => {
    if (!selectedEntryId || !eventId) return;
    setIsProcessing(true);
    setShowFulfillConfirm(false);
    try {
      await ticketService.fulfillWaitlistEntry(eventId, selectedEntryId);
      await loadEntries();
    } catch (err) {
      ErrorHandler.handle(err, 'fulfillWaitlistEntry');
    } finally {
      setIsProcessing(false);
      setSelectedEntryId(null);
    }
  }, [selectedEntryId, eventId, loadEntries]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(
      entry =>
        entry.requesterName?.toLowerCase().includes(query) ||
        entry.requesterEmail?.toLowerCase().includes(query) ||
        entry.ticketTypeName?.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

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
    return <LoadingOverlay visible={true} message={t('LoadingWaitlist')} />;
  }

  if (error && entries.length === 0) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('FailedToLoadWaitlist')}
            subtitle={error?.message || t('SomethingWentWrong')}
            action={{ label: t('TryAgain'), onPress: () => loadEntries() }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={t('TicketWaitlist')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
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
            <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary mb-sm">
              {t('TicketWaitlist')}
            </Text>
            <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
              {t('TicketWaitlistDescription')}
            </Text>
          </View>

          <View className="flex-row items-center rounded-lg border px-md py-sm bg-light-surface-soft dark:bg-dark-surface-soft border-light-border-strong dark:border-dark-border-strong mb-xl">
            <Search size={16} color={colors.text.tertiary} strokeWidth={2.2} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('SearchWaitlist')}
              placeholderTextColor={colors.text.tertiary}
              className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary"
            />
          </View>

          {filteredEntries.length === 0 ? (
            <View className="py-2xl items-center">
              <Clock size={32} color={colors.text.tertiary} strokeWidth={1.5} />
              <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                {searchQuery ? t('NoWaitlistEntriesMatchSearch') : t('NoWaitlistEntries')}
              </Text>
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center">
                {searchQuery ? t('TryDifferentSearch') : t('WaitlistEntriesWillAppearHere')}
              </Text>
            </View>
          ) : (
            <View>
              {filteredEntries.map(entry => (
                <TicketWaitlistEntryRow
                  key={entry.id}
                  entry={entry}
                  onFulfill={permissions.canEditTickets ? (id) => {
                    setSelectedEntryId(id);
                    setShowFulfillConfirm(true);
                  } : undefined}
                />
              ))}

            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showFulfillConfirm}
        title={t('FulfillWaitlistEntry')}
        message={t('FulfillWaitlistEntryConfirm')}
        confirmLabel={t('Fulfill')}
        cancelLabel={t('Cancel')}
        variant="success"
        isLoading={isProcessing}
        onConfirm={handleFulfill}
        onCancel={() => {
          setShowFulfillConfirm(false);
          setSelectedEntryId(null);
        }}
      />
    </View>
  );
}
