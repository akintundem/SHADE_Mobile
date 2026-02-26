import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Calendar, Send, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import {
  EventReminderRequest,
  RecipientType,
} from '../../../../core/events/types/event';
import Button from '../../../../common/components/ui/Button';
import { DateTimePickerModal } from '../../../../common/datetime/DateTimePickerModal';
import { useTheme, useSwitchTrackColors } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onSuccess: (request: EventReminderRequest) => Promise<void>;
};

export function CreateReminderModal({ visible, eventId: _eventId, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;
  const switchTrackColor = useSwitchTrackColors();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [channel, setChannel] = useState<string>('email');
  const [reminderTime, setReminderTime] = useState<Date | null>(null);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [recipientTypes, setRecipientTypes] = useState<RecipientType[]>([RecipientType.ALL_GUESTS]);
  const [isActive, setIsActive] = useState(true);
  const [includeEventDetails, setIncludeEventDetails] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setChannel('email');
    setReminderTime(null);
    setRecipientTypes([RecipientType.ALL_GUESTS]);
    setIsActive(true);
    setIncludeEventDetails(true);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setError(t('TitleRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const request: EventReminderRequest = {
        title: title.trim(),
        description: description.trim() || null,
        channel,
        reminderTime: reminderTime ? reminderTime.toISOString() : null,
        recipientTypes,
        isActive,
        includeEventDetails,
        reminderType: 'custom',
      };

      await onSuccess(request);
      resetForm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      ErrorHandler.handle(err, 'createReminder');
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, channel, reminderTime, recipientTypes, isActive, includeEventDetails, t, onSuccess, resetForm]);

  const toggleRecipientType = useCallback((type: RecipientType) => {
    setRecipientTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  }, []);

  const modalPaddingBottom = Math.max(insets.bottom, 20);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 bg-light-overlay dark:bg-dark-overlay justify-end">
          <View
            className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-xl max-h-[90%]"
            style={{ paddingBottom: modalPaddingBottom }}
          >
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('CreateReminder')}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
              >
                <X size={18} color={text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-xl" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
              {error && (
                <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                  <Text className="text-sm text-semantic-error">
                    {error}
                  </Text>
                </View>
              )}

              {/* Title */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Title')} *
                </Text>
                <View className="rounded-lg px-md border bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                  <TextInput
                    value={title}
                    onChangeText={setTitle}
                    placeholder={t('EnterReminderTitle')}
                    placeholderTextColor={text.tertiary}
                    className="text-sm text-txt-primary dark:text-txt-dark-primary py-md"
                  />
                </View>
              </View>

              {/* Description */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Description')} ({t('Optional')})
                </Text>
                <View className="rounded-lg px-md border bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                  <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder={t('EnterReminderDescription')}
                    placeholderTextColor={text.tertiary}
                    multiline
                    className="text-sm text-txt-primary dark:text-txt-dark-primary min-h-[80px] py-md"
                    style={{ textAlignVertical: 'top' }}
                  />
                </View>
              </View>

              {/* Channel */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Channel')} *
                </Text>
                <View className="flex-row gap-sm">
                  {['email', 'sms', 'push'].map(ch => (
                    <TouchableOpacity
                      key={ch}
                      onPress={() => setChannel(ch)}
                      activeOpacity={0.7}
                      className={`flex-1 py-sm px-md rounded-lg border ${
                        channel === ch
                          ? 'bg-txt-primary dark:bg-txt-dark-primary border-txt-primary dark:border-txt-dark-primary'
                          : 'bg-transparent border-light-border dark:border-dark-border'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium text-center ${
                          channel === ch
                            ? 'text-txt-inverse dark:text-txt-dark-inverse'
                            : 'text-txt-primary dark:text-txt-dark-primary'
                        }`}
                      >
                        {ch.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Reminder Time */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('ReminderTime')} ({t('Optional')})
                </Text>
                <TouchableOpacity
                  onPress={() => setShowDateTimePicker(true)}
                  className="rounded-lg px-md border bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted py-md flex-row items-center"
                >
                  <Calendar size={16} color={text.tertiary} strokeWidth={2} />
                  <Text className={`text-sm ml-sm ${reminderTime ? 'text-txt-primary dark:text-txt-dark-primary' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}>
                    {reminderTime
                      ? reminderTime.toLocaleString()
                      : t('SelectReminderTime')}
                  </Text>
                </TouchableOpacity>
                {reminderTime && (
                  <TouchableOpacity
                    onPress={() => setReminderTime(null)}
                    className="mt-xs"
                  >
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      {t('Clear')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Recipients */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Recipients')}
                </Text>
                <View className="flex-row flex-wrap gap-sm">
                  {Object.values(RecipientType).map(type => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => toggleRecipientType(type)}
                      activeOpacity={0.7}
                      className={`px-md py-sm rounded-lg border ${
                        recipientTypes.includes(type)
                          ? 'bg-txt-primary dark:bg-txt-dark-primary border-txt-primary dark:border-txt-dark-primary'
                          : 'bg-transparent border-light-border dark:border-dark-border'
                      }`}
                    >
                      <Text
                        className={`text-xs font-medium ${
                          recipientTypes.includes(type)
                            ? 'text-txt-inverse dark:text-txt-dark-inverse'
                            : 'text-txt-primary dark:text-txt-dark-primary'
                        }`}
                      >
                        {type.replace(/_/g, ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Options */}
              <View className="mb-xl">
                <View className="flex-row items-center justify-between py-md border-b-[0.5px] border-light-border-subtle dark:border-dark-border-subtle">
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {t('Active')}
                  </Text>
                  <Switch
                    value={isActive}
                    onValueChange={setIsActive}
                    trackColor={{
                      false: switchTrackColor.false,
                      true: switchTrackColor.true,
                    }}
                    thumbColor={colors.background}
                  />
                </View>
                <View className="flex-row items-center justify-between py-md">
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                    {t('IncludeEventDetails')}
                  </Text>
                  <Switch
                    value={includeEventDetails}
                    onValueChange={setIncludeEventDetails}
                    trackColor={{
                      false: switchTrackColor.false,
                      true: switchTrackColor.true,
                    }}
                    thumbColor={colors.background}
                  />
                </View>
              </View>

              <Button
                variant="primary"
                size="lg"
                onPress={handleSubmit}
                disabled={isSubmitting || !title.trim()}
                leftIcon={<Send size={18} color={text.inverse} strokeWidth={2.2} />}
              >
                {isSubmitting ? t('Creating') : t('CreateReminder')}
              </Button>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>

      <DateTimePickerModal
        visible={showDateTimePicker}
        mode="datetime"
        date={reminderTime || new Date()}
        onConfirm={(date) => {
          setReminderTime(date);
          setShowDateTimePicker(false);
        }}
        onCancel={() => setShowDateTimePicker(false)}
        minimumDate={new Date()}
      />
    </Modal>
  );
}
