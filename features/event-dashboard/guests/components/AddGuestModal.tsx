import React, { useCallback, useEffect, useState } from 'react';
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
import { Mail, User, UserPlus, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { attendeeService } from '../../../../core/attendee/services/attendee';
import Button from '../../../../common/components/ui/Button';
import { VisibilityLevel } from '../../../../core/auth/types/auth';
import { useCurrentUser } from '../../../auth/hooks';
import { useTheme, useSwitchTrackColors } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
};

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export function AddGuestModal({ visible, eventId, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;
  const { user } = useCurrentUser();
  const defaultVisibility = user?.settings?.eventParticipationVisibility ?? VisibilityLevel.PUBLIC;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [participationVisibility, setParticipationVisibility] = useState<VisibilityLevel>(defaultVisibility);
  const switchTrackColor = useSwitchTrackColors();

  useEffect(() => {
    setParticipationVisibility(defaultVisibility);
  }, [defaultVisibility]);

  const resetForm = useCallback(() => {
    setName('');
    setEmail('');
    setSendEmail(true);
    setSendPush(false);
    setParticipationVisibility(defaultVisibility);
    setError(null);
  }, [defaultVisibility]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!email.trim()) {
      setError(t('EmailRequired'));
      return;
    }

    if (!isValidEmail(email.trim())) {
      setError(t('PleaseEnterValidEmail'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await attendeeService.addAttendees({
        eventId,
        attendees: [
          {
            email: email.trim(),
            name: name.trim() || null,
            participationVisibility,
          },
        ],
        sendEmail,
        sendPushNotification: sendPush,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToAddGuest'));
      ErrorHandler.handle(err, 'addGuest');
    } finally {
      setIsSubmitting(false);
    }
  }, [eventId, email, name, sendEmail, sendPush, participationVisibility, t, resetForm, onSuccess, onClose]);

  const modalPaddingBottom = Math.max(insets.bottom, 20);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <View className="flex-1 bg-light-overlay dark:bg-dark-overlay justify-end">
          <View
            className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-[20px] max-h-[90%]"
            style={{ paddingBottom: modalPaddingBottom }}
          >
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('AddGuest')}
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

              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Name')} ({t('Optional')})
                </Text>
                <View className="flex-row items-center rounded-lg px-md border bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                  <User size={16} color={text.tertiary} strokeWidth={2.2} />
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t('EnterName')}
                    placeholderTextColor={text.tertiary}
                    className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary"
                  />
                </View>
              </View>

              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('Email')} *
                </Text>
                <View className="flex-row items-center rounded-lg px-md border bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                  <Mail size={16} color={text.tertiary} strokeWidth={2.2} />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('EnterEmail')}
                    placeholderTextColor={text.tertiary}
                    className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View className="mb-xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
                  {t('NotificationOptions')}
                </Text>

                <View className="flex-row items-center justify-between py-md border-b-[0.5px] border-light-border-subtle dark:border-dark-border-subtle">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]">
                      {t('SendEmailInvitation')}
                    </Text>
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      {t('SendEmailInviteDescription')}
                    </Text>
                  </View>
                    <Switch
                      value={sendEmail}
                      onValueChange={setSendEmail}
                      trackColor={{
                        false: switchTrackColor.false,
                        true: switchTrackColor.true,
                      }}
                      thumbColor={colors.background}
                    />
                </View>

                <View className="flex-row items-center justify-between py-md">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mb-[2px]">
                      {t('SendPushNotification')}
                    </Text>
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      {t('SendPushInviteDescription')}
                    </Text>
                  </View>
                    <Switch
                      value={sendPush}
                      onValueChange={setSendPush}
                      trackColor={{
                        false: switchTrackColor.false,
                        true: switchTrackColor.true,
                      }}
                      thumbColor={colors.background}
                    />
                </View>
              </View>

              <View className="mb-lg">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isSubmitting || !email.trim()}
                  leftIcon={<UserPlus size={18} color={text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? t('AddingGuest') : t('AddGuest')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
