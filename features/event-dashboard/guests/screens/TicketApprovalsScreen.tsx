import React, { useCallback, useMemo, useState, useEffect } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, Clock, Search } from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { TicketApprovalRequestResponse } from '../../../../core/tickets/types/ticket';
import { ticketService } from '../../../../core/tickets/services/ticket';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { ConfirmModal } from '../../../../common/components/ui/ConfirmModal';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import { ApprovalRequestRow } from '../components/ApprovalRequestRow';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

export function TicketApprovalsScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const refreshTint = colors.text.primary;

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [requests, setRequests] = useState<TicketApprovalRequestResponse[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const loadRequests = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await ticketService.listApprovalRequests(eventId);
      setRequests(data.content || []);
    } catch (err) {
      setError(err as Error);
      ErrorHandler.handle(err, 'listApprovalRequests');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  }, [eventId, loadRequests]);

  const handleApprove = useCallback(async () => {
    if (!selectedRequestId || !eventId) return;
    setIsProcessing(true);
    setShowApproveConfirm(false);
    try {
      await ticketService.approveRequest(eventId, selectedRequestId);
      await loadRequests();
    } catch (err) {
      ErrorHandler.handle(err, 'approveRequest');
    } finally {
      setIsProcessing(false);
      setSelectedRequestId(null);
    }
  }, [selectedRequestId, eventId, loadRequests]);

  const handleReject = useCallback(async () => {
    if (!selectedRequestId || !eventId) return;
    setIsProcessing(true);
    setShowRejectConfirm(false);
    try {
      await ticketService.rejectRequest(eventId, selectedRequestId);
      await loadRequests();
    } catch (err) {
      ErrorHandler.handle(err, 'rejectRequest');
    } finally {
      setIsProcessing(false);
      setSelectedRequestId(null);
    }
  }, [selectedRequestId, eventId, loadRequests]);

  const handleCancel = useCallback(async () => {
    if (!selectedRequestId || !eventId) return;
    setIsProcessing(true);
    setShowCancelConfirm(false);
    try {
      await ticketService.cancelApprovalRequest(eventId, selectedRequestId);
      await loadRequests();
    } catch (err) {
      ErrorHandler.handle(err, 'cancelApprovalRequest');
    } finally {
      setIsProcessing(false);
      setSelectedRequestId(null);
    }
  }, [selectedRequestId, eventId, loadRequests]);

  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const query = searchQuery.toLowerCase();
    return requests.filter(
      req =>
        req.requesterName?.toLowerCase().includes(query) ||
        req.requesterEmail?.toLowerCase().includes(query) ||
        req.ticketTypeName?.toLowerCase().includes(query)
    );
  }, [requests, searchQuery]);

  const bottomGutter = useMemo(
    () => Math.max(16, Math.min(insets.bottom, 20)),
    [insets.bottom]
  );

  if (!eventId) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('EventNotFound')}
            subtitle={t('WeCouldNotDetermineEvent')}
            action={{ label: t('GoBack'), onPress: goBack }}
          />
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return <LoadingOverlay visible={true} message={t('LoadingApprovalRequests')} />;
  }

  if (error && requests.length === 0) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('FailedToLoadApprovalRequests')}
            subtitle={error?.message || t('SomethingWentWrong')}
            action={{ label: t('TryAgain'), onPress: () => loadRequests() }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={t('TicketApprovals')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
      />

      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={refreshTint}
            colors={[refreshTint]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View className="px-xl pt-xl" style={{ paddingBottom: bottomGutter }}>
          <View className="mb-2xl">
            <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary mb-sm">
              {t('TicketApprovals')}
            </Text>
            <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
              {t('TicketApprovalsDescription')}
            </Text>
          </View>

          <View className="flex-row items-center rounded-lg border px-md py-sm bg-light-surface-soft dark:bg-dark-surface-soft border-light-border-strong dark:border-dark-border-strong mb-xl">
            <Search size={16} color={colors.text.tertiary} strokeWidth={2.2} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('SearchApprovalRequests')}
              placeholderTextColor={colors.text.tertiary}
              className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary"
            />
          </View>

          {filteredRequests.length === 0 ? (
            <View className="py-2xl items-center">
              <Clock size={32} color={colors.text.tertiary} strokeWidth={1.5} />
              <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                {searchQuery ? t('NoApprovalRequestsMatchSearch') : t('NoApprovalRequests')}
              </Text>
              <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center">
                {searchQuery ? t('TryDifferentSearch') : t('ApprovalRequestsWillAppearHere')}
              </Text>
            </View>
          ) : (
            <View>
              {filteredRequests.map(request => (
                <ApprovalRequestRow
                  key={request.id}
                  request={request}
                  onApprove={permissions.canEditTickets ? (id) => {
                    setSelectedRequestId(id);
                    setShowApproveConfirm(true);
                  } : undefined}
                  onReject={permissions.canEditTickets ? (id) => {
                    setSelectedRequestId(id);
                    setShowRejectConfirm(true);
                  } : undefined}
                  onCancel={permissions.canEditTickets ? (id) => {
                    setSelectedRequestId(id);
                    setShowCancelConfirm(true);
                  } : undefined}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showApproveConfirm}
        title={t('ApproveRequest')}
        message={t('ApproveRequestConfirm')}
        confirmLabel={t('Approve')}
        cancelLabel={t('Cancel')}
        variant="success"
        isLoading={isProcessing}
        onConfirm={handleApprove}
        onCancel={() => {
          setShowApproveConfirm(false);
          setSelectedRequestId(null);
        }}
      />
      <ConfirmModal
        visible={showRejectConfirm}
        title={t('RejectRequest')}
        message={t('RejectRequestConfirm')}
        confirmLabel={t('Reject')}
        cancelLabel={t('Cancel')}
        variant="danger"
        isLoading={isProcessing}
        onConfirm={handleReject}
        onCancel={() => {
          setShowRejectConfirm(false);
          setSelectedRequestId(null);
        }}
      />
      <ConfirmModal
        visible={showCancelConfirm}
        title={t('CancelRequest')}
        message={t('CancelRequestConfirm')}
        confirmLabel={t('Cancel')}
        cancelLabel={t('GoBack')}
        variant="warning"
        isLoading={isProcessing}
        onConfirm={handleCancel}
        onCancel={() => {
          setShowCancelConfirm(false);
          setSelectedRequestId(null);
        }}
      />
    </View>
  );
}
