import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, CalendarClock, PlusCircle, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../../shared/services/eventService';
import {
  EventReminderRequest,
  EventReminderResponse,
  EventReminderUpdateRequest,
} from '../../../../../shared/types';

type RouteParams = { eventId: string };

const ManageRemindersScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [reminders, setReminders] = useState<EventReminderResponse[]>([]);
  const [editing, setEditing] = useState<EventReminderResponse | null>(null);
  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('EMAIL');
  const [dateTime, setDateTime] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await eventService.getEventReminders(params.eventId, { size: 100 });
      setReminders(data);
    } catch (error) {
      Alert.alert('Error', 'Unable to load reminders.');
      console.warn(error);
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = useCallback(() => {
    setEditing(null);
    setTitle('');
    setChannel('EMAIL');
    setDateTime('');
    setMessage('');
  }, []);

  const populate = useCallback((reminder: EventReminderResponse) => {
    setEditing(reminder);
    setTitle(reminder.title);
    setChannel(reminder.channel);
    setDateTime(reminder.reminderTime ?? '');
    setMessage(reminder.customMessage ?? '');
  }, []);

  const handleSave = useCallback(async () => {
    if (!title || !dateTime) {
      Alert.alert('Missing data', 'Title and time are required.');
      return;
    }
    setBusy(true);
    try {
      const payload: EventReminderRequest = {
        title,
        reminderTime: dateTime,
        channel,
        customMessage: message || undefined,
      };
      let saved: EventReminderResponse;
      if (editing) {
        const update: EventReminderUpdateRequest = {
          ...payload,
        };
        saved = await eventService.updateEventReminder(params.eventId, editing.reminderId, update);
      } else {
        saved = await eventService.createEventReminder(params.eventId, payload);
      }
      setReminders(current => {
        const rest = current.filter(item => item.reminderId !== saved.reminderId);
        return [saved, ...rest];
      });
      resetForm();
      Alert.alert('Success', `Reminder ${editing ? 'updated' : 'created'}.`);
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to save reminder.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  }, [channel, dateTime, editing, message, params.eventId, resetForm, title]);

  const handleDelete = useCallback(
    async (id: string) => {
      setBusy(true);
      try {
        await eventService.deleteEventReminder(params.eventId, id);
        setReminders(current => current.filter(item => item.reminderId !== id));
        if (editing?.reminderId === id) {
          resetForm();
        }
      } catch (error) {
        Alert.alert('Error', (error as { message?: string })?.message ?? 'Unable to delete reminder.');
        console.warn(error);
      } finally {
        setBusy(false);
      }
    },
    [editing?.reminderId, params.eventId, resetForm],
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
            Reminders
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
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>TITLE</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Reminder title"
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
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>CHANNEL</Text>
          <TextInput
            value={channel}
            onChangeText={setChannel}
            placeholder="EMAIL"
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
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>DATE & TIME</Text>
          <TextInput
            value={dateTime}
            onChangeText={setDateTime}
            placeholder="2025-05-01T09:00:00Z"
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
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>MESSAGE (OPTIONAL)</Text>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Custom reminder message"
            placeholderTextColor={colors.text.tertiary}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              color: colors.text.primary,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
          />
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={busy}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: spacing.sm,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.text.primary,
            }}
          >
            <PlusCircle size={18} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
              {editing ? 'Update reminder' : 'Create reminder'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={resetForm}
            disabled={busy}
            style={{
              paddingVertical: spacing.md,
              paddingHorizontal: spacing.md,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.text.secondary,
            }}
          >
            <Text style={{ color: colors.text.secondary, fontWeight: typography.weight.medium }}>Reset</Text>
          </TouchableOpacity>
        </View>

        <View style={{ gap: spacing.md }}>
          {reminders.map(reminder => (
            <TouchableOpacity
              key={reminder.reminderId}
              onPress={() => populate(reminder)}
              style={{
                borderWidth: 1,
                borderColor: colors.text.primary,
                borderRadius: borderRadius.lg,
                padding: spacing.lg,
                gap: spacing.xs,
                backgroundColor:
                  editing?.reminderId === reminder.reminderId ? colors.text.primary + '0D' : colors.background,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
                <CalendarClock size={18} color={colors.text.primary} />
                <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
                  {reminder.title}
                </Text>
              </View>
              <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                {reminder.reminderTime} • {reminder.channel}
              </Text>
              {reminder.customMessage ? (
                <Text style={{ color: colors.text.secondary, fontSize: typography.size.sm }}>
                  {reminder.customMessage}
                </Text>
              ) : null}
              <TouchableOpacity
                onPress={() => handleDelete(reminder.reminderId)}
                disabled={busy}
                style={{ marginTop: spacing.sm, flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}
              >
                <Trash2 size={16} color={colors.error?.text ?? '#ef4444'} />
                <Text style={{ color: colors.error?.text ?? '#ef4444' }}>Delete</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageRemindersScreen;

