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
import { Upload, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { attendeeService } from '../../../../core/attendee/services/attendee';
import { CreateAttendeeInviteRequest } from '../../../../core/attendee/types/attendee';
import Button from '../../../../common/components/ui/Button';
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

const parseEmails = (text: string): string[] => {
  return text
    .split(/[,\n]/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && isValidEmail(line));
};

export function BulkInviteModal({ visible, eventId, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;

  const [emailList, setEmailList] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setEmailList('');
    setSendEmail(true);
    setSendPush(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    const emails = parseEmails(emailList);
    
    if (emails.length === 0) {
      setError(t('EnterAtLeastOneValidEmail'));
      return;
    }

    if (emails.length > 100) {
      setError(t('Maximum100InvitesAllowed'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const invites: CreateAttendeeInviteRequest[] = emails.map(email => ({
        inviteeEmail: email,
        sendEmail,
        sendPush,
      }));

      await attendeeService.createInvitesBulk(eventId, { invites });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToSendBulkInvites'));
      ErrorHandler.handle(err, 'createInvitesBulk');
    } finally {
      setIsSubmitting(false);
    }
  }, [eventId, emailList, sendEmail, sendPush, t, resetForm, onSuccess, onClose]);

  const parsedEmails = parseEmails(emailList);
  const emailCount = parsedEmails.length;

  const modalPaddingBottom = Math.max(insets.bottom, 20);
  const switchTrackColor = useSwitchTrackColors();

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
            className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-xl max-h-[90%]"
            style={{ paddingBottom: modalPaddingBottom }}
          >
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('BulkInviteGuests')}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-card dark:bg-dark-surface-elevated"
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
                  {t('EmailAddresses')} *
                </Text>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
                  {t('EnterEmailsOnePerLineOrCommaSeparated')}
                </Text>
                <View className="rounded-lg px-md border bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border">
                  <TextInput
                    value={emailList}
                    onChangeText={setEmailList}
                    placeholder={t('EnterEmailAddresses')}
                    placeholderTextColor={text.tertiary}
                    multiline
                    className="text-sm text-txt-primary dark:text-txt-dark-primary min-h-[120px] py-md"
                    style={{ textAlignVertical: 'top' }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
                {emailCount > 0 && (
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                    {t('ValidEmailsFound', { count: emailCount })}
                  </Text>
                )}
              </View>

              <View className="mb-xl">
                <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
                  {t('NotificationOptions')}
                </Text>

                <View className="flex-row items-center justify-between py-md border-b-[0.5px] border-light-border dark:border-dark-border">
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
                  disabled={isSubmitting || emailCount === 0}
                  leftIcon={<Upload size={18} color={text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? t('SendingInvites') : t('SendInvites', { count: emailCount })}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
