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
  TicketApprovalRequestResponse,
  TicketApprovalStatus,
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

const StatusPill = ({ status }: { status: TicketApprovalStatus }) => {
  const { t } = useI18n();
  const containerClassBase = 'px-sm py-[2px] rounded-full border';
  let containerClass = `${containerClassBase} bg-light-border dark:bg-dark-border border-light-border dark:border-dark-border`;
  let textClass = 'text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary';

  if (status === TicketApprovalStatus.APPROVED) {
    containerClass = `${containerClassBase} bg-semantic-success-light dark:bg-semantic-success/20 border-semantic-success`;
    textClass = 'text-xs font-medium text-semantic-success';
  } else if (status === TicketApprovalStatus.PENDING) {
    containerClass = `${containerClassBase} bg-semantic-warning-light dark:bg-semantic-warning/20 border-semantic-warning`;
    textClass = 'text-xs font-medium text-semantic-warning';
  } else if (status === TicketApprovalStatus.REJECTED) {
    containerClass = `${containerClassBase} bg-semantic-error-light dark:bg-semantic-error/20 border-semantic-error`;
    textClass = 'text-xs font-medium text-semantic-error';
  }

  const statusLabels: Record<TicketApprovalStatus, string> = {
    [TicketApprovalStatus.PENDING]: t('Pending'),
    [TicketApprovalStatus.APPROVED]: t('Approved'),
    [TicketApprovalStatus.REJECTED]: t('Rejected'),
    [TicketApprovalStatus.CANCELLED]: t('Cancelled'),
  };

  return (
    <View className={containerClass}>
      <Text className={textClass}>{statusLabels[status] || status}</Text>
    </View>
  );
};

export function MyTicketRequestsModal({ visible, eventId, onClose }: Props) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const text = colors.text;

  const [requests, setRequests] = useState<TicketApprovalRequestResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchRequests = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await ticketService.listMyApprovalRequests(eventId);
      setRequests(data || []);
    } catch (err) {
      setError(t('FailedToLoadApprovalRequests'));
      ErrorHandler.handle(err, 'listMyApprovalRequests');
    } finally {
      setLoading(false);
    }
  }, [eventId, t]);

  useEffect(() => {
    if (visible) {
      fetchRequests();
    } else {
      setRequests([]);
      setError(null);
    }
  }, [visible, fetchRequests]);

  const handleCancel = useCallback(async () => {
    if (!selectedRequestId || !eventId) return;
    setIsProcessing(true);
    setShowCancelConfirm(false);

    try {
      await ticketService.cancelApprovalRequest(eventId, selectedRequestId);
      await fetchRequests();
    } catch (err) {
      ErrorHandler.handle(err, 'cancelApprovalRequest');
    } finally {
      setIsProcessing(false);
      setSelectedRequestId(null);
    }
  }, [eventId, fetchRequests, selectedRequestId]);

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
                {t('MyTicketRequests')}
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
                    {t('LoadingApprovalRequests')}
                  </Text>
                </View>
              )}

              {error && !loading && (
                <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                  <Text className="text-sm text-semantic-error">{error}</Text>
                </View>
              )}

              {!loading && !error && requests.length === 0 && (
                <View className="py-2xl items-center">
                  <Clock size={32} color={text.tertiary} strokeWidth={1.5} />
                  <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                    {t('NoTicketRequests')}
                  </Text>
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center">
                    {t('TicketRequestsWillAppearHere')}
                  </Text>
                </View>
              )}

              {!loading && requests.length > 0 && (
                <View>
                  {requests.map(request => {
                    const canCancel = request.status === TicketApprovalStatus.PENDING;
                    return (
                      <View
                        key={request.id}
                        className="rounded-lg border p-md mb-sm bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                      >
                        <View className="flex-row items-start justify-between mb-sm">
                          <View className="flex-1">
                            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                              {request.ticketTypeName || t('UnknownTicketType')}
                            </Text>
                            <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                              {request.quantity} {t('Tickets')}
                            </Text>
                            {request.createdAt && (
                              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                                {dateUtils.formatDate(request.createdAt, DATE_FORMATS.DISPLAY_DATETIME)}
                              </Text>
                            )}
                            {request.decisionNote && (
                              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                                {request.decisionNote}
                              </Text>
                            )}
                          </View>
                          <StatusPill status={request.status} />
                        </View>
                        {request.status === TicketApprovalStatus.APPROVED && (
                          <View className="flex-row items-center gap-sm">
                            <CheckCircle size={12} color={colors.semantic.success} strokeWidth={2} />
                            <Text className="text-xs text-semantic-success">
                              {t('Approved')}
                            </Text>
                          </View>
                        )}
                        {request.status === TicketApprovalStatus.REJECTED && (
                          <View className="flex-row items-center gap-sm">
                            <XCircle size={12} color={colors.semantic.error} strokeWidth={2} />
                            <Text className="text-xs text-semantic-error">
                              {t('Rejected')}
                            </Text>
                          </View>
                        )}
                        {canCancel && (
                          <TouchableOpacity
                            onPress={() => {
                              setSelectedRequestId(request.id);
                              setShowCancelConfirm(true);
                            }}
                            className="flex-row items-center justify-center gap-xs py-sm rounded-lg border border-semantic-error mt-sm"
                          >
                            <XCircle size={14} color={colors.semantic.error} strokeWidth={2.2} />
                            <Text className="text-xs font-semibold text-semantic-error">
                              {t('CancelRequest')}
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
        title={t('CancelRequest')}
        message={t('CancelRequestConfirm')}
        confirmLabel={t('CancelRequest')}
        cancelLabel={t('Cancel')}
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleCancel}
        onCancel={() => {
          setShowCancelConfirm(false);
          setSelectedRequestId(null);
        }}
      />
    </>
  );
}
