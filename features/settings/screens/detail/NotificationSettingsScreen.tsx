import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { ArrowLeft, Bell, Mail, MessageSquare, Users, Calendar, Clock, CheckCircle } from 'lucide-react-native';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { SettingsSection, SettingsRow } from '../../components';
import CustomSwitch from '../../../../common/components/ui/CustomSwitch';
import { useCurrentUser } from '../../../../common/hooks/useCurrentUser';
import { authService } from '../../../../core/auth/services/authService';
import { UserSettings } from '../../../../core/auth/types/auth';

type Props = {
  onBack?: () => void;
};

export default function NotificationSettingsScreen({ onBack }: Props) {
  const { t } = useI18n();
  const { colors, spacing, typography } = useTheme();
  const { user, refetch } = useCurrentUser();
  const [isUpdating, setIsUpdating] = useState(false);
  
  const settings = user?.settings;

  const [emailNotifications, setEmailNotifications] = useState(settings?.emailNotificationsEnabled ?? true);
  const [pushNotifications, setPushNotifications] = useState(settings?.pushNotificationsEnabled ?? true);
  const [eventInvitations, setEventInvitations] = useState(settings?.eventInvitationsEnabled ?? true);
  const [eventUpdates, setEventUpdates] = useState(settings?.eventUpdatesEnabled ?? true);
  const [eventReminders, setEventReminders] = useState(settings?.eventRemindersEnabled ?? true);
  const [rsvpNotifications, setRsvpNotifications] = useState(settings?.rsvpNotificationsEnabled ?? true);
  const [commentNotifications, setCommentNotifications] = useState(settings?.commentNotificationsEnabled ?? true);
  const [collaborationRequests, setCollaborationRequests] = useState(settings?.collaborationRequestsEnabled ?? true);
  const [weeklyDigest, setWeeklyDigest] = useState(settings?.weeklyDigestEnabled ?? false);
  const [activityFeed, setActivityFeed] = useState(settings?.activityFeedNotificationsEnabled ?? true);
  const [autoAcceptInvitations, setAutoAcceptInvitations] = useState(settings?.autoAcceptInvitations ?? false);

  useEffect(() => {
    if (settings) {
      setEmailNotifications(settings.emailNotificationsEnabled ?? true);
      setPushNotifications(settings.pushNotificationsEnabled ?? true);
      setEventInvitations(settings.eventInvitationsEnabled ?? true);
      setEventUpdates(settings.eventUpdatesEnabled ?? true);
      setEventReminders(settings.eventRemindersEnabled ?? true);
      setRsvpNotifications(settings.rsvpNotificationsEnabled ?? true);
      setCommentNotifications(settings.commentNotificationsEnabled ?? true);
      setCollaborationRequests(settings.collaborationRequestsEnabled ?? true);
      setWeeklyDigest(settings.weeklyDigestEnabled ?? false);
      setActivityFeed(settings.activityFeedNotificationsEnabled ?? true);
      setAutoAcceptInvitations(settings.autoAcceptInvitations ?? false);
    }
  }, [settings]);

  const handleToggle = async (
    key: keyof Pick<UserSettings, 
      | 'emailNotificationsEnabled'
      | 'pushNotificationsEnabled'
      | 'eventInvitationsEnabled'
      | 'eventUpdatesEnabled'
      | 'eventRemindersEnabled'
      | 'rsvpNotificationsEnabled'
      | 'commentNotificationsEnabled'
      | 'collaborationRequestsEnabled'
      | 'weeklyDigestEnabled'
      | 'activityFeedNotificationsEnabled'
      | 'autoAcceptInvitations'
    >,
    value: boolean,
    setter: (v: boolean) => void
  ) => {
    if (!user) return;
    setter(value);
    setIsUpdating(true);
    try {
      await authService.updateUserProfile(user.id, {
        name: user.name,
        settings: { [key]: value },
      });
      await refetch();
    } catch (error) {
      // Revert on error
      setter(settings?.[key] as boolean ?? false);
    } finally {
      setIsUpdating(false);
    }
  };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: spacing.xl,
          paddingVertical: spacing.md,
          borderBottomWidth: 0.5,
          borderColor: colors.divider,
        }}
      >
        <TouchableOpacity onPress={onBack} style={{ padding: spacing.xs }}>
          <ArrowLeft size={20} color={colors.text.primary} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text
          style={{
            color: colors.text.primary,
            fontWeight: typography.weight.semibold,
            fontSize: typography.size.base,
          }}
        >
          {t('Notifications')}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <SettingsSection title={t('NotificationChannels')} />
        <SettingsRow
          icon={Mail}
          title={t('EmailNotifications')}
          subtitle={t('ReceiveNotificationsViaEmail')}
          end={
            <CustomSwitch
              value={emailNotifications}
              onValueChange={(v) => handleToggle('emailNotificationsEnabled', v, setEmailNotifications)}
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
              value={pushNotifications}
              onValueChange={(v) => handleToggle('pushNotificationsEnabled', v, setPushNotifications)}
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
              value={eventInvitations}
              onValueChange={(v) => handleToggle('eventInvitationsEnabled', v, setEventInvitations)}
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
              value={eventUpdates}
              onValueChange={(v) => handleToggle('eventUpdatesEnabled', v, setEventUpdates)}
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
              value={eventReminders}
              onValueChange={(v) => handleToggle('eventRemindersEnabled', v, setEventReminders)}
              disabled={isUpdating}
            />
          }
        />

        <SettingsSection title={t('SocialNotifications')} />
        <SettingsRow
          icon={CheckCircle}
          title={t('RSVPNotifications')}
          subtitle={t('GetNotifiedAboutRSVPs')}
          end={
            <CustomSwitch
              value={rsvpNotifications}
              onValueChange={(v) => handleToggle('rsvpNotificationsEnabled', v, setRsvpNotifications)}
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
              value={commentNotifications}
              onValueChange={(v) => handleToggle('commentNotificationsEnabled', v, setCommentNotifications)}
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
              value={collaborationRequests}
              onValueChange={(v) => handleToggle('collaborationRequestsEnabled', v, setCollaborationRequests)}
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
              value={activityFeed}
              onValueChange={(v) => handleToggle('activityFeedNotificationsEnabled', v, setActivityFeed)}
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
              value={weeklyDigest}
              onValueChange={(v) => handleToggle('weeklyDigestEnabled', v, setWeeklyDigest)}
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
              value={autoAcceptInvitations}
              onValueChange={(v) => handleToggle('autoAcceptInvitations', v, setAutoAcceptInvitations)}
              disabled={isUpdating}
            />
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}

