import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Clock, Minus, Plus, X } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { ticketService } from '../../../core/tickets/services/ticket';
import { TicketTypeSummary } from '../../../core/tickets/types/ticket';
import { ErrorHandler } from '../../../common/utils/errorHandler';
import Button from '../../../common/components/ui/Button';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  ticketType: TicketTypeSummary | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function JoinTicketWaitlistModal({ visible, eventId, ticketType, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors, disabledButtonBackground } = useTheme();
  const text = colors.text;

  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const maxQuantity = useMemo(() => {
    const maxPerPerson = ticketType?.maxPerPerson ?? 50;
    return Math.max(1, Math.min(maxPerPerson, 50));
  }, [ticketType?.maxPerPerson]);

  const resetState = useCallback(() => {
    setQuantity(1);
    setError(null);
    setSuccess(false);
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (!visible) {
      resetState();
    }
  }, [resetState, visible]);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const handleSubmit = useCallback(async () => {
    if (!ticketType) return;
    setSubmitting(true);
    setError(null);

    try {
      await ticketService.joinWaitlist(eventId, {
        ticketTypeId: ticketType.id,
        quantity,
      });
      setSuccess(true);
      onSuccess();
    } catch (err) {
      setError(t('FailedToJoinWaitlist'));
      ErrorHandler.handle(err, 'joinTicketWaitlist');
    } finally {
      setSubmitting(false);
    }
  }, [eventId, onSuccess, quantity, t, ticketType]);

  const modalPaddingBottom = Math.max(insets.bottom, 20);

  if (!ticketType) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
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
              <View>
                <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {t('JoinWaitlist')}
                </Text>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                  {ticketType.name}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
              >
                <X size={18} color={text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <View className="px-xl">
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

                  <View className="mb-xl">
                    <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
                      {t('Quantity')}
                    </Text>
                    <View className="flex-row items-center justify-between rounded-lg border px-md py-sm border-light-border-strong dark:border-dark-border-strong bg-light-surface-subtle dark:bg-dark-surface-muted">
                      <TouchableOpacity
                        onPress={() => setQuantity(prev => Math.max(1, prev - 1))}
                        disabled={quantity <= 1}
                        className={`w-8 h-8 rounded-full items-center justify-center ${quantity > 1 ? 'border border-txt-primary dark:border-txt-dark-primary' : ''}`}
                        style={quantity <= 1 ? { backgroundColor: disabledButtonBackground } : undefined}
                      >
                        <Minus size={14} color={quantity > 1 ? colors.text.primary : colors.text.tertiary} strokeWidth={2} />
                      </TouchableOpacity>

                      <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary min-w-[32px] text-center">
                        {quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() => setQuantity(prev => Math.min(maxQuantity, prev + 1))}
                        disabled={quantity >= maxQuantity}
                        className="w-8 h-8 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: quantity < maxQuantity ? colors.text.primary : disabledButtonBackground,
                        }}
                      >
                        <Plus size={14} color={quantity < maxQuantity ? colors.text.inverse : colors.text.tertiary} strokeWidth={2} />
                      </TouchableOpacity>
                    </View>
                    {ticketType.maxPerPerson ? (
                      <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                        {t('MaxTicketsPerPerson')}: {ticketType.maxPerPerson}
                      </Text>
                    ) : null}
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
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
