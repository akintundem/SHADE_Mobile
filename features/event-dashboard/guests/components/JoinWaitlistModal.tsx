import React, { useCallback, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, X } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { eventWaitlistService } from '../../../../core/events/services/waitlist';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import Button from '../../../../common/components/ui/Button';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function JoinWaitlistModal({ visible, eventId, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const resetState = useCallback(() => {
    setName('');
    setEmail('');
    setError(null);
    setSuccess(false);
    setSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [resetState, onClose]);

  const handleSubmit = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    try {
      await eventWaitlistService.joinWaitlist(eventId, {
        name: name.trim() || null,
        email: email.trim() || null,
      });
      setSuccess(true);
      onSuccess();
    } catch (err) {
      setError(t('FailedToJoinWaitlist'));
      ErrorHandler.handle(err, 'joinWaitlist');
    } finally {
      setSubmitting(false);
    }
  }, [eventId, name, email, t, onSuccess]);

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
                {t('JoinWaitlist')}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
              >
                <X size={18} color={text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-xl" showsVerticalScrollIndicator={false}>
              {success ? (
                <View className="items-center py-2xl">
                  <View className="w-14 h-14 rounded-full items-center justify-center bg-semantic-success-light dark:bg-semantic-success/20 mb-md">
                    <Clock size={24} color={colors.semantic.success} strokeWidth={1.8} />
                  </View>
                  <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary mb-xs">
                    {t('JoinedWaitlist')}
                  </Text>
                  <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary text-center leading-relaxed">
                    {t('JoinedWaitlistDescription')}
                  </Text>
                  <View className="mt-xl w-full">
                    <Button variant="primary" onPress={handleClose}>
                      {t('Done')}
                    </Button>
                  </View>
                </View>
              ) : (
                <View>
                  <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed mb-xl">
                    {t('JoinWaitlistDescription')}
                  </Text>

                  {error && (
                    <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                      <Text className="text-sm text-semantic-error">{error}</Text>
                    </View>
                  )}

                  <View className="mb-lg">
                    <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
                      {t('Name')} ({t('Optional')})
                    </Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder={t('EnterYourName')}
                      placeholderTextColor={colors.text.tertiary}
                      className="border rounded-lg px-md py-sm text-sm text-txt-primary dark:text-txt-dark-primary border-light-border-strong dark:border-dark-border-strong bg-light-surface-subtle dark:bg-dark-surface-muted"
                    />
                  </View>

                  <View className="mb-xl">
                    <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
                      {t('Email')} ({t('Optional')})
                    </Text>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder={t('EnterYourEmail')}
                      placeholderTextColor={colors.text.tertiary}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="border rounded-lg px-md py-sm text-sm text-txt-primary dark:text-txt-dark-primary border-light-border-strong dark:border-dark-border-strong bg-light-surface-subtle dark:bg-dark-surface-muted"
                    />
                  </View>

                  <View className="mb-lg">
                    <Button
                      variant="primary"
                      onPress={handleSubmit}
                      loading={submitting}
                      disabled={submitting}
                    >
                      {t('JoinWaitlist')}
                    </Button>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
