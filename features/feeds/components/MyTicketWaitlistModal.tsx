import React, { useCallback, useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CheckCircle, Clock, X, XCircle } from 'lucide-react-native';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { ticketService } from '../../../core/tickets/services/ticket';
import {
  TicketWaitlistEntryResponse,
  TicketWaitlistStatus,
} from '../../../core/tickets/types/ticket';
import { ErrorHandler } from '../../../common/utils/errorHandler';
import { dateUtils } from '../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../common/utils/constants';
import { ConfirmModal } from '../../../common/components/ui/ConfirmModal';
import { useTheme } from '../../../common/theme/ThemeProvider';

type Props = {
  visible: boolean;
  eventId: string;
  onClose: () => void;
};

const StatusPill = ({ status }: { status: TicketWaitlistStatus }) => {
  const { t } = useI18n();
  const containerClassBase = 'px-sm py-[2px] rounded-full border';
  let containerClass = `${containerClassBase} bg-light-border dark:bg-dark-border border-light-border dark:border-dark-border`;
  let textClass = 'text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary';

  if (status === TicketWaitlistStatus.FULFILLED) {
    containerClass = `${containerClassBase} bg-semantic-success-light dark:bg-semantic-success/20 border-semantic-success`;
    textClass = 'text-xs font-medium text-semantic-success';
  } else if (status === TicketWaitlistStatus.WAITING) {
    containerClass = `${containerClassBase} bg-semantic-warning-light dark:bg-semantic-warning/20 border-semantic-warning`;
    textClass = 'text-xs font-medium text-semantic-warning';
  } else if (status === TicketWaitlistStatus.CANCELLED) {
    containerClass = `${containerClassBase} bg-semantic-error-light dark:bg-semantic-error/20 border-semantic-error`;
    textClass = 'text-xs font-medium text-semantic-error';
  }

  const statusLabels: Record<TicketWaitlistStatus, string> = {
    [TicketWaitlistStatus.WAITING]: t('Waiting'),
    [TicketWaitlistStatus.FULFILLED]: t('Fulfilled'),
    [TicketWaitlistStatus.CANCELLED]: t('Cancelled'),
  };

  return (
    <View className={containerClass}>
      <Text className={textClass}>{statusLabels[status] || status}</Text>
    </View>
  );
};

export function MyTicketWaitlistModal({ visible, eventId, onClose }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;

  const [entries, setEntries] = useState<TicketWaitlistEntryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchEntries = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await ticketService.listMyWaitlist(eventId);
      setEntries(data || []);
    } catch (err) {
      setError(t('FailedToLoadWaitlistEntries'));
      ErrorHandler.handle(err, 'listMyWaitlist');
    } finally {
      setLoading(false);
    }
  }, [eventId, t]);

  useEffect(() => {
    if (visible) {
      fetchEntries();
    } else {
      setEntries([]);
      setError(null);
    }
  }, [visible, fetchEntries]);

  const handleCancel = useCallback(async () => {
    if (!selectedEntryId || !eventId) return;
    setIsProcessing(true);
    setShowCancelConfirm(false);

    try {
      await ticketService.cancelWaitlistEntry(eventId, selectedEntryId);
      await fetchEntries();
    } catch (err) {
      ErrorHandler.handle(err, 'cancelWaitlistEntry');
    } finally {
      setIsProcessing(false);
      setSelectedEntryId(null);
    }
  }, [eventId, fetchEntries, selectedEntryId]);

  const modalPaddingBottom = Math.max(insets.bottom, 20);

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        transparent
        onRequestClose={onClose}
      >
        <View className="flex-1 bg-light-overlay dark:bg-dark-overlay justify-end">
          <View
            className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-xl max-h-[80%]"
            style={{ paddingBottom: modalPaddingBottom }}
          >
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('MyTicketWaitlist')}
              </Text>
              <TouchableOpacity
                onPress={onClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
              >
                <X size={18} color={text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-xl" showsVerticalScrollIndicator={false}>
              {loading && (
                <View className="py-2xl items-center">
                  <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
                    {t('LoadingWaitlist')}
                  </Text>
                </View>
              )}

              {error && !loading && (
                <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                  <Text className="text-sm text-semantic-error">{error}</Text>
                </View>
              )}

              {!loading && !error && entries.length === 0 && (
                <View className="py-2xl items-center">
                  <Clock size={32} color={text.tertiary} strokeWidth={1.5} />
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                    {t('NoWaitlistEntries')}
                  </Text>
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center">
                    {t('YouHaveNoWaitlistEntries')}
                  </Text>
                </View>
              )}

              {!loading && entries.length > 0 && (
                <View>
                  {entries.map(entry => {
                    const canCancel = entry.status === TicketWaitlistStatus.WAITING;
                    return (
                      <View
                        key={entry.id}
                        className="rounded-lg border p-md mb-sm bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                      >
                        <View className="flex-row items-start justify-between mb-sm">
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                              {entry.ticketTypeName || t('UnknownTicketType')}
                            </Text>
                            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                              {entry.quantity} {t('Tickets')}
                            </Text>
                            {entry.createdAt && (
                              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                                {dateUtils.formatDate(entry.createdAt, DATE_FORMATS.DISPLAY_DATETIME)}
                              </Text>
                            )}
                            {entry.fulfilledAt && (
                              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                                {t('FulfilledAt')} {dateUtils.formatDate(entry.fulfilledAt, DATE_FORMATS.DISPLAY_DATETIME)}
                              </Text>
                            )}
                          </View>
                          <StatusPill status={entry.status} />
                        </View>

                        {entry.status === TicketWaitlistStatus.FULFILLED && (
                          <View className="flex-row items-center gap-sm">
                            <CheckCircle size={12} color={colors.semantic.success} strokeWidth={2} />
                            <Text className="text-xs text-semantic-success">
                              {t('Fulfilled')}
                            </Text>
                          </View>
                        )}

                        {entry.status === TicketWaitlistStatus.CANCELLED && (
                          <View className="flex-row items-center gap-sm">
                            <XCircle size={12} color={colors.semantic.error} strokeWidth={2} />
                            <Text className="text-xs text-semantic-error">
                              {t('Cancelled')}
                            </Text>
                          </View>
                        )}

                        {canCancel && (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedEntryId(entry.id);
                              setShowCancelConfirm(true);
                            }}
                            className="flex-row items-center justify-center gap-xs py-sm rounded-lg border border-semantic-error mt-sm"
                          >
                            <XCircle size={14} color={colors.semantic.error} strokeWidth={2.2} />
                            <Text className="text-xs font-semibold text-semantic-error">
                              {t('CancelEntry')}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={showCancelConfirm}
        title={t('CancelWaitlistEntry')}
        message={t('CancelWaitlistEntryConfirm')}
        confirmLabel={t('CancelEntry')}
        cancelLabel={t('Cancel')}
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleCancel}
        onCancel={() => {
          setShowCancelConfirm(false);
          setSelectedEntryId(null);
        }}
      />
    </>
  );
}
