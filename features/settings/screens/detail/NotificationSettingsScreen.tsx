import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, TextInput } from 'react-native';
import { ArrowLeft, Bell, Mail, MessageSquare, Users, Calendar, Clock, CheckCircle } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { SettingsSection, SettingsRow } from '../../components';
import CustomSwitch from '../../../../common/components/ui/CustomSwitch';
import { useSettings } from '../../context';
import type { NotificationSettingsUpdateRequest } from '../../../../core/auth/types/auth';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  onBack?: () => void;
};

export default function NotificationSettingsScreen({ onBack }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const { settings, updateNotifications, updateSecurity, isUpdating } = useSettings();

  const reminderTimingValue = useMemo(() => {
    if (settings?.reminderTimingMinutes === null || settings?.reminderTimingMinutes === undefined) {
      return '30';
    }
    return String(settings.reminderTimingMinutes);
  }, [settings?.reminderTimingMinutes]);

  const [reminderTiming, setReminderTiming] = useState(reminderTimingValue);

  useEffect(() => {
    setReminderTiming(reminderTimingValue);
  }, [reminderTimingValue]);

  const handleToggle = useCallback(
    async (key: keyof NotificationSettingsUpdateRequest, value: boolean) => {
      await updateNotifications({ [key]: value });
    },
    [updateNotifications]
  );

  const handleReminderTimingChange = useCallback(async () => {
    const minutes = parseInt(reminderTiming, 10);
    if (Number.isNaN(minutes) || minutes < 1) {
      setReminderTiming(reminderTimingValue);
      return;
    }
    const ok = await updateNotifications({ reminderTimingMinutes: minutes });
    if (!ok) {
      setReminderTiming(reminderTimingValue);
    }
  }, [reminderTiming, reminderTimingValue, updateNotifications]);

  const handleAutoAcceptChange = useCallback(async (value: boolean) => {
    await updateSecurity({ autoAcceptInvitations: value });
  }, [updateSecurity]);

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <View className="flex-row items-center justify-between px-xl py-md">
        <TouchableOpacity onPress={onBack} className="p-xs">
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
          {t('Notifications')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="pb-5">
        <SettingsSection title={t('NotificationChannels')} />
        <SettingsRow
          icon={Mail}
          title={t('EmailNotifications')}
          subtitle={t('ReceiveNotificationsViaEmail')}
          end={
            <CustomSwitch
              value={settings?.emailNotificationsEnabled ?? true}
              onValueChange={(v) => handleToggle('emailNotificationsEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={Bell}
          title={t('PushNotifications')}
          subtitle={t('ReceivePushNotificationsOnDevice')}
          end={
            <CustomSwitch
              value={settings?.pushNotificationsEnabled ?? true}
              onValueChange={(v) => handleToggle('pushNotificationsEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={MessageSquare}
          title={t('SMSNotifications')}
          subtitle={t('ReceiveNotificationsViaSMS')}
          end={
            <CustomSwitch
              value={settings?.smsNotificationsEnabled ?? false}
              onValueChange={(v) => handleToggle('smsNotificationsEnabled', v)}
              disabled={isUpdating}
            />
          }
        />

        <SettingsSection title={t('EventNotifications')} />
        <SettingsRow
          icon={Calendar}
          title={t('EventInvitations')}
          subtitle={t('GetNotifiedAboutNewInvitations')}
          end={
            <CustomSwitch
              value={settings?.eventInvitationsEnabled ?? true}
              onValueChange={(v) => handleToggle('eventInvitationsEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={Bell}
          title={t('EventUpdates')}
          subtitle={t('GetNotifiedAboutEventChanges')}
          end={
            <CustomSwitch
              value={settings?.eventUpdatesEnabled ?? true}
              onValueChange={(v) => handleToggle('eventUpdatesEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={Clock}
          title={t('EventReminders')}
          subtitle={t('GetRemindersBeforeEvents')}
          end={
            <CustomSwitch
              value={settings?.eventRemindersEnabled ?? true}
              onValueChange={(v) => handleToggle('eventRemindersEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={Clock}
          title={t('ReminderTiming')}
          subtitle={t('ReminderTimingDescription')}
          end={
            <View className="flex-row items-center gap-xs">
              <TextInput
                value={reminderTiming}
                onChangeText={(text) => setReminderTiming(text.replace(/[^0-9]/g, ''))}
                onBlur={handleReminderTimingChange}
                keyboardType="number-pad"
                className="w-16 px-sm py-xs border rounded-md text-center text-sm text-txt-primary dark:text-txt-dark-primary"
                style={{ borderColor: colors.borderLight }}
                editable={!isUpdating}
              />
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                {t('Minutes')}
              </Text>
            </View>
          }
        />

        <SettingsSection title={t('SocialNotifications')} />
        <SettingsRow
          icon={CheckCircle}
          title={t('RSVPNotifications')}
          subtitle={t('GetNotifiedAboutRSVPs')}
          end={
            <CustomSwitch
              value={settings?.rsvpNotificationsEnabled ?? true}
              onValueChange={(v) => handleToggle('rsvpNotificationsEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={MessageSquare}
          title={t('CommentNotifications')}
          subtitle={t('GetNotifiedAboutComments')}
          end={
            <CustomSwitch
              value={settings?.commentNotificationsEnabled ?? true}
              onValueChange={(v) => handleToggle('commentNotificationsEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={Users}
          title={t('CollaborationRequests')}
          subtitle={t('GetNotifiedAboutCollaborationRequests')}
          end={
            <CustomSwitch
              value={settings?.collaborationRequestsEnabled ?? true}
              onValueChange={(v) => handleToggle('collaborationRequestsEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={Bell}
          title={t('ActivityFeed')}
          subtitle={t('GetNotifiedAboutActivityFeedUpdates')}
          end={
            <CustomSwitch
              value={settings?.activityFeedNotificationsEnabled ?? true}
              onValueChange={(v) => handleToggle('activityFeedNotificationsEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={Calendar}
          title={t('WeeklyDigest')}
          subtitle={t('ReceiveWeeklySummaryOfActivity')}
          end={
            <CustomSwitch
              value={settings?.weeklyDigestEnabled ?? false}
              onValueChange={(v) => handleToggle('weeklyDigestEnabled', v)}
              disabled={isUpdating}
            />
          }
        />
        <SettingsRow
          icon={CheckCircle}
          title={t('AutoAcceptInvitations')}
          subtitle={t('AutomaticallyAcceptEventInvitations')}
          end={
            <CustomSwitch
              value={settings?.autoAcceptInvitations ?? false}
              onValueChange={handleAutoAcceptChange}
              disabled={isUpdating}
            />
          }
        />
        </View>
      </ScrollView>
    </View>
  );
}
