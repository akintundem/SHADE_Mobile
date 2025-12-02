import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Send, Mail, MessageSquare, Smartphone, RefreshCcw, Clock, Bell, CalendarClock, PlusCircle, Trash2, X, List } from 'lucide-react-native';
import { useTheme } from '../../../../../common/theme/ThemeProvider';
import { eventService } from '../../../services/eventService';
import { EventNotificationRequest,
  EventNotificationChannel,
  EventReminderRequest,
  EventReminderResponse,
  EventReminderUpdateRequest, } from '../../../../../common/types';
import { DateTimePickerModal } from '../../../../../common/datetime';
import { dateUtils } from '../../../../../common/utils/helpers';
import { DATE_FORMAT } from '../../../../../common/utils/constants';

type RouteParams = { eventId: string };

type ActionType = 'notification' | 'reminder' | 'list';

const CHANNELS: { key: EventNotificationChannel; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { key: 'EMAIL', label: 'Email', icon: Mail },
  { key: 'SMS', label: 'SMS', icon: MessageSquare },
  { key: 'PUSH', label: 'Push', icon: Bell },
  { key: 'IN_APP', label: 'In-App', icon: Smartphone },
];

const ACTION_TYPES: { key: ActionType; label: string; icon: React.ComponentType<{ size?: number; color?: string }> }[] = [
  { key: 'notification', label: 'Send Notification', icon: Send },
  { key: 'reminder', label: 'Create Reminder', icon: CalendarClock },
  { key: 'list', label: 'View Reminders', icon: List },
];

// Action Button Component
const ActionButton = ({
  icon: Icon,
  label,
  onPress,
  disabled,
  variant = 'default',
  loading,
}: {
  icon?: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'default' | 'primary' | 'destructive';
  loading?: boolean;
}) => {
  const { colors, spacing, borderRadius, typography } = useTheme();

  const getStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          borderColor: colors.text.primary,
          backgroundColor: disabled ? colors.background : colors.text.primary,
          textColor: colors.background,
        };
      case 'destructive':
        return {
          borderColor: '#ef4444',
          backgroundColor: disabled ? colors.background : 'transparent',
          textColor: '#ef4444',
        };
      default:
        return {
          borderColor: colors.text.primary,
          backgroundColor: disabled ? colors.background : 'transparent',
          textColor: colors.text.primary,
        };
    }
  };

  const styles = getStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.sm,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.xl,
        borderWidth: 1,
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
        opacity: disabled || loading ? 0.5 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={styles.textColor} />
      ) : (
        Icon && <Icon size={18} color={styles.textColor} />
      )}
      <Text style={{ color: styles.textColor, fontWeight: typography.weight.semibold, textTransform: 'uppercase', fontSize: typography.size.sm }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const ManageNotificationsScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  // Action type selector
  const [actionType, setActionType] = useState<ActionType>('notification');

  // Notification state
  const [sendForm, setSendForm] = useState({
    subject: '',
    message: '',
    recipients: '',
    channel: 'EMAIL' as EventNotificationChannel,
    scheduledAt: null as Date | null,
  });
  const [notifBusy, setNotifBusy] = useState(false);
  const [showSchedulePicker, setShowSchedulePicker] = useState(false);

  // Reminder state
  const [reminders, setReminders] = useState<EventReminderResponse[]>([]);
  const [editingReminder, setEditingReminder] = useState<EventReminderResponse | null>(null);
  const [reminderForm, setReminderForm] = useState({
    title: '',
    channel: 'EMAIL',
    dateTime: null as Date | null,
    message: '',
  });
  const [reminderBusy, setReminderBusy] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setRefreshing(true);
    try {
      const [settings, remindersData] = await Promise.all([
        eventService.getNotificationSettings(params.eventId).catch(() => null),
        eventService.getEventReminders(params.eventId, { size: 100 }).catch(() => []),
      ]);

      if (settings) {
        const firstEnabled =
          Object.entries(settings.channels ?? {}).find(([, value]) => value)?.[0] ?? 'EMAIL';
        setSendForm(prev => ({ ...prev, channel: firstEnabled as EventNotificationChannel }));
      }

      setReminders(remindersData);
    } catch (error) {
      console.warn('Unable to load data:', error);
    } finally {
      setRefreshing(false);
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRefresh = useCallback(async () => {
    await load();
  }, [load]);

  // Notification handlers
  const canSend = sendForm.subject.trim().length > 0 && sendForm.message.trim().length > 0;

  const handleScheduleConfirm = useCallback((date: Date, time: { hour: number; minute: number }) => {
    const combined = new Date(date);
    combined.setHours(time.hour, time.minute, 0, 0);
    setSendForm(prev => ({ ...prev, scheduledAt: combined }));
    setShowSchedulePicker(false);
  }, []);

  const handleSend = useCallback(async () => {
    if (!canSend) return;
    setNotifBusy(true);
    try {
      const payload: EventNotificationRequest = {
        channel: sendForm.channel,
        subject: sendForm.subject,
        content: sendForm.message,
        recipientEmails:
          sendForm.recipients.trim().length > 0
            ? sendForm.recipients.split(/[,;\n]+/).map(item => item.trim()).filter(Boolean)
            : undefined,
        scheduledAt: sendForm.scheduledAt?.toISOString(),
      };
      await eventService.sendEventNotification(params.eventId, payload);
      Alert.alert('Success', 'Notification queued for delivery.');
      setSendForm({
        subject: '',
        message: '',
        recipients: '',
        channel: sendForm.channel,
        scheduledAt: null,
      });
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Failed to send notification.');
      console.warn(error);
    } finally {
      setNotifBusy(false);
    }
  }, [canSend, params.eventId, sendForm]);

  // Reminder handlers
  const resetReminderForm = useCallback(() => {
    setEditingReminder(null);
    setReminderForm({
      title: '',
      channel: 'EMAIL',
      dateTime: null,
      message: '',
    });
  }, []);

  const populateReminder = useCallback((reminder: EventReminderResponse) => {
    setEditingReminder(reminder);
    setReminderForm({
      title: reminder.title,
      channel: reminder.channel,
      dateTime: reminder.reminderTime ? new Date(reminder.reminderTime) : null,
      message: reminder.customMessage ?? '',
    });
    setActionType('reminder');
  }, []);

  const handleReminderDateConfirm = useCallback((date: Date, time: { hour: number; minute: number }) => {
    const combined = new Date(date);
    combined.setHours(time.hour, time.minute, 0, 0);
    setReminderForm(prev => ({ ...prev, dateTime: combined }));
    setShowReminderPicker(false);
  }, []);

  const handleSaveReminder = useCallback(async () => {
    if (!reminderForm.title || !reminderForm.dateTime) {
      Alert.alert('Missing data', 'Title and time are required.');
      return;
    }
    setReminderBusy(true);
    try {
      const payload: EventReminderRequest = {
        title: reminderForm.title,
        reminderTime: reminderForm.dateTime.toISOString(),
        channel: reminderForm.channel,
        customMessage: reminderForm.message || undefined,
      };
      let saved: EventReminderResponse;
      if (editingReminder) {
        const update: EventReminderUpdateRequest = {
          ...payload,
        };
        saved = await eventService.updateEventReminder(params.eventId, editingReminder.reminderId, update);
      } else {
        saved = await eventService.createEventReminder(params.eventId, payload);
      }
      setReminders(current => {
        const rest = current.filter(item => item.reminderId !== saved.reminderId);
        return [saved, ...rest];
      });
      resetReminderForm();
      Alert.alert('Success', `Reminder ${editingReminder ? 'updated' : 'created'}.`);
      setActionType('list');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to save reminder.');
      console.warn(error);
    } finally {
      setReminderBusy(false);
    }
  }, [editingReminder, params.eventId, reminderForm, resetReminderForm]);

  const handleDeleteReminder = useCallback(
    async (id: string) => {
      setReminderBusy(true);
      try {
        await eventService.deleteEventReminder(params.eventId, id);
        setReminders(current => current.filter(item => item.reminderId !== id));
        if (editingReminder?.reminderId === id) {
          resetReminderForm();
        }
        Alert.alert('Success', 'Reminder deleted.');
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to delete reminder.');
        console.warn(error);
      } finally {
        setReminderBusy(false);
      }
    },
    [editingReminder?.reminderId, params.eventId, resetReminderForm],
  );

  const scheduleDisplay = sendForm.scheduledAt
    ? dateUtils.formatDate(sendForm.scheduledAt.toISOString(), DATE_FORMATS.DISPLAY_DATETIME)
    : 'Send immediately';

  const reminderDisplay = reminderForm.dateTime
    ? dateUtils.formatDate(reminderForm.dateTime.toISOString(), DATE_FORMATS.DISPLAY_DATETIME)
    : 'Select date & time';

  const renderNotificationForm = () => (
    <View style={{ gap: spacing.lg }}>
      {/* Channel Selection */}
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          Channel
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {CHANNELS.map(({ key, label, icon: Icon }) => {
            const isSelected = sendForm.channel === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setSendForm(prev => ({ ...prev, channel: key }))}
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.lg,
                  paddingHorizontal: spacing.sm,
                  borderRadius: borderRadius.xl,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.text.primary : colors.border,
                  backgroundColor: isSelected ? colors.text.primary : colors.background,
                }}
              >
                <Icon size={24} color={isSelected ? colors.background : colors.text.primary} />
                <Text
                  style={{
                    color: isSelected ? colors.background : colors.text.primary,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.medium,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Subject */}
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Mail size={14} color={colors.text.secondary} />
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Subject
          </Text>
          <Text style={{ color: '#ef4444', fontSize: typography.size.xs }}>*</Text>
        </View>
        <TextInput
          value={sendForm.subject}
          onChangeText={text => setSendForm(prev => ({ ...prev, subject: text }))}
          placeholder="Enter subject"
          placeholderTextColor={colors.text.tertiary}
          style={{
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            color: colors.text.primary,
            fontSize: typography.size.base,
            fontWeight: typography.weight.medium,
          }}
        />
      </View>

      {/* Message */}
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <MessageSquare size={14} color={colors.text.secondary} />
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Message
          </Text>
          <Text style={{ color: '#ef4444', fontSize: typography.size.xs }}>*</Text>
        </View>
        <TextInput
          value={sendForm.message}
          onChangeText={text => setSendForm(prev => ({ ...prev, message: text }))}
          placeholder="Write your message..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          style={{
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            minHeight: 180,
            textAlignVertical: 'top',
            color: colors.text.primary,
            fontSize: typography.size.base,
            lineHeight: 22,
          }}
        />
      </View>

      {/* Recipients */}
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Mail size={14} color={colors.text.secondary} />
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Recipients
          </Text>
        </View>
        <TextInput
          value={sendForm.recipients}
          onChangeText={text => setSendForm(prev => ({ ...prev, recipients: text }))}
          placeholder="email1@example.com, email2@example.com"
          placeholderTextColor={colors.text.tertiary}
          multiline
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            minHeight: 100,
            textAlignVertical: 'top',
            color: colors.text.primary,
            fontSize: typography.size.base,
          }}
        />
      </View>

      {/* Schedule */}
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Clock size={14} color={colors.text.secondary} />
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Schedule
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setShowSchedulePicker(true)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          >
            <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.medium }}>
              {scheduleDisplay}
            </Text>
            <Clock size={18} color={colors.text.secondary} />
          </TouchableOpacity>
          {sendForm.scheduledAt && (
            <TouchableOpacity
              onPress={() => setSendForm(prev => ({ ...prev, scheduledAt: null }))}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.full,
              }}
            >
              <X size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Send Button */}
      <ActionButton
        icon={Send}
        label="Send Notification"
        onPress={handleSend}
        disabled={!canSend || notifBusy}
        variant="primary"
        loading={notifBusy}
      />
    </View>
  );

  const renderReminderForm = () => (
    <View style={{ gap: spacing.lg }}>
      {/* Title */}
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <CalendarClock size={14} color={colors.text.secondary} />
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Title
          </Text>
          <Text style={{ color: '#ef4444', fontSize: typography.size.xs }}>*</Text>
        </View>
        <TextInput
          value={reminderForm.title}
          onChangeText={text => setReminderForm(prev => ({ ...prev, title: text }))}
          placeholder="Reminder title"
          placeholderTextColor={colors.text.tertiary}
          style={{
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            color: colors.text.primary,
            fontSize: typography.size.base,
            fontWeight: typography.weight.medium,
          }}
        />
      </View>

      {/* Channel */}
      <View style={{ gap: spacing.md }}>
        <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
          Channel
        </Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {CHANNELS.map(({ key, label, icon: Icon }) => {
            const isSelected = reminderForm.channel === key;
            return (
              <TouchableOpacity
                key={key}
                onPress={() => setReminderForm(prev => ({ ...prev, channel: key }))}
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: spacing.xs,
                  paddingVertical: spacing.md,
                  paddingHorizontal: spacing.sm,
                  borderRadius: borderRadius.lg,
                  borderWidth: isSelected ? 2 : 1,
                  borderColor: isSelected ? colors.text.primary : colors.border,
                  backgroundColor: isSelected ? colors.text.primary : colors.background,
                }}
              >
                <Icon size={20} color={isSelected ? colors.background : colors.text.primary} />
                <Text
                  style={{
                    color: isSelected ? colors.background : colors.text.primary,
                    fontSize: typography.size.xs,
                    fontWeight: typography.weight.medium,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Date & Time */}
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <Clock size={14} color={colors.text.secondary} />
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Date & Time
          </Text>
          <Text style={{ color: '#ef4444', fontSize: typography.size.xs }}>*</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => setShowReminderPicker(true)}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
            }}
          >
            <Text style={{ color: colors.text.primary, fontSize: typography.size.base, fontWeight: typography.weight.medium }}>
              {reminderDisplay}
            </Text>
            <Clock size={18} color={colors.text.secondary} />
          </TouchableOpacity>
          {reminderForm.dateTime && (
            <TouchableOpacity
              onPress={() => setReminderForm(prev => ({ ...prev, dateTime: null }))}
              style={{
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.sm,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: borderRadius.full,
              }}
            >
              <X size={16} color={colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Message */}
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
          <MessageSquare size={14} color={colors.text.secondary} />
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Message
          </Text>
        </View>
        <TextInput
          value={reminderForm.message}
          onChangeText={text => setReminderForm(prev => ({ ...prev, message: text }))}
          placeholder="Custom reminder message (optional)"
          placeholderTextColor={colors.text.tertiary}
          multiline
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: borderRadius.lg,
            paddingHorizontal: spacing.lg,
            paddingVertical: spacing.md,
            minHeight: 100,
            textAlignVertical: 'top',
            color: colors.text.primary,
            fontSize: typography.size.base,
            lineHeight: 22,
          }}
        />
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <ActionButton
          icon={editingReminder ? undefined : PlusCircle}
          label={editingReminder ? 'Update Reminder' : 'Create Reminder'}
          onPress={handleSaveReminder}
          disabled={reminderBusy || !reminderForm.title || !reminderForm.dateTime}
          variant="primary"
          loading={reminderBusy}
        />
        {editingReminder && (
          <TouchableOpacity
            onPress={() => {
              resetReminderForm();
              setActionType('list');
            }}
            disabled={reminderBusy}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.lg,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: borderRadius.xl,
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderRemindersList = () => (
    <View style={{ gap: spacing.md }}>
      {reminders.length === 0 ? (
        <View style={{ padding: spacing.xl, alignItems: 'center' }}>
          <CalendarClock size={48} color={colors.text.tertiary} />
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.base, marginTop: spacing.md }}>
            No reminders scheduled
          </Text>
        </View>
      ) : (
        reminders.map(reminder => (
          <View
            key={reminder.reminderId}
            style={{
              borderWidth: 1,
              borderColor: editingReminder?.reminderId === reminder.reminderId ? colors.text.primary : colors.border,
              borderRadius: borderRadius.lg,
              padding: spacing.lg,
              gap: spacing.sm,
              backgroundColor: editingReminder?.reminderId === reminder.reminderId ? colors.text.primary + '0D' : colors.background,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flex: 1 }}>
                <CalendarClock size={18} color={colors.text.primary} />
                <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold, fontSize: typography.size.base }}>
                  {reminder.title}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <TouchableOpacity
                  onPress={() => populateReminder(reminder)}
                  style={{ padding: spacing.xs }}
                >
                  <Text style={{ color: colors.text.primary, fontSize: typography.size.sm, fontWeight: typography.weight.medium }}>
                    Edit
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteReminder(reminder.reminderId)}
                  disabled={reminderBusy}
                  style={{ padding: spacing.xs }}
                >
                  <Trash2 size={16} color={colors.error?.text ?? '#ef4444'} />
                </TouchableOpacity>
              </View>
            </View>
            <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
              {dateUtils.formatDate(reminder.reminderTime, DATE_FORMATS.DISPLAY_DATETIME)} • {reminder.channel}
            </Text>
            {reminder.customMessage ? (
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                {reminder.customMessage}
              </Text>
            ) : null}
          </View>
        ))
      )}
    </View>
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
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: spacing.xs }}>
            <ArrowLeft size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text
            style={{
              color: colors.text.primary,
              fontWeight: typography.weight.semibold,
              fontSize: typography.size.lg,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Notifications & Reminders
          </Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} disabled={refreshing} style={{ padding: spacing.xs }}>
          <RefreshCcw size={18} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.xl,
          gap: spacing.xl,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Action Type Selector */}
        <View style={{ gap: spacing.md }}>
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs, textTransform: 'uppercase', letterSpacing: 1.5 }}>
            Action
          </Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {ACTION_TYPES.map(({ key, label, icon: Icon }) => {
              const isSelected = actionType === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => {
                    setActionType(key);
                    if (key !== 'reminder') {
                      resetReminderForm();
                    }
                  }}
                  style={{
                    flex: 1,
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: spacing.xs,
                    paddingVertical: spacing.lg,
                    paddingHorizontal: spacing.sm,
                    borderRadius: borderRadius.xl,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected ? colors.text.primary : colors.border,
                    backgroundColor: isSelected ? colors.text.primary : colors.background,
                  }}
                >
                  <Icon size={24} color={isSelected ? colors.background : colors.text.primary} />
                  <Text
                    style={{
                      color: isSelected ? colors.background : colors.text.primary,
                      fontSize: typography.size.xs,
                      fontWeight: typography.weight.medium,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      textAlign: 'center',
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dynamic Content Based on Selection */}
        {actionType === 'notification' && renderNotificationForm()}
        {actionType === 'reminder' && renderReminderForm()}
        {actionType === 'list' && renderRemindersList()}
      </ScrollView>

      {/* Date Pickers */}
      <DateTimePickerModal
        visible={showSchedulePicker}
        initialDate={sendForm.scheduledAt || new Date()}
        initialTime={sendForm.scheduledAt ? { hour: sendForm.scheduledAt.getHours(), minute: sendForm.scheduledAt.getMinutes() } : undefined}
        onClose={() => setShowSchedulePicker(false)}
        onConfirm={handleScheduleConfirm}
        title="Schedule Notification"
      />

      <DateTimePickerModal
        visible={showReminderPicker}
        initialDate={reminderForm.dateTime || new Date()}
        initialTime={reminderForm.dateTime ? { hour: reminderForm.dateTime.getHours(), minute: reminderForm.dateTime.getMinutes() } : undefined}
        onClose={() => setShowReminderPicker(false)}
        onConfirm={handleReminderDateConfirm}
        title="Schedule Reminder"
      />
    </SafeAreaView>
  );
};

export default ManageNotificationsScreen;
