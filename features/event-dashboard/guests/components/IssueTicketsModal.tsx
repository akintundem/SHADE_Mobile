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
  User,
  Mail,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { ticketService } from '../../../../core/tickets/services/ticket';
import { IssueTicketRequest, TicketTypeResponse } from '../../../../core/tickets/types/ticket';
import Button from '../../../../common/components/ui/Button';
import { useTheme, useSwitchTrackColors } from '../../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  ticketTypes: TicketTypeResponse[];
  onClose: () => void;
  onSuccess: () => void;
};

type TicketRequestForm = {
  id: string;
  ticketTypeId: string;
  attendeeId?: string;
  ownerEmail: string;
  ownerName: string;
  quantity: string;
  sendEmail: boolean;
  sendPush: boolean;
};

export function IssueTicketsModal({
  visible,
  eventId,
  ticketTypes,
  onClose,
  onSuccess,
}: Props) {
  const { colors, spacing } = useTheme();
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const switchTrackColor = useSwitchTrackColors();

  const createEmptyRequest = useCallback(
    (suffix: string): TicketRequestForm => ({
      id: `request-${suffix}`,
      ticketTypeId: ticketTypes[0]?.id || '',
      ownerEmail: '',
      ownerName: '',
      quantity: '1',
      sendEmail: true,
      sendPush: false,
    }),
    [ticketTypes]
  );

  const [requests, setRequests] = useState<TicketRequestForm[]>([createEmptyRequest('0')]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestChange = useCallback(
    (id: string, key: keyof TicketRequestForm, value: string | boolean) => {
      setRequests(prev =>
        prev.map(r => (r.id === id ? { ...r, [key]: value } as TicketRequestForm : r))
      );
    },
    []
  );

  const handleAddRequest = useCallback(() => {
    setRequests(prev => [...prev, createEmptyRequest(String(prev.length))]);
  }, [createEmptyRequest]);

  const handleRemoveRequest = useCallback((id: string) => {
    setRequests(prev => (prev.length > 1 ? prev.filter(r => r.id !== id) : prev));
  }, []);

  const resetForm = useCallback(() => {
    setRequests([createEmptyRequest('0')]);
    setError(null);
  }, [createEmptyRequest]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    setError(null);

    const ticketRequests: IssueTicketRequest[] = [];

    for (const req of requests) {
      if (!req.ticketTypeId) {
        setError(t('TicketTypeRequired'));
        return;
      }

      if (!req.ownerEmail.trim() && !req.attendeeId) {
        setError(t('OwnerEmailOrAttendeeRequired'));
        return;
      }

      if (!req.ownerName.trim() && !req.attendeeId) {
        setError(t('OwnerNameRequired'));
        return;
      }

      const quantity = parseInt(req.quantity, 10);
      if (isNaN(quantity) || quantity < 1 || quantity > 50) {
        setError(t('InvalidQuantity'));
        return;
      }

      ticketRequests.push({
        eventId,
        ticketTypeId: req.ticketTypeId,
        attendeeId: req.attendeeId || null,
        ownerEmail: req.ownerEmail.trim() || null,
        ownerName: req.ownerName.trim() || null,
        quantity,
        sendEmail: req.sendEmail,
        sendPushNotification: req.sendPush,
      });
    }

    setIsSubmitting(true);

    try {
      await ticketService.issueTickets(ticketRequests);
      resetForm();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(t('FailedToIssueTicket'));
      ErrorHandler.handle(err, 'issueTickets');
    } finally {
      setIsSubmitting(false);
    }
  }, [requests, eventId, t, resetForm, onSuccess, onClose]);

  const selectedTicketTypeName = useCallback(
    (ticketTypeId: string) => {
      const type = ticketTypes.find(tt => tt.id === ticketTypeId);
      return type?.name || '';
    },
    [ticketTypes]
  );

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
            style={{ paddingBottom: Math.max(insets.bottom, spacing.xl) }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <Text
                className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary"
              >
                {t('IssueTickets')}
              </Text>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
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

              {requests.map((req, index) => (
                <View
                  key={req.id}
                  className="mb-lg rounded-lg border p-md bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                >
                  <View className="flex-row items-center justify-between mb-sm">
                    <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                      {t('Ticket')} #{index + 1}
                    </Text>
                    {requests.length > 1 && (
                      <TouchableOpacity onPress={() => handleRemoveRequest(req.id)}>
                        <Trash2 size={16} color={colors.semantic.error} strokeWidth={2.2} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Ticket Type */}
                  <View className="mb-sm">
                    <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-xs">
                      {t('TicketType')} *
                    </Text>
                    <View className="flex-row items-center rounded-lg px-md py-sm border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                      <Ticket size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                      <Text className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary">
                        {selectedTicketTypeName(req.ticketTypeId) || t('SelectTicketType')}
                      </Text>
                    </View>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      className="mt-xs"
                    >
                      {ticketTypes.map(tt => (
                        <TouchableOpacity
                          key={tt.id}
                          onPress={() => handleRequestChange(req.id, 'ticketTypeId', tt.id)}
                          className={`px-sm py-xs mr-xs rounded-full border ${
                            req.ticketTypeId === tt.id
                              ? 'bg-brand-primary border-brand-primary'
                              : 'bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted'
                          }`}
                        >
                          <Text
                            className={`text-xs font-medium ${
                              req.ticketTypeId === tt.id
                                ? 'text-txt-inverse'
                                : 'text-txt-primary dark:text-txt-dark-primary'
                            }`}
                          >
                            {tt.name}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  {/* Owner Name */}
                  <View className="mb-sm">
                    <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-xs">
                      {t('OwnerName')} *
                    </Text>
                    <View className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                      <User size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                      <TextInput
                        value={req.ownerName}
                        onChangeText={(text) => handleRequestChange(req.id, 'ownerName', text)}
                        placeholder={t('EnterOwnerName')}
                        placeholderTextColor={colors.text.tertiary}
                        className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-sm"
                      />
                    </View>
                  </View>

                  {/* Owner Email */}
                  <View className="mb-sm">
                    <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-xs">
                      {t('OwnerEmail')} *
                    </Text>
                    <View className="flex-row items-center rounded-lg px-md border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted">
                      <Mail size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                      <TextInput
                        value={req.ownerEmail}
                        onChangeText={(text) => handleRequestChange(req.id, 'ownerEmail', text)}
                        placeholder={t('EnterOwnerEmail')}
                        placeholderTextColor={colors.text.tertiary}
                        className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary py-sm"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  {/* Quantity */}
                  <View className="mb-sm">
                    <Text className="text-xs font-medium uppercase tracking-[0.5px] text-txt-secondary dark:text-txt-dark-secondary mb-xs">
                      {t('Quantity')} *
                    </Text>
                    <TextInput
                      value={req.quantity}
                      onChangeText={(text) => handleRequestChange(req.id, 'quantity', text.replace(/[^0-9]/g, ''))}
                      placeholder="1"
                      placeholderTextColor={colors.text.tertiary}
                      className="rounded-lg px-md py-sm border border-[0.5px] bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted text-sm text-txt-primary dark:text-txt-dark-primary"
                      keyboardType="number-pad"
                    />
                  </View>

                  {/* Send Email Toggle */}
                  <View className="flex-row items-center justify-between mb-sm">
                    <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                      {t('SendTicketByEmail')}
                    </Text>
                    <Switch
                      value={req.sendEmail}
                      onValueChange={(val) => handleRequestChange(req.id, 'sendEmail', val)}
                      trackColor={{
                        false: switchTrackColor.false,
                        true: switchTrackColor.true,
                      }}
                      thumbColor={colors.background}
                    />
                  </View>

                  {/* Send Push Toggle */}
                  <View className="flex-row items-center justify-between">
                    <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                      {t('SendPushNotification')}
                    </Text>
                    <Switch
                      value={req.sendPush}
                      onValueChange={(val) => handleRequestChange(req.id, 'sendPush', val)}
                      trackColor={{
                        false: switchTrackColor.false,
                        true: switchTrackColor.true,
                      }}
                      thumbColor={colors.background}
                    />
                  </View>
                </View>
              ))}

              {/* Add Another Button */}
              <TouchableOpacity
                onPress={handleAddRequest}
                className="flex-row items-center justify-center gap-xs py-md rounded-lg border border-[0.5px] bg-light-surface-subtle dark:bg-dark-surface-muted border-light-border dark:border-dark-border-strong mb-lg"
              >
                <Plus size={16} color={colors.text.primary} strokeWidth={2.4} />
                <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {t('AddAnotherTicket')}
                </Text>
              </TouchableOpacity>

              {/* Submit Button */}
              <View className="mb-lg">
                <Button
                  variant="primary"
                  size="lg"
                  onPress={handleSubmit}
                  disabled={isSubmitting || ticketTypes.length === 0}
                  leftIcon={<Ticket size={18} color={colors.text.inverse} strokeWidth={2.2} />}
                >
                  {isSubmitting ? t('Issuing') : t('IssueTickets')}
                </Button>
              </View>
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
