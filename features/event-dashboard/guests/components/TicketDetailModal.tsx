import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  CreditCard,
  Edit,
  RotateCcw,
  Send,
  ShoppingCart,
  Ticket,
  X,
  XCircle,
} from 'lucide-react-native';
import { useI18n } from '../../../../common/i18n/I18nProvider';
import { ErrorHandler } from '../../../../common/utils/errorHandler';
import { dateUtils } from '../../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../../common/utils/constants';
import { ticketService } from '../../../../core/tickets/services/ticket';
import {
  TicketCheckoutResponse,
  TicketCheckoutStatus,
  TicketResponse,
  TicketStatus,
  TicketWalletResponse,
} from '../../../../core/tickets/types/ticket';
import Button from '../../../../common/components/ui/Button';
import { ConfirmModal } from '../../../../common/components/ui/ConfirmModal';
import { useTheme, useSwitchTrackColors } from '../../../../common/theme/ThemeProvider';

type ModalMode =
  | 'details'
  | 'update'
  | 'transfer'
  | 'resend'
  | 'wallet'
  | 'checkout'
  | 'refund';

type Props = {
  visible: boolean;
  eventId: string;
  ticket: TicketResponse | null;
  onClose: () => void;
  onSuccess: () => void;
};

const formatEnumLabel = (value: string) =>
  value
    .toLowerCase()
    .split('_')
    .map(word => (word ? word[0].toUpperCase() + word.slice(1) : word))
    .join(' ');

export function TicketDetailModal({ visible, eventId, ticket, onClose, onSuccess }: Props) {
  const { t } = useI18n();
  const { colors } = useTheme();
  const switchTrackColor = useSwitchTrackColors();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<ModalMode>('details');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [sendPush, setSendPush] = useState(false);
  const [refundReason, setRefundReason] = useState('');

  const [walletData, setWalletData] = useState<TicketWalletResponse | null>(null);
  const [checkout, setCheckout] = useState<TicketCheckoutResponse | null>(null);
  const [infoLoading, setInfoLoading] = useState(false);

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showCancelCheckoutConfirm, setShowCancelCheckoutConfirm] = useState(false);

  const modalPaddingBottom = Math.max(insets.bottom, 20);

  const resetState = useCallback(() => {
    setMode('details');
    setError(null);
    setLoading(false);
    setOwnerName(ticket?.attendeeName || '');
    setOwnerEmail(ticket?.attendeeEmail || '');
    setNewOwnerName('');
    setNewOwnerEmail('');
    setSendEmail(true);
    setSendPush(false);
    setRefundReason('');
    setWalletData(null);
    setCheckout(null);
    setInfoLoading(false);
    setShowCancelConfirm(false);
    setShowCancelCheckoutConfirm(false);
  }, [ticket?.attendeeEmail, ticket?.attendeeName]);

  useEffect(() => {
    if (visible) {
      resetState();
    }
  }, [visible, resetState]);

  const isCancelled =
    ticket?.status === TicketStatus.CANCELLED || ticket?.status === TicketStatus.REFUNDED;
  const canCancel = !!ticket && !isCancelled && ticket.status !== TicketStatus.VALIDATED;
  const canRefund = !!ticket && !isCancelled;
  const canModify = !!ticket && !isCancelled;
  const canResend = !!ticket && !isCancelled;

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const changeMode = useCallback((next: ModalMode) => {
    setMode(next);
    setError(null);
  }, []);

  const headerTitle = useMemo(() => {
    if (!ticket) return t('TicketDetails');
    if (mode === 'update') return t('UpdateTicket');
    if (mode === 'transfer') return t('TransferTicket');
    if (mode === 'resend') return t('ResendTicket');
    if (mode === 'wallet') return t('WalletPass');
    if (mode === 'checkout') return t('Checkout');
    if (mode === 'refund') return t('RefundTicket');
    return t('TicketDetails');
  }, [mode, t, ticket]);

  const formatCurrencyMinor = useCallback(
    (amountMinor?: number | null, currency?: string | null) => {
      if (amountMinor === null || amountMinor === undefined || !currency) return t('Free');
      return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amountMinor / 100);
    },
    [t]
  );

  const fetchWalletPass = useCallback(async () => {
    if (!ticket) return;
    setInfoLoading(true);
    setError(null);
    try {
      const data = await ticketService.getWalletPass(ticket.id);
      setWalletData(data);
    } catch (err) {
      setError(t('FailedToLoadWalletPass'));
      ErrorHandler.handle(err, 'getWalletPass');
    } finally {
      setInfoLoading(false);
    }
  }, [ticket, t]);

  const fetchCheckout = useCallback(async () => {
    if (!ticket?.checkoutId) return;
    setInfoLoading(true);
    setError(null);
    try {
      const data = await ticketService.getTicketCheckout(eventId, ticket.checkoutId);
      setCheckout(data);
    } catch (err) {
      setError(t('FailedToLoadCheckout'));
      ErrorHandler.handle(err, 'getTicketCheckout');
    } finally {
      setInfoLoading(false);
    }
  }, [eventId, ticket?.checkoutId, t]);

  useEffect(() => {
    if (!visible || !ticket) return;
    if (mode === 'wallet') {
      fetchWalletPass();
    }
    if (mode === 'checkout') {
      fetchCheckout();
    }
  }, [fetchCheckout, fetchWalletPass, mode, ticket, visible]);

  const handleUpdate = useCallback(async () => {
    if (!ticket) return;
    const trimmedName = ownerName.trim();
    const trimmedEmail = ownerEmail.trim();
    if (!trimmedName && !trimmedEmail) {
      setError(t('OwnerNameOrEmailRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await ticketService.updateTicket(ticket.id, {
        ownerName: trimmedName || null,
        ownerEmail: trimmedEmail || null,
      });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(t('FailedToUpdateTicket'));
      ErrorHandler.handle(err, 'updateTicket');
    } finally {
      setLoading(false);
    }
  }, [handleClose, ownerEmail, ownerName, onSuccess, t, ticket]);

  const handleTransfer = useCallback(async () => {
    if (!ticket) return;
    const trimmedName = newOwnerName.trim();
    const trimmedEmail = newOwnerEmail.trim();
    if (!trimmedName && !trimmedEmail) {
      setError(t('NewOwnerRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await ticketService.transferTicket(ticket.id, {
        newOwnerName: trimmedName || null,
        newOwnerEmail: trimmedEmail || null,
        sendEmail,
        sendPush,
      });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(t('FailedToTransferTicket'));
      ErrorHandler.handle(err, 'transferTicket');
    } finally {
      setLoading(false);
    }
  }, [handleClose, newOwnerEmail, newOwnerName, onSuccess, sendEmail, sendPush, t, ticket]);

  const handleResend = useCallback(async () => {
    if (!ticket) return;
    setLoading(true);
    setError(null);
    try {
      await ticketService.resendTicket(ticket.id, { sendEmail, sendPush });
      onSuccess();
      handleClose();
    } catch (err) {
      setError(t('FailedToResendTicket'));
      ErrorHandler.handle(err, 'resendTicket');
    } finally {
      setLoading(false);
    }
  }, [handleClose, onSuccess, sendEmail, sendPush, t, ticket]);

  const handleRefund = useCallback(async () => {
    if (!ticket) return;
    setLoading(true);
    setError(null);
    try {
      await ticketService.refundTicket(ticket.id, refundReason.trim() || undefined);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(t('FailedToRefundTicket'));
      ErrorHandler.handle(err, 'refundTicket');
    } finally {
      setLoading(false);
    }
  }, [handleClose, onSuccess, refundReason, t, ticket]);

  const handleCancel = useCallback(async () => {
    if (!ticket) return;
    setLoading(true);
    setShowCancelConfirm(false);
    setError(null);
    try {
      await ticketService.cancelTicket(ticket.id);
      onSuccess();
      handleClose();
    } catch (err) {
      setError(t('FailedToCancelTicket'));
      ErrorHandler.handle(err, 'cancelTicket');
    } finally {
      setLoading(false);
    }
  }, [handleClose, onSuccess, t, ticket]);

  const handleCancelCheckout = useCallback(async () => {
    if (!ticket?.checkoutId) return;
    setLoading(true);
    setShowCancelCheckoutConfirm(false);
    setError(null);
    try {
      await ticketService.cancelTicketCheckout(eventId, ticket.checkoutId);
      await fetchCheckout();
    } catch (err) {
      setError(t('FailedToCancelCheckout'));
      ErrorHandler.handle(err, 'cancelTicketCheckout');
    } finally {
      setLoading(false);
    }
  }, [eventId, fetchCheckout, t, ticket?.checkoutId]);

  if (!ticket) return null;

  const detailRow = (label: string, value?: string | null) => {
    if (!value) return null;
    return (
      <View className="flex-row items-center justify-between py-xs">
        <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">{label}</Text>
        <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
          {value}
        </Text>
      </View>
    );
  };

  const renderDetails = () => (
    <View>
      <View className="rounded-xl border p-lg mb-lg bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted">
        <View className="flex-row items-center gap-sm mb-sm">
          <Ticket size={18} color={colors.text.tertiary} strokeWidth={2} />
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {ticket.ticketNumber}
          </Text>
        </View>
        {detailRow(t('Status'), formatEnumLabel(ticket.status))}
        {detailRow(t('TicketType'), ticket.ticketTypeName || undefined)}
        {detailRow(t('TicketHolder'), ticket.attendeeName || undefined)}
        {detailRow(t('OwnerEmail'), ticket.attendeeEmail || undefined)}
        {detailRow(t('Checkout'), ticket.checkoutId ? `#${ticket.checkoutId.slice(0, 8)}` : undefined)}
        {detailRow(
          t('Issued'),
          ticket.issuedAt ? dateUtils.formatDate(ticket.issuedAt, DATE_FORMATS.DISPLAY_DATETIME) : null
        )}
        {detailRow(
          t('Validated'),
          ticket.validatedAt ? dateUtils.formatDate(ticket.validatedAt, DATE_FORMATS.DISPLAY_DATETIME) : null
        )}
      </View>

      <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
        {t('TicketActions')}
      </Text>

      <View className="gap-sm mb-lg">
        <TouchableOpacity
          onPress={() => changeMode('update')}
          disabled={!canModify}
          className={`flex-row items-center gap-sm p-md rounded-lg border ${
            canModify
              ? 'bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted'
              : 'bg-light-surface-soft dark:bg-dark-surface-strong border-light-border dark:border-dark-border'
          }`}
        >
          <Edit size={16} color={colors.text.primary} strokeWidth={2.2} />
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {t('UpdateTicket')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => changeMode('transfer')}
          disabled={!canModify}
          className={`flex-row items-center gap-sm p-md rounded-lg border ${
            canModify
              ? 'bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted'
              : 'bg-light-surface-soft dark:bg-dark-surface-strong border-light-border dark:border-dark-border'
          }`}
        >
          <Send size={16} color={colors.text.primary} strokeWidth={2.2} />
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {t('TransferTicket')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => changeMode('resend')}
          disabled={!canResend}
          className={`flex-row items-center gap-sm p-md rounded-lg border ${
            canResend
              ? 'bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted'
              : 'bg-light-surface-soft dark:bg-dark-surface-strong border-light-border dark:border-dark-border'
          }`}
        >
          <RotateCcw size={16} color={colors.text.primary} strokeWidth={2.2} />
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {t('ResendTicket')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => changeMode('wallet')}
          className="flex-row items-center gap-sm p-md rounded-lg border bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
        >
          <CreditCard size={16} color={colors.text.primary} strokeWidth={2.2} />
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {t('AddToWallet')}
          </Text>
        </TouchableOpacity>

        {ticket.checkoutId && (
          <TouchableOpacity
            onPress={() => changeMode('checkout')}
            className="flex-row items-center gap-sm p-md rounded-lg border bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted"
          >
            <ShoppingCart size={16} color={colors.text.primary} strokeWidth={2.2} />
            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
              {t('ViewCheckout')}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => changeMode('refund')}
          disabled={!canRefund}
          className={`flex-row items-center gap-sm p-md rounded-lg border ${
            canRefund
              ? 'bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted'
              : 'bg-light-surface-soft dark:bg-dark-surface-strong border-light-border dark:border-dark-border'
          }`}
        >
          <RotateCcw size={16} color={colors.semantic.warning} strokeWidth={2.2} />
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {t('RefundTicket')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowCancelConfirm(true)}
          disabled={!canCancel}
          className={`flex-row items-center gap-sm p-md rounded-lg border ${
            canCancel
              ? 'bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted'
              : 'bg-light-surface-soft dark:bg-dark-surface-strong border-light-border dark:border-dark-border'
          }`}
        >
          <XCircle size={16} color={colors.semantic.error} strokeWidth={2.2} />
          <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
            {t('CancelTicket')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUpdate = () => (
    <View>
      <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mb-lg">
        {t('UpdateTicketHolder')}
      </Text>
      <View className="mb-lg">
        <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
          {t('OwnerName')}
        </Text>
        <TextInput
          value={ownerName}
          onChangeText={setOwnerName}
          placeholder={t('OwnerName')}
          placeholderTextColor={colors.text.tertiary}
          className="border rounded-lg px-md py-sm text-sm text-txt-primary dark:text-txt-dark-primary border-light-border-strong dark:border-dark-border-strong bg-light-surface-subtle dark:bg-dark-surface-muted"
        />
      </View>
      <View className="mb-xl">
        <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
          {t('OwnerEmail')}
        </Text>
        <TextInput
          value={ownerEmail}
          onChangeText={setOwnerEmail}
          placeholder={t('OwnerEmail')}
          placeholderTextColor={colors.text.tertiary}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border rounded-lg px-md py-sm text-sm text-txt-primary dark:text-txt-dark-primary border-light-border-strong dark:border-dark-border-strong bg-light-surface-subtle dark:bg-dark-surface-muted"
        />
      </View>
      <Button
        variant="primary"
        size="lg"
        onPress={handleUpdate}
        loading={loading}
        disabled={loading}
      >
        {loading ? t('Processing') : t('SaveChanges')}
      </Button>
    </View>
  );

  const renderTransfer = () => (
    <View>
      <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mb-lg">
        {t('TransferTicketDescription')}
      </Text>
      <View className="mb-lg">
        <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
          {t('NewOwnerName')}
        </Text>
        <TextInput
          value={newOwnerName}
          onChangeText={setNewOwnerName}
          placeholder={t('NewOwnerName')}
          placeholderTextColor={colors.text.tertiary}
          className="border rounded-lg px-md py-sm text-sm text-txt-primary dark:text-txt-dark-primary border-light-border-strong dark:border-dark-border-strong bg-light-surface-subtle dark:bg-dark-surface-muted"
        />
      </View>
      <View className="mb-xl">
        <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
          {t('NewOwnerEmail')}
        </Text>
        <TextInput
          value={newOwnerEmail}
          onChangeText={setNewOwnerEmail}
          placeholder={t('NewOwnerEmail')}
          placeholderTextColor={colors.text.tertiary}
          keyboardType="email-address"
          autoCapitalize="none"
          className="border rounded-lg px-md py-sm text-sm text-txt-primary dark:text-txt-dark-primary border-light-border-strong dark:border-dark-border-strong bg-light-surface-subtle dark:bg-dark-surface-muted"
        />
      </View>

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

      <Button
        variant="primary"
        size="lg"
        onPress={handleTransfer}
        loading={loading}
        disabled={loading}
      >
        {loading ? t('Processing') : t('TransferTicket')}
      </Button>
    </View>
  );

  const renderResend = () => (
    <View>
      <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mb-lg">
        {t('ResendTicketDescription')}
      </Text>

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

      <Button
        variant="primary"
        size="lg"
        onPress={handleResend}
        loading={loading}
        disabled={loading}
      >
        {loading ? t('Processing') : t('ResendTicket')}
      </Button>
    </View>
  );

  const renderRefund = () => (
    <View>
      <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary mb-lg">
        {t('RefundTicketDescription')}
      </Text>
      <View className="mb-xl">
        <Text className="text-xs font-medium uppercase tracking-wide text-txt-tertiary dark:text-txt-dark-tertiary mb-sm">
          {t('Reason')} ({t('Optional')})
        </Text>
        <View className="rounded-lg px-md border border-[0.5px] bg-light-surface dark:bg-dark-surface border-light-border dark:border-dark-border">
          <TextInput
            value={refundReason}
            onChangeText={setRefundReason}
            placeholder={t('RefundReason')}
            placeholderTextColor={colors.text.tertiary}
            className="text-sm text-txt-primary dark:text-txt-dark-primary py-md min-h-[80px]"
            style={{ textAlignVertical: 'top' }}
            multiline
            maxLength={500}
          />
        </View>
      </View>
      <Button
        variant="danger"
        size="lg"
        onPress={handleRefund}
        loading={loading}
        disabled={loading}
      >
        {loading ? t('Processing') : t('RefundTicket')}
      </Button>
    </View>
  );

  const renderWallet = () => (
    <View>
      {infoLoading ? (
        <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
          {t('LoadingWalletPass')}
        </Text>
      ) : walletData ? (
        <View className="rounded-xl border p-lg bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted">
          <View className="flex-row items-center gap-sm mb-sm">
            <CreditCard size={18} color={colors.text.tertiary} strokeWidth={2} />
            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
              {walletData.ticketTypeName || t('WalletPass')}
            </Text>
          </View>
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mb-md">
            {walletData.available ? t('WalletPassAvailable') : t('WalletPassUnavailable')}
          </Text>
          {walletData.eventName && detailRow(t('Event'), walletData.eventName)}
          {walletData.ticketNumber && detailRow(t('Ticket'), walletData.ticketNumber)}
          {walletData.venueAddress && detailRow(t('Venue'), walletData.venueAddress)}
          {walletData.venueCity && detailRow(t('City'), walletData.venueCity)}
          {walletData.venueState && detailRow(t('State'), walletData.venueState)}
          {walletData.barcodeMessage && detailRow(t('Barcode'), walletData.barcodeMessage)}
        </View>
      ) : (
        <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
          {t('WalletPassUnavailable')}
        </Text>
      )}
    </View>
  );

  const renderCheckout = () => (
    <View>
      {infoLoading ? (
        <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
          {t('LoadingCheckout')}
        </Text>
      ) : checkout ? (
        <View>
          <View className="rounded-xl border p-lg mb-lg bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted">
            <View className="flex-row items-center gap-sm mb-sm">
              <ShoppingCart size={18} color={colors.text.tertiary} strokeWidth={2} />
              <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('Checkout')} #{checkout.id.slice(0, 8)}
              </Text>
            </View>
            {detailRow(t('Status'), formatEnumLabel(checkout.status))}
            {detailRow(
              t('Created'),
              checkout.createdAt ? dateUtils.formatDate(checkout.createdAt, DATE_FORMATS.DISPLAY_DATETIME) : null
            )}
            {detailRow(
              t('Completed'),
              checkout.completedAt ? dateUtils.formatDate(checkout.completedAt, DATE_FORMATS.DISPLAY_DATETIME) : null
            )}
          </View>

          <View className="rounded-xl border p-lg mb-lg bg-light-surface-subtle dark:bg-dark-surface-subtle border-light-border-muted dark:border-dark-border-muted">
            <Text className="text-xs font-semibold uppercase tracking-wider text-txt-secondary dark:text-txt-dark-secondary mb-md">
              {t('CheckoutItems')}
            </Text>
            {checkout.items.map(item => (
              <View key={item.ticketTypeId} className="flex-row justify-between py-xs">
                <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary">
                  {item.quantity}× {item.ticketTypeName}
                </Text>
                <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {formatCurrencyMinor(item.subtotalMinor, item.currency)}
                </Text>
              </View>
            ))}
            <View className="h-px my-sm bg-light-border dark:bg-dark-border" />
            <View className="flex-row justify-between">
              <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('Total')}
              </Text>
              <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                {formatCurrencyMinor(checkout.cost.totalMinor, checkout.cost.currency)}
              </Text>
            </View>
          </View>

          {checkout.status === TicketCheckoutStatus.PENDING_PAYMENT && (
            <Button
              variant="danger"
              size="lg"
              onPress={() => setShowCancelCheckoutConfirm(true)}
              disabled={loading}
            >
              {t('CancelCheckout')}
            </Button>
          )}
        </View>
      ) : (
        <Text className="text-sm text-txt-tertiary dark:text-txt-dark-tertiary">
          {t('FailedToLoadCheckout')}
        </Text>
      )}
    </View>
  );

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
        <View className="flex-1 bg-light-overlay dark:bg-dark-overlay justify-end">
          <View
            className="bg-light-background dark:bg-dark-background rounded-t-2xl pt-xl max-h-[90%]"
            style={{ paddingBottom: modalPaddingBottom }}
          >
            <View className="flex-row items-center justify-between px-xl mb-xl">
              <View className="flex-row items-center gap-sm">
                {mode !== 'details' ? (
                  <TouchableOpacity
                    onPress={() => changeMode('details')}
                    className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
                  >
                    <ArrowLeft size={18} color={colors.text.primary} strokeWidth={2.2} />
                  </TouchableOpacity>
                ) : null}
                <View>
                  <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {headerTitle}
                  </Text>
                  <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                    {ticket.ticketNumber}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                className="w-8 h-8 rounded-full items-center justify-center bg-light-surface-soft dark:bg-dark-surface-strong"
              >
                <X size={18} color={colors.text.primary} strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-xl" showsVerticalScrollIndicator={false}>
              {error && (
                <View className="rounded-lg p-md mb-lg bg-semantic-error-light dark:bg-semantic-error/20">
                  <Text className="text-sm text-semantic-error">{error}</Text>
                </View>
              )}

              {mode === 'details' && renderDetails()}
              {mode === 'update' && renderUpdate()}
              {mode === 'transfer' && renderTransfer()}
              {mode === 'resend' && renderResend()}
              {mode === 'wallet' && renderWallet()}
              {mode === 'checkout' && renderCheckout()}
              {mode === 'refund' && renderRefund()}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={showCancelConfirm}
        title={t('CancelTicket')}
        message={t('CancelTicketConfirm')}
        confirmLabel={t('CancelTicket')}
        cancelLabel={t('Cancel')}
        variant="danger"
        isLoading={loading}
        onConfirm={handleCancel}
        onCancel={() => setShowCancelConfirm(false)}
      />

      <ConfirmModal
        visible={showCancelCheckoutConfirm}
        title={t('CancelCheckout')}
        message={t('CancelCheckoutConfirm')}
        confirmLabel={t('CancelCheckout')}
        cancelLabel={t('Cancel')}
        variant="warning"
        isLoading={loading}
        onConfirm={handleCancelCheckout}
        onCancel={() => setShowCancelCheckoutConfirm(false)}
      />
    </>
  );
}
