import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  X,
  Ticket,
  XCircle,
  RotateCcw,
  Send,
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { ticketService } from '../../../../core/tickets/services/ticket';
import { BulkTicketAction, TicketResponse } from '../../../../core/tickets/types/ticket';
import Button from '../../../../common/components/ui/Button';
import { useTheme, useSwitchTrackColors } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  selectedTickets: TicketResponse[];
  onClose: () => void;
  onSuccess: () => void;
};

export function BulkTicketActionsModal({
  visible,
  eventId,
  selectedTickets,
  onClose,
  onSuccess,
}: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const modalPaddingBottom = Math.max(insets.bottom, 20);
  const switchTrackColor = useSwitchTrackColors();

  const [action, setAction] = useState<BulkTicketAction | null>(null);
  const [reason, setReason] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setAction(null);
    setReason('');
    setSendEmail(true);
    setSendPush(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!action) {
      setError(t('SelectAction'));
      return;
    }

    if (selectedTickets.length === 0) {
      setError(t('SelectTicketsValidation'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await ticketService.bulkAction({
        eventId,
        action,
        ticketIds: selectedTickets.map(t => t.id),
        reason: reason.trim() || null,
        sendEmail,
        sendPush,
      });

      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToPerformBulkAction'));
      ErrorHandler.handle(err, 'bulkTicketAction');
    } finally {
      setIsSubmitting(false);
    }
  }, [action, selectedTickets, eventId, reason, sendEmail, sendPush, t, resetForm, onSuccess, onClose]);

  const actionOptions = [
    { value: BulkTicketAction.CANCEL, label: t('CancelTickets'), icon: XCircle, color: colors.semantic.error },
    { value: BulkTicketAction.REFUND, label: t('RefundTickets'), icon: RotateCcw, color: colors.semantic.warning },
    { value: BulkTicketAction.RESEND, label: t('ResendTickets'), icon: Send, color: colors.text.primary },
  ];

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
            {/* Header */}
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <View className="flex-1">
                <Text
                  className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary"
                >
                  {t('BulkTicketActions')}
                </Text>
                <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                  {t('SelectedTicketsCount', { count: selectedTickets.length })}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-card dark:bg-dark-surface-elevated"
              >
                <X size={18} color={colors.text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView
              className="px-xl"
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Error Message */}
              {error && (
                <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                  <Text className="text-sm text-semantic-error">
                    {error}
                  </Text>
                </View>
              )}

              {/* Action Selection */}
              <View className="mb-lg">
                <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                  {t('SelectAction')} *
                </Text>
                <View className="flex-row flex-wrap gap-sm">
                  {actionOptions.map(option => {
                    const Icon = option.icon;
                    const isSelected = action === option.value;
                    return (
                      <TouchableOpacity
                        key={option.value}
                        onPress={() => setAction(option.value)}
                        className={`flex-1 min-w-[100px] flex-row items-center justify-center gap-xs px-md py-md rounded-lg border ${
                          isSelected
                            ? 'bg-brand-primary border-brand-primary'
                            : 'bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border'
                        }`}
                      >
                        <Icon
                          size={18}
                          color={isSelected ? colors.text.inverse : option.color}
                          strokeWidth={2.2}
                        />
                        <Text
                          className={`text-sm font-medium ${
                            isSelected
                              ? 'text-txt-inverse'
                              : 'text-txt-primary dark:text-txt-dark-primary'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Reason (for cancel/refund) */}
              {(action === BulkTicketAction.CANCEL || action === BulkTicketAction.REFUND) && (
                <View className="mb-lg">
                  <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                    {t('Reason')} ({t('Optional')})
                  </Text>
                  <View className="rounded-lg px-md border border-[0.5px] bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border">
                    <TextInput
                      value={reason}
                      onChangeText={setReason}
                      placeholder={t('EnterReason')}
                      placeholderTextColor={colors.text.tertiary}
                      className="text-sm text-txt-primary dark:text-txt-dark-primary py-md min-h-[80px]"
                      style={{ textAlignVertical: 'top' }}
                      multiline
                      maxLength={500}
                    />
                  </View>
                </View>
              )}

              {/* Send Email Toggle */}
              <View className="flex-row items-center justify-between mb-sm py-md">
                <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                  {t('SendEmailNotification')}
                </Text>
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

              {/* Send Push Toggle */}
              <View className="flex-row items-center justify-between mb-xl py-md">
                <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                  {t('SendPushNotification')}
                </Text>
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

              {/* Submit Button */}
              <View className="mb-lg">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isSubmitting || !action || selectedTickets.length === 0}
                  leftIcon={<Ticket size={18} color={colors.text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? t('Processing') : t('ApplyAction')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
