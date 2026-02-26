import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Clock, Plus } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { eventService } from '../../../../core/events/services/event';
import {
  EventReminderResponse,
  EventReminderRequest,
} from '../../../../core/events/types/event';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import Button from '../../../../common/components/ui/Button';
import { CreateReminderModal } from '../components/CreateReminderModal';
import { ReminderItem } from '../components/ReminderItem';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

export function RemindersScreen() {
  const { t } = useI18n();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const permissions = useEventPermissions(params.userContext);
  const text = colors.text;

  const [reminders, setReminders] = useState<EventReminderResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const fetchReminders = useCallback(async (isRefresh = false) => {
    if (!eventId) return;

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await eventService.getReminders(eventId);
      setReminders(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      ErrorHandler.handle(err, 'getReminders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const onRefresh = useCallback(() => {
    fetchReminders(true);
  }, [fetchReminders]);

  const handleCreate = useCallback(
    async (request: EventReminderRequest) => {
      if (!eventId) return;

      try {
        await eventService.createReminder(eventId, request);
        await fetchReminders(true);
        setShowCreateModal(false);
      } catch (err) {
        ErrorHandler.handle(err, 'createReminder');
        throw err;
      }
    },
    [eventId, fetchReminders]
  );

  const handleDelete = useCallback(
    async (reminder: EventReminderResponse) => {
      if (!eventId) return;

      Alert.alert(
        t('DeleteReminder'),
        t('DeleteReminderConfirm', { title: reminder.title }),
        [
          { text: t('Cancel'), style: 'cancel' },
          {
            text: t('Delete'),
            style: 'destructive',
            onPress: async () => {
              try {
                await eventService.deleteReminder(eventId, reminder.reminderId);
                await fetchReminders(true);
              } catch (err) {
                ErrorHandler.handle(err, 'deleteReminder');
              }
            },
          },
        ]
      );
    },
    [eventId, t, fetchReminders]
  );

  const handleReminderPress = useCallback(
    async (reminder: EventReminderResponse) => {
      if (!eventId) return;

      try {
        await eventService.getReminder(eventId, reminder.reminderId);
        Alert.alert(
          reminder.title,
          reminder.description || t('NoDescription'),
          [{ text: t('OK') }]
        );
      } catch (err) {
        ErrorHandler.handle(err, 'getReminder');
      }
    },
    [eventId, t]
  );

  return (
    <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background" edges={['bottom']}>
      <ScreenHeader
        title={t('Reminders')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
        rightAction={
          permissions.canViewReminders
            ? {
                icon: Plus,
                onPress: () => setShowCreateModal(true),
                size: 32,
              }
            : undefined
        }
      />

      {loading && !refreshing ? (
        <LoadingOverlay visible={true} />
      ) : error ? (
        <View className="flex-1 items-center justify-center px-xl">
          <EmptyState
            icon={<Clock size={40} color={text.tertiary} />}
            title={t('FailedToLoadReminders')}
            subtitle={error.message}
          />
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={item => item.reminderId}
          renderItem={({ item }) => (
            <ReminderItem
              reminder={item}
              onDelete={permissions.canViewReminders ? () => handleDelete(item) : undefined}
              onPress={() => handleReminderPress(item)}
            />
          )}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: Math.max(insets.bottom, 20),
          }}
          ListEmptyComponent={
            <View className="py-3xl items-center">
              <Clock size={48} color={text.tertiary} strokeWidth={1.5} />
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                {t('NoRemindersYet')}
              </Text>
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary text-center mb-lg">
                {t('CreateRemindersToNotifyAttendees')}
              </Text>
              {permissions.canViewReminders && (
                <Button
                  variant="primary"
                  size="md"
                  onPress={() => setShowCreateModal(true)}
                  leftIcon={<Plus size={18} color={text.inverse} strokeWidth={2.2} />}
                >
                  {t('CreateReminder')}
                </Button>
              )}
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={text.primary}
            />
          }
        />
      )}

      {eventId && (
        <CreateReminderModal
          visible={showCreateModal}
          eventId={eventId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreate}
        />
      )}
    </SafeAreaView>
  );
}
