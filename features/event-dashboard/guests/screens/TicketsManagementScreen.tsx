import React, { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  DollarSign,
  Plus,
  QrCode,
  Search,
  ShoppingCart,
  Tag,
  Ticket,
  X,
  XCircle,
  MoreVertical,
  Edit,
  Copy,
  Archive,
  Trash2,
  RotateCcw,
  Send,
  CheckCircle,
  Clock,
  FileText,
  Layers,
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { LoadingOverlay, EmptyState } from '../../../../common/components/LoadingStates';
import { ScreenHeader } from '../../../../common/components/ScreenHeader';
import { TicketResponse, TicketStatus, TicketTypeResponse } from '../../../../core/tickets/types/ticket';
import { CreateTicketTypeModal } from '../components/CreateTicketTypeModal';
import { EditTicketTypeModal } from '../components/EditTicketTypeModal';
import { IssueTicketsModal } from '../components/IssueTicketsModal';
import { BulkTicketActionsModal } from '../components/BulkTicketActionsModal';
import { TicketTypeTemplatesModal } from '../components/TicketTypeTemplatesModal';
import { TicketDetailModal } from '../components/TicketDetailModal';
import { TicketCheckInModal } from '../components/TicketCheckInModal';
import { SectionLabel, StatPill, TicketRow, TicketTypeRow } from '../components';
import { ActionSheet } from '../../../../common/components/ui/ActionSheet';
import { ConfirmModal } from '../../../../common/components/ui/ConfirmModal';
import Button from '../../../../common/components/ui/Button';
import { useEventDashboardFlow, useEventDashboardRoute } from '../../hooks';
import { useEventPermissions } from '../../hooks/useEventPermissions';
import { useTicketsData } from '../hooks';
import { ticketService } from '../../../../core/tickets/services/ticket';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { useTheme } from '../../../../common/theme/ThemeProvider';
import type { UserEventContext } from '../../../../core/events/types/event';

type Params = { eventId?: string; userContext?: UserEventContext | null };

type IconType = React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;

export function TicketsManagementScreen() {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { eventId, params } = useEventDashboardRoute<Params>();
  const { goBack } = useEventDashboardFlow(eventId);
  const { colors } = useTheme();
  const permissions = useEventPermissions(params.userContext);
  const refreshTint = colors.text.primary;

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateTicketTypeModal, setShowCreateTicketTypeModal] = useState(false);
  const [showIssueTicketsModal, setShowIssueTicketsModal] = useState(false);
  const [showEditTicketTypeModal, setShowEditTicketTypeModal] = useState(false);
  const [showBulkActionsModal, setShowBulkActionsModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState<TicketResponse[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<TicketResponse | null>(null);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeResponse | null>(null);
  const [showTicketTypeActionSheet, setShowTicketTypeActionSheet] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showHardDeleteConfirm, setShowHardDeleteConfirm] = useState(false);
  const [showTicketDetailModal, setShowTicketDetailModal] = useState(false);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { tickets, ticketTypes, loading, error, refresh } = useTicketsData(eventId);
  const { goToTicketApprovals, goToTicketWaitlist } = useEventDashboardFlow(eventId);

  const onRefresh = useCallback(async () => {
    if (!eventId) return;
    setRefreshing(true);
    await refresh(true);
    setRefreshing(false);
  }, [eventId, refresh]);

  const soldCount = useMemo(
    () => tickets.filter(t => t.status === TicketStatus.ISSUED || t.status === TicketStatus.VALIDATED).length,
    [tickets],
  );

  const validatedCount = useMemo(
    () => tickets.filter(t => t.status === TicketStatus.VALIDATED).length,
    [tickets],
  );

  const totalRevenueMinor = useMemo(() => {
    let revenue = 0;
    ticketTypes.forEach(tt => {
      if (tt.priceMinor && tt.quantitySold) {
        revenue += tt.priceMinor * tt.quantitySold;
      }
    });
    return revenue;
  }, [ticketTypes]);

  const formatCurrency = useCallback(
    (priceMinor: number | null | undefined, currency: string | null | undefined) => {
      if (!priceMinor) return t('Free');
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(priceMinor / 100);
    },
    [t],
  );

  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const query = searchQuery.toLowerCase();
    return tickets.filter(
      ticket =>
        ticket.ticketNumber?.toLowerCase().includes(query) ||
        ticket.attendeeName?.toLowerCase().includes(query) ||
        ticket.attendeeEmail?.toLowerCase().includes(query) ||
        ticket.ticketTypeName?.toLowerCase().includes(query),
    );
  }, [tickets, searchQuery]);

  const bottomGutter = useMemo(
    () => Math.max(16, Math.min(insets.bottom, 20)),
    [insets.bottom],
  );

  const handleTicketTypeAction = useCallback((ticketType: TicketTypeResponse) => {
    setSelectedTicketType(ticketType);
    setShowTicketTypeActionSheet(true);
  }, []);

  const handleActionSheetSelect = useCallback(
    async (actionId: string) => {
      if (!selectedTicketType || !eventId) return;

      setShowTicketTypeActionSheet(false);

      switch (actionId) {
        case 'edit':
          setShowEditTicketTypeModal(true);
          break;
        case 'clone':
          setIsProcessing(true);
          try {
            await ticketService.cloneTicketType(eventId, selectedTicketType.id);
            await refresh(true);
          } catch (err) {
            ErrorHandler.handle(err, 'cloneTicketType');
          } finally {
            setIsProcessing(false);
          }
          break;
        case 'archive':
          setShowArchiveConfirm(true);
          break;
        case 'restore':
          setIsProcessing(true);
          try {
            await ticketService.restoreTicketType(eventId, selectedTicketType.id);
            await refresh(true);
          } catch (err) {
            ErrorHandler.handle(err, 'restoreTicketType');
          } finally {
            setIsProcessing(false);
          }
          break;
        case 'delete':
          setShowDeleteConfirm(true);
          break;
        case 'hardDelete':
          setShowHardDeleteConfirm(true);
          break;
      }
    },
    [selectedTicketType, eventId, refresh],
  );

  const handleDelete = useCallback(async () => {
    if (!selectedTicketType || !eventId) return;
    setIsProcessing(true);
    setShowDeleteConfirm(false);
    try {
      await ticketService.deleteTicketType(eventId, selectedTicketType.id);
      await refresh(true);
    } catch (err) {
      ErrorHandler.handle(err, 'deleteTicketType');
    } finally {
      setIsProcessing(false);
      setSelectedTicketType(null);
    }
  }, [selectedTicketType, eventId, refresh]);

  const handleArchive = useCallback(async () => {
    if (!selectedTicketType || !eventId) return;
    setIsProcessing(true);
    setShowArchiveConfirm(false);
    try {
      await ticketService.archiveTicketType(eventId, selectedTicketType.id);
      await refresh(true);
    } catch (err) {
      ErrorHandler.handle(err, 'archiveTicketType');
    } finally {
      setIsProcessing(false);
      setSelectedTicketType(null);
    }
  }, [selectedTicketType, eventId, refresh]);

  const handleHardDelete = useCallback(async () => {
    if (!selectedTicketType || !eventId) return;
    setIsProcessing(true);
    setShowHardDeleteConfirm(false);
    try {
      await ticketService.hardDeleteTicketType(eventId, selectedTicketType.id);
      await refresh(true);
    } catch (err) {
      ErrorHandler.handle(err, 'hardDeleteTicketType');
    } finally {
      setIsProcessing(false);
      setSelectedTicketType(null);
    }
  }, [selectedTicketType, eventId, refresh]);

  const ticketTypeActionOptions = useMemo(() => {
    if (!selectedTicketType) return [];
    const isActive = selectedTicketType.isActive !== false;
    const options: { id: string; label: string; icon: IconType; destructive?: boolean }[] = [
      { id: 'edit', label: t('Edit'), icon: Edit },
      { id: 'clone', label: t('Clone'), icon: Copy },
    ];
    if (isActive) {
      options.push({ id: 'archive', label: t('Archive'), icon: Archive });
    } else {
      options.push({ id: 'restore', label: t('Restore'), icon: RotateCcw });
    }
    options.push(
      { id: 'delete', label: t('Delete'), icon: Trash2, destructive: true },
      { id: 'hardDelete', label: t('HardDelete'), icon: Trash2, destructive: true },
    );
    return options;
  }, [selectedTicketType, t]);

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
    return <LoadingOverlay visible={true} message={t('LoadingTickets')} />;
  }

  if (error && tickets.length === 0 && ticketTypes.length === 0) {
    return (
      <View className="flex-1 bg-light-background dark:bg-dark-background">
        <View className="flex-1" style={{ paddingBottom: bottomGutter }}>
          <EmptyState
            title={t('FailedToLoadTickets')}
            subtitle={error?.message || t('SomethingWentWrong')}
            action={{ label: t('TryAgain'), onPress: () => refresh(true) }}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      <ScreenHeader
        title={t('Tickets')}
        leftAction={{
          icon: ChevronLeft,
          onPress: goBack,
          size: 32,
        }}
        rightAction={
          permissions.canEditTickets
            ? { icon: Plus, onPress: () => setShowCreateTicketTypeModal(true), size: 32, variant: 'filled' }
            : undefined
        }
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
            <View className="mb-xl">
              <Text className="text-xl font-semibold text-txt-primary dark:text-txt-dark-primary mb-sm">
                {t('Tickets')}
              </Text>
              <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary leading-relaxed">
                {t('TicketsSubtitleUpdated')}
              </Text>
            </View>

            <View className="flex-row flex-wrap mb-xl gap-md">
              <StatPill icon={Tag} label={t('Types')} value={ticketTypes.length} />
              <StatPill icon={ShoppingCart} label={t('Sold')} value={soldCount} />
              <StatPill icon={QrCode} label={t('Validated')} value={validatedCount} />
              {totalRevenueMinor > 0 && (
                <StatPill icon={DollarSign} label={t('Revenue')} value={formatCurrency(totalRevenueMinor, 'USD')} />
              )}
            </View>

            <View className="flex-row items-center rounded-lg border px-md py-sm bg-light-surface-soft dark:bg-dark-surface-soft border-light-border-strong dark:border-dark-border-strong">
              <Search size={16} color={colors.text.tertiary} strokeWidth={2.2} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('SearchTickets')}
                placeholderTextColor={colors.text.tertiary}
                className="flex-1 ml-sm text-sm text-txt-primary dark:text-txt-dark-primary"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={16} color={colors.text.tertiary} strokeWidth={2.2} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quick Actions */}
          {permissions.canEditTickets && (
            <View className="mb-2xl">
              <SectionLabel label={t('QuickActions')} />
              <View className="flex-row flex-wrap gap-sm">
                <TouchableOpacity
                  onPress={() => setShowCheckInModal(true)}
                  className="flex-1 min-w-[140px] flex-row items-center justify-center gap-xs px-md py-sm rounded-lg border bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                >
                  <QrCode size={14} color={colors.text.primary} strokeWidth={2.5} />
                  <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {t('TicketCheckIn')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowIssueTicketsModal(true)}
                  className="flex-1 min-w-[140px] flex-row items-center justify-center gap-xs px-md py-sm rounded-lg border bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                  disabled={ticketTypes.length === 0}
                >
                  <Send size={14} color={colors.text.primary} strokeWidth={2.5} />
                  <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {t('IssueTickets')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedTickets(
                      filteredTickets.filter(
                        t => t.status === TicketStatus.ISSUED || t.status === TicketStatus.PENDING,
                      ),
                    );
                    setShowBulkActionsModal(true);
                  }}
                  className="flex-1 min-w-[140px] flex-row items-center justify-center gap-xs px-md py-sm rounded-lg border bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                  disabled={filteredTickets.length === 0}
                >
                  <Layers size={14} color={colors.text.primary} strokeWidth={2.5} />
                  <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {t('BulkActions')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setShowTemplatesModal(true)}
                  className="flex-1 min-w-[140px] flex-row items-center justify-center gap-xs px-md py-sm rounded-lg border bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
                >
                  <FileText size={14} color={colors.text.primary} strokeWidth={2.5} />
                  <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {t('Templates')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Management Sections */}
          <View className="mb-2xl">
            <SectionLabel label={t('Management')} />
            <View className="gap-sm">
              <TouchableOpacity
                onPress={goToTicketApprovals}
                className="flex-row items-center justify-between p-md rounded-lg border bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
              >
                <View className="flex-row items-center gap-sm">
                  <CheckCircle size={18} color={colors.text.primary} strokeWidth={2.2} />
                  <View>
                    <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                      {t('TicketApprovals')}
                    </Text>
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      {t('ManageApprovalRequests')}
                    </Text>
                  </View>
                </View>
                <ChevronLeft
                  size={18}
                  color={colors.text.tertiary}
                  strokeWidth={2.2}
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={goToTicketWaitlist}
                className="flex-row items-center justify-between p-md rounded-lg border bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
              >
                <View className="flex-row items-center gap-sm">
                  <Clock size={18} color={colors.text.primary} strokeWidth={2.2} />
                  <View>
                    <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                      {t('TicketWaitlist')}
                    </Text>
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                      {t('ManageWaitlistEntries')}
                    </Text>
                  </View>
                </View>
                <ChevronLeft
                  size={18}
                  color={colors.text.tertiary}
                  strokeWidth={2.2}
                  style={{ transform: [{ rotate: '180deg' }] }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-2xl">
            <View className="flex-row items-center justify-between mb-lg">
              <SectionLabel label={t('TicketTypes')} />
              {permissions.canEditTickets && (
                <TouchableOpacity
                  onPress={() => setShowCreateTicketTypeModal(true)}
                  className="flex-row items-center gap-xs"
                >
                  <Plus size={14} color={colors.text.primary} strokeWidth={2.5} />
                  <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {t('CreateNew')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {ticketTypes.length === 0 ? (
              <View className="rounded-xl border p-xl items-center bg-light-surface-subtle dark:bg-dark-surface-muted border-light-border-subtle dark:border-dark-border-subtle">
                <Tag size={24} color={colors.text.tertiary} strokeWidth={1.5} />
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mt-md mb-xs">
                  {t('NoTicketTypesYet')}
                </Text>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center leading-relaxed mb-lg">
                  {t('CreateTicketTypeToStart')}
                </Text>
                {permissions.canEditTickets && (
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => setShowCreateTicketTypeModal(true)}
                    leftIcon={<Plus size={14} color={colors.text.inverse} strokeWidth={2.5} />}
                  >
                    {t('CreateTicketType')}
                  </Button>
                )}
              </View>
            ) : (
              <View>
                {ticketTypes.map((ticketType, index) => (
                  <TicketTypeRow
                    key={ticketType.id}
                    ticketType={ticketType}
                    isLast={index === ticketTypes.length - 1}
                    formatCurrency={formatCurrency}
                    onAction={permissions.canEditTickets ? handleTicketTypeAction : undefined}
                  />
                ))}
              </View>
            )}
          </View>

          <View className="mb-2xl">
            <SectionLabel label={t('PurchasedTickets')} />
            {filteredTickets.length === 0 ? (
              <View className="py-2xl items-center">
                <Ticket size={32} color={colors.text.tertiary} strokeWidth={1.5} />
                <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary mt-lg mb-xs">
                  {searchQuery ? t('NoTicketsMatchSearch') : t('NoPurchasesYet')}
                </Text>
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary text-center leading-relaxed">
                  {searchQuery ? t('TryDifferentSearch') : t('TicketsWillAppearWhenPurchased')}
                </Text>
              </View>
            ) : (
              <View>
                {filteredTickets.map((ticket, index) => (
                  <TicketRow
                    key={ticket.id}
                    ticket={ticket}
                    isLast={index === filteredTickets.length - 1}
                    onPress={() => {
                      setSelectedTicket(ticket);
                      setShowTicketDetailModal(true);
                    }}
                  />
                ))}
              </View>
            )}
          </View>

          {tickets.length > 0 && (
            <View className="rounded-xl border p-xl bg-light-surface-subtle dark:bg-dark-surface-muted border-light-border-subtle dark:border-dark-border-subtle">
              <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-lg">
                {t('SalesSummary')}
              </Text>
              <View className="flex-row flex-wrap gap-lg">
                <View className="flex-row items-center gap-sm">
                  <ShoppingCart size={14} color={colors.semantic.warning} strokeWidth={2.2} />
                  <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                    {soldCount} {t('Sold')}
                  </Text>
                </View>
                <View className="flex-row items-center gap-sm">
                  <QrCode size={14} color={colors.semantic.success} strokeWidth={2.2} />
                  <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                    {validatedCount} {t('Validated')}
                  </Text>
                </View>
                <View className="flex-row items-center gap-sm">
                  <XCircle size={14} color={colors.semantic.error} strokeWidth={2.2} />
                  <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                    {
                      tickets.filter(
                        t => t.status === TicketStatus.CANCELLED || t.status === TicketStatus.REFUNDED,
                      ).length
                    }{' '}
                    {t('CancelledOrRefunded')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {eventId && (
        <>
          <CreateTicketTypeModal
            visible={showCreateTicketTypeModal}
            eventId={eventId}
            onClose={() => setShowCreateTicketTypeModal(false)}
            onSuccess={() => refresh(true)}
          />
          <EditTicketTypeModal
            visible={showEditTicketTypeModal}
            eventId={eventId}
            ticketType={selectedTicketType}
            onClose={() => {
              setShowEditTicketTypeModal(false);
              setSelectedTicketType(null);
            }}
            onSuccess={() => refresh(true)}
          />
          <IssueTicketsModal
            visible={showIssueTicketsModal}
            eventId={eventId}
            ticketTypes={ticketTypes}
            onClose={() => setShowIssueTicketsModal(false)}
            onSuccess={() => refresh(true)}
          />
          <BulkTicketActionsModal
            visible={showBulkActionsModal}
            eventId={eventId}
            selectedTickets={selectedTickets}
            onClose={() => {
              setShowBulkActionsModal(false);
              setSelectedTickets([]);
            }}
            onSuccess={() => refresh(true)}
          />
          <TicketTypeTemplatesModal
            visible={showTemplatesModal}
            eventId={eventId}
            onClose={() => setShowTemplatesModal(false)}
            onSuccess={() => refresh(true)}
          />
          <TicketDetailModal
            visible={showTicketDetailModal}
            eventId={eventId}
            ticket={selectedTicket}
            onClose={() => {
              setShowTicketDetailModal(false);
              setSelectedTicket(null);
            }}
            onSuccess={() => refresh(true)}
          />
          <TicketCheckInModal
            visible={showCheckInModal}
            eventId={eventId}
            onClose={() => setShowCheckInModal(false)}
            onSuccess={() => refresh(true)}
          />
          <ActionSheet
            visible={showTicketTypeActionSheet}
            title={selectedTicketType?.name}
            options={ticketTypeActionOptions}
            onSelect={handleActionSheetSelect}
            onCancel={() => {
              setShowTicketTypeActionSheet(false);
              setSelectedTicketType(null);
            }}
          />
          <ConfirmModal
            visible={showDeleteConfirm}
            title={t('DeleteTicketType')}
            message={t('DeleteTicketTypeConfirm', { name: selectedTicketType?.name ?? '' })}
            confirmLabel={t('Delete')}
            cancelLabel={t('Cancel')}
            variant="danger"
            isLoading={isProcessing}
            onConfirm={handleDelete}
            onCancel={() => {
              setShowDeleteConfirm(false);
              setSelectedTicketType(null);
            }}
          />
          <ConfirmModal
            visible={showArchiveConfirm}
            title={t('ArchiveTicketType')}
            message={t('ArchiveTicketTypeConfirm', { name: selectedTicketType?.name ?? '' })}
            confirmLabel={t('Archive')}
            cancelLabel={t('Cancel')}
            variant="warning"
            isLoading={isProcessing}
            onConfirm={handleArchive}
            onCancel={() => {
              setShowArchiveConfirm(false);
              setSelectedTicketType(null);
            }}
          />
          <ConfirmModal
            visible={showHardDeleteConfirm}
            title={t('HardDeleteTicketType')}
            message={t('HardDeleteTicketTypeConfirm', { name: selectedTicketType?.name ?? '' })}
            confirmLabel={t('Delete')}
            cancelLabel={t('Cancel')}
            variant="danger"
            isLoading={isProcessing}
            onConfirm={handleHardDelete}
            onCancel={() => {
              setShowHardDeleteConfirm(false);
              setSelectedTicketType(null);
            }}
          />
        </>
      )}
    </View>
  );
}
