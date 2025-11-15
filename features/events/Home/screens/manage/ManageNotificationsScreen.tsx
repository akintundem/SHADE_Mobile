import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ArrowLeft, Bell, Send } from 'lucide-react-native';
import { useTheme } from '../../../../../shared/theme/ThemeProvider';
import { eventService } from '../../../../../shared/services/eventService';
import {
  EventNotificationRequest,
  EventNotificationSettingsRequest,
  EventNotificationSettingsResponse,
} from '../../../../../shared/types';

type RouteParams = { eventId: string };

const CHANNELS: (keyof NonNullable<EventNotificationSettingsRequest['channels']>)[] = [
  'EMAIL',
  'SMS',
  'PUSH',
  'IN_APP',
];

const ManageNotificationsScreen = () => {
  const { params } = useRoute<RouteProp<{ params: RouteParams }, 'params'>>();
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius } = useTheme();

  const [settings, setSettings] = useState<EventNotificationSettingsResponse | null>(null);
  const [form, setForm] = useState<EventNotificationSettingsRequest>({
    enabled: true,
    channels: {},
  });
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [recipients, setRecipients] = useState('');
  const [channel, setChannel] = useState<EventNotificationRequest['channel']>('EMAIL');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await eventService.getNotificationSettings(params.eventId);
      setSettings(data);
      setForm({
        enabled: data.enabled,
        channels: { ...(data.channels ?? {}) },
        reminderOffsets: data.reminderOffsets,
        preferences: data.preferences,
      });
      const firstEnabled =
        Object.entries(data.channels ?? {}).find(([, value]) => value)?.[0] ?? 'EMAIL';
      setChannel(firstEnabled as EventNotificationRequest['channel']);
    } catch (error) {
      Alert.alert('Error', 'Unable to load notification settings.');
      console.warn(error);
    }
  }, [params.eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleChannel = useCallback((key: keyof NonNullable<EventNotificationSettingsRequest['channels']>) => {
    setForm(prev => ({
      ...prev,
      channels: {
        ...(prev.channels ?? {}),
        [key]: !prev.channels?.[key],
      },
    }));
  }, []);

  const handleSaveSettings = useCallback(async () => {
    setBusy(true);
    try {
      await eventService.updateNotificationSettings(params.eventId, form);
      await load();
      Alert.alert('Success', 'Notification preferences saved.');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Save failed.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  }, [form, load, params.eventId]);

  const disabledSend = useMemo(() => !subject || !message, [message, subject]);

  const handleSend = useCallback(async () => {
    if (disabledSend) return;
    setBusy(true);
    try {
      const payload: EventNotificationRequest = {
        channel,
        subject,
        content: message,
        recipientEmails:
          recipients.trim().length > 0
            ? recipients.split(/[,;\n]+/).map(item => item.trim()).filter(Boolean)
            : undefined,
      };
      await eventService.sendEventNotification(params.eventId, payload);
      Alert.alert('Success', 'Notification queued for delivery.');
      setSubject('');
      setMessage('');
      setRecipients('');
    } catch (error) {
      Alert.alert('Error', (error as { message?: string })?.message ?? 'Send failed.');
      console.warn(error);
    } finally {
      setBusy(false);
    }
  }, [channel, disabledSend, message, params.eventId, recipients, subject]);

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
            Notifications
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
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Bell size={20} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.medium }}>
              Preferences
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setForm(prev => ({ ...prev, enabled: !prev.enabled }))}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
          >
            <View
              style={{
                width: 18,
                height: 18,
                borderWidth: 1,
                borderColor: colors.text.primary,
                borderRadius: 4,
                backgroundColor: form.enabled ? colors.text.primary : colors.background,
              }}
            />
            <Text style={{ color: colors.text.primary }}>Enable notifications</Text>
          </TouchableOpacity>
          <View style={{ gap: spacing.xs }}>
            {CHANNELS.map(key => (
              <TouchableOpacity
                key={key}
                onPress={() => toggleChannel(key)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}
              >
                <View
                  style={{
                    width: 18,
                    height: 18,
                    borderWidth: 1,
                    borderColor: colors.text.primary,
                    borderRadius: 4,
                    backgroundColor: form.channels?.[key] ? colors.text.primary : colors.background,
                  }}
                />
                <Text style={{ color: colors.text.primary }}>{key}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={handleSaveSettings}
            disabled={busy}
            style={{
              marginTop: spacing.sm,
              paddingVertical: spacing.md,
              borderRadius: borderRadius.lg,
              borderWidth: 1,
              borderColor: colors.text.primary,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
              Save Preferences
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            borderWidth: 1,
            borderColor: colors.text.primary,
            borderRadius: borderRadius.xl,
            padding: spacing.lg,
            gap: spacing.sm,
          }}
        >
          <Text style={{ color: colors.text.secondary, fontSize: typography.size.xs }}>SEND UPDATE</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
            {CHANNELS.map(key => (
              <TouchableOpacity
                key={`send-${key}`}
                onPress={() => setChannel(key as EventNotificationRequest['channel'])}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.sm,
                  borderRadius: borderRadius.full,
                  borderWidth: 1,
                  borderColor: colors.text.primary,
                  backgroundColor: channel === key ? colors.text.primary : colors.background,
                }}
              >
                <Text
                  style={{
                    color: channel === key ? colors.background : colors.text.primary,
                    fontWeight: typography.weight.medium,
                  }}
                >
                  {key}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            value={subject}
            onChangeText={setSubject}
            placeholder="Subject"
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
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Message"
            placeholderTextColor={colors.text.tertiary}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              color: colors.text.primary,
              minHeight: 120,
              textAlignVertical: 'top',
            }}
          />
          <TextInput
            value={recipients}
            onChangeText={setRecipients}
            placeholder="Recipients (optional, comma-separated emails)"
            placeholderTextColor={colors.text.tertiary}
            multiline
            style={{
              borderWidth: 1,
              borderColor: colors.text.primary,
              borderRadius: borderRadius.lg,
              paddingHorizontal: spacing.md,
              paddingVertical: spacing.md,
              color: colors.text.primary,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />
          <TouchableOpacity
            onPress={handleSend}
            disabled={busy || disabledSend}
            style={{
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
            <Send size={18} color={colors.text.primary} />
            <Text style={{ color: colors.text.primary, fontWeight: typography.weight.semibold }}>
              {busy ? 'Sending…' : 'Send Notification'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ManageNotificationsScreen;

