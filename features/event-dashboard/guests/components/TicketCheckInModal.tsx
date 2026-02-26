import React, { useCallback, useEffect, useState } from 'react';
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
import { CheckCircle, QrCode, X, XCircle } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ticketService } from '../../../../core/tickets/services/ticket';
import { TicketValidationResponse } from '../../../../core/tickets/types/ticket';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import Button from '../../../../common/components/ui/Button';
import { useTheme } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export function TicketCheckInModal({ visible, eventId, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const text = colors.text;

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TicketValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setCode('');
    setLoading(false);
    setResult(null);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [visible, resetState]);

  const handleValidate = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setError(t('EnterTicketCode'));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ticketService.validateTicket({
        eventId,
        qrCodeData: trimmed,
      });
      setResult(response);
      if (response.valid) {
        onSuccess();
      }
    } catch (err) {
      setError(t('TicketValidationFailed'));
      ErrorHandler.handle(err, 'validateTicket');
    } finally {
      setLoading(false);
    }
  }, [code, eventId, onSuccess, t]);

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
        <View className="flex-1 justify-end bg-light-overlay dark:bg-dark-overlay">
          <View
            className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-xl max-h-[90%]"
            style={{ paddingBottom: modalPaddingBottom }}
          >
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <View>
                <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {t('TicketCheckIn')}
                </Text>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                  {t('TicketCheckInDescription')}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-card dark:bg-dark-surface-elevated"
              >
                <X size={18} color={text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-xl" showsVerticalScrollIndicator={false}>
              {error && (
                <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                  <Text className="text-sm text-semantic-error">{error}</Text>
                </View>
              )}

              {result ? (
                <View className="rounded-xl border p-lg mb-lg bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted">
                  <View className="flex-row items-center gap-sm mb-sm">
                    {result.valid ? (
                      <CheckCircle size={18} color={colors.semantic.success} strokeWidth={2} />
                    ) : (
                      <XCircle size={18} color={colors.semantic.error} strokeWidth={2} />
                    )}
                    <Text
                      className={`text-sm font-semibold ${
                        result.valid ? 'text-semantic-success' : 'text-semantic-error'
                      }`}
                    >
                      {result.valid ? t('TicketValidated') : t('TicketInvalid')}
                    </Text>
                  </View>

                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-md">
                    {result.message || t('CheckInStatus')}
                  </Text>

                  {result.ticket && (
                    <View className="gap-xs">
                      <View className="flex-row items-center justify-between">
                        <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                          {t('Ticket')}
                        </Text>
                        <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                          {result.ticket.ticketNumber}
                        </Text>
                      </View>
                      {result.ticket.attendeeName && (
                        <View className="flex-row items-center justify-between">
                          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                            {t('TicketHolder')}
                          </Text>
                          <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                            {result.ticket.attendeeName}
                          </Text>
                        </View>
                      )}
                      {result.ticket.ticketTypeName && (
                        <View className="flex-row items-center justify-between">
                          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                            {t('TicketType')}
                          </Text>
                          <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                            {result.ticket.ticketTypeName}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              ) : (
                <View className="mb-lg">
                  <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
                    {t('ValidateTicket')}
                  </Text>
                  <View className="rounded-lg px-md border border-[0.5px] bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border">
                    <TextInput
                      value={code}
                      onChangeText={textValue => {
                        setCode(textValue);
                        if (error) setError(null);
                      }}
                      placeholder={t('EnterTicketCode')}
                      placeholderTextColor={colors.text.tertiary}
                      className="text-sm text-txt-primary dark:text-txt-dark-primary py-md min-h-[80px]"
                      style={{ textAlignVertical: 'top' }}
                      multiline
                      autoCapitalize="none"
                      autoCorrect={false}
                      maxLength={2000}
                    />
                  </View>
                </View>
              )}

              <View className="mb-lg">
                {result ? (
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={resetState}
                    leftIcon={<QrCode size={18} color={colors.text.inverse} strokeWidth={2.2} />}
                  >
                    {t('ValidateAnother')}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="lg"
                    onPress={handleValidate}
                    loading={loading}
                    disabled={loading}
                    leftIcon={<QrCode size={18} color={colors.text.inverse} strokeWidth={2.2} />}
                  >
                    {loading ? t('Processing') : t('ValidateTicket')}
                  </Button>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
