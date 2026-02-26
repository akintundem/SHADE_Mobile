import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ImageBackground,
  Dimensions,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Ticket,
  Calendar,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Plus,
  Minus,
  Clock,
  FileText,
  CreditCard,
  Smartphone,
} from 'lucide-react-native';
import type { CardPaymentPayload } from '../../checkout';
import { TicketCheckoutItemRequest, TicketTypeSummary } from '../../../core/tickets/types/ticket';
import { dateUtils } from '../../../common/utils/helpers';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { ticketService } from '../../../core/tickets/services/ticket';
import { getImageUrl } from '../../../config/appConfig';
import { ErrorHandler } from '../../../common/utils/errorHandler';
import { CardForm } from '../../checkout';
import { MyTicketRequestsModal } from './MyTicketRequestsModal';
import { MyTicketWaitlistModal } from './MyTicketWaitlistModal';
import { JoinTicketWaitlistModal } from './JoinTicketWaitlistModal';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

export type TicketRequiredModalProps = {
  visible: boolean;
  eventId: string;
  eventName: string;
  description?: string | null;
  coverImageUrl?: string | null;
  startDateTime?: string | null;
  venue?: string | null;
  city?: string | null;
  state?: string | null;
  attendeeCount?: number | null;
  capacity?: number | null;
  ticketTypes?: TicketTypeSummary[] | null;
  onAction: (
    payload: { items: TicketCheckoutItemRequest[]; promotionCode?: string | null },
    cardPayload?: CardPaymentPayload
  ) => Promise<void>;
  loading?: boolean;
  errorMessage?: string;
  onClose: () => void;
};

export const TicketRequiredModal = ({
  visible,
  eventId,
  eventName,
  coverImageUrl,
  startDateTime,
  venue,
  city,
  state,
  ticketTypes,
  onAction,
  loading = false,
  errorMessage,
  onClose,
}: TicketRequiredModalProps) => {
  const { t } = useI18n();
  const { colors, disabledButtonBackground } = useTheme();
  const insets = useSafeAreaInsets();
  const { width, height } = Dimensions.get('window');
  const overlayIconColor = colors.text.inverse;

  const MODAL_HEIGHT = height * 0.75;

  const slideAnim = useRef(new Animated.Value(0)).current;
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [promotionCode, setPromotionCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [approvalLoading, setApprovalLoading] = useState(false);
  const [approvalSuccess, setApprovalSuccess] = useState(false);
  const [showMyRequests, setShowMyRequests] = useState(false);
  const [showMyWaitlist, setShowMyWaitlist] = useState(false);
  const [showJoinWaitlist, setShowJoinWaitlist] = useState(false);
  const [waitlistTicketType, setWaitlistTicketType] = useState<TicketTypeSummary | null>(null);
  const [showPaymentMethodPicker, setShowPaymentMethodPicker] = useState(false);
  const [showCardCheckout, setShowCardCheckout] = useState(false);

  const formattedDate = startDateTime
    ? dateUtils.formatDate(startDateTime, 'EEE, MMM d · h:mm a')
    : null;

  const locationParts = [venue, city, state].filter(Boolean);
  const formattedLocation = locationParts.length > 0 ? locationParts.join(', ') : null;

  const normalizeCurrency = (value?: string | null) => (value ? value.toUpperCase() : 'USD');

  const formatCurrencyFromMinor = (amountMinor: number | null | undefined, currency?: string | null) => {
    if (!amountMinor) return t('Free');
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: normalizeCurrency(currency) }).format(amountMinor / 100);
  };

  const formatPrice = (priceMinor: number | null | undefined, currency: string | null | undefined) => {
    if (priceMinor === null || priceMinor === undefined || priceMinor === 0) return t('Free');
    return formatCurrencyFromMinor(priceMinor, currency);
  };

  const { totalTickets, totalPriceMinor, selectedItems } = useMemo(() => {
    let total = 0;
    let priceMinor = 0;
    const items: { id: string; name: string; quantity: number; priceMinor: number; currency: string }[] = [];

    if (ticketTypes) {
      ticketTypes.forEach(ticket => {
        const qty = quantities[ticket.id] || 0;
        if (qty > 0) {
          total += qty;
          const ticketPriceMinor = ticket.priceMinor || 0;
          priceMinor += ticketPriceMinor * qty;
          items.push({
            id: ticket.id,
            name: ticket.name,
            quantity: qty,
            priceMinor: ticketPriceMinor,
            currency: normalizeCurrency(ticket.currency),
          });
        }
      });
    }

    return { totalTickets: total, totalPriceMinor: priceMinor, selectedItems: items };
  }, [quantities, ticketTypes]);

  const hasSelection = totalTickets > 0;

  const ticketTypeMap = useMemo(() => {
    const map = new Map<string, TicketTypeSummary>();
    ticketTypes?.forEach(type => {
      map.set(type.id, type);
    });
    return map;
  }, [ticketTypes]);

  const approvalItems = useMemo(
    () => selectedItems.filter(item => ticketTypeMap.get(item.id)?.requiresApproval),
    [selectedItems, ticketTypeMap]
  );

  const isApprovalFlow = hasSelection && approvalItems.length === selectedItems.length;

  const handleQuantityChange = (ticketId: string, delta: number, maxPerPerson?: number | null, remaining?: number | null) => {
    setQuantities(prev => {
      const current = prev[ticketId] || 0;
      let newQty = current + delta;
      if (newQty < 0) newQty = 0;
      if (maxPerPerson && newQty > maxPerPerson) newQty = maxPerPerson;
      if (remaining !== null && remaining !== undefined && newQty > remaining) newQty = remaining;
      return { ...prev, [ticketId]: newQty };
    });
  };

  const handleGetTickets = async () => {
    if (!hasSelection) return;
    setError(null);

    if (isApprovalFlow) {
      if (selectedItems.length !== 1) {
        setError(t('ApprovalSingleTypeWarning'));
        return;
      }

      const requestItem = selectedItems[0];
      setApprovalLoading(true);
      try {
        await ticketService.createApprovalRequest(eventId, {
          ticketTypeId: requestItem.id,
          quantity: requestItem.quantity,
        });
        setApprovalSuccess(true);
        setQuantities({});
      } catch (err) {
        setError(t('FailedToRequestTickets'));
        ErrorHandler.handle(err, 'createApprovalRequest');
      } finally {
        setApprovalLoading(false);
      }
      return;
    }

    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleBackToSelection = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
    });
  };

  const runPayment = async (cardPayload?: CardPaymentPayload) => {
    if (!hasSelection) return;
    if (promotionCode.trim() && selectedItems.length > 1) {
      setError(t('PromotionSingleTypeWarning'));
      return;
    }
    setError(null);
    setShowPaymentMethodPicker(false);
    setShowCardCheckout(false);
    try {
      await onAction(
        {
          items: selectedItems.map(item => ({
            ticketTypeId: item.id,
            quantity: item.quantity,
          })),
          promotionCode: promotionCode.trim() || null,
        },
        cardPayload
      );
    } catch (err: unknown) {
      setError(t('UnableToCompletePurchase'));
    }
  };

  const handlePayNow = runPayment;

  const handlePayNowPress = () => {
    if (!hasSelection) return;
    if (promotionCode.trim() && selectedItems.length > 1) {
      setError(t('PromotionSingleTypeWarning'));
      return;
    }
    setShowPaymentMethodPicker(true);
  };

  const handleDismiss = () => {
    setQuantities({});
    setPromotionCode('');
    setError(null);
    setApprovalLoading(false);
    setApprovalSuccess(false);
    setWaitlistTicketType(null);
    setShowJoinWaitlist(false);
    setShowPaymentMethodPicker(false);
    setShowCardCheckout(false);
    slideAnim.setValue(0);
    onClose();
  };

  useEffect(() => {
    if (!visible) {
      setQuantities({});
      setPromotionCode('');
      setError(null);
      setApprovalLoading(false);
      setApprovalSuccess(false);
      setWaitlistTicketType(null);
      setShowJoinWaitlist(false);
      setShowPaymentMethodPicker(false);
      setShowCardCheckout(false);
      slideAnim.setValue(0);
    }
  }, [slideAnim, visible]);

  if (!visible) return null;

  const slideInterpolate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width],
  });

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={handleDismiss}>
        <TouchableWithoutFeedback onPress={handleDismiss}>
          <View className="flex-1 bg-light-overlay-soft dark:bg-dark-overlay-soft" />
        </TouchableWithoutFeedback>

        <View
          className="absolute bottom-0 left-0 right-0 bg-light-background dark:bg-dark-background rounded-t-2xl overflow-hidden"
          style={{ height: MODAL_HEIGHT }}
        >
          <Animated.View
            style={{
              flexDirection: 'row',
              width: width * 2,
              height: '100%',
              transform: [{ translateX: slideInterpolate }],
            }}
          >
            <View style={{ width, height: '100%' }}>
              <View style={{ width, height: width * 0.6 }}>
                <ImageBackground
                  source={{ uri: getImageUrl(coverImageUrl) || FALLBACK_IMAGE }}
                  className="w-full h-full"
                  resizeMode="cover"
                >
                  <View className="flex-1 justify-between p-md bg-light-overlay-soft dark:bg-dark-overlay-soft">
                    <View className="items-center">
                      <View className="w-9 h-1 rounded-full bg-neutral-white/50" />
                    </View>

                    <View
                      className="absolute top-lg left-md flex-row items-center px-sm py-[4px] rounded-sm bg-light-overlay dark:bg-dark-overlay"
                    >
                      <Ticket size={10} color={overlayIconColor} strokeWidth={2} />
                      <Text className="text-xs font-medium text-txt-inverse ml-[4px]">{t('Ticketed')}</Text>
                    </View>

                    <View>
                      <Text className="text-lg font-bold text-txt-inverse" numberOfLines={2}>
                        {eventName}
                      </Text>
                      {formattedDate && (
                        <View className="flex-row items-center mt-[4px]">
                          <Calendar size={12} color={overlayIconColor} strokeWidth={1.5} />
                          <Text className="text-xs text-txt-inverse ml-[4px]" style={{ opacity: 0.9 }}>
                            {formattedDate}
                          </Text>
                        </View>
                      )}
                      {formattedLocation && (
                        <View className="flex-row items-center mt-[2px]">
                          <MapPin size={12} color={overlayIconColor} strokeWidth={1.5} />
                          <Text className="text-xs text-txt-inverse ml-[4px]" style={{ opacity: 0.9 }} numberOfLines={1}>
                            {formattedLocation}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </ImageBackground>
              </View>

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
              >
                <View className="px-3 pt-3 pb-[90px]">
                  <View className="flex-row items-center justify-between mb-md">
                    <TouchableOpacity
                      onPress={() => setShowMyRequests(true)}
                      className="flex-row items-center gap-xs"
                    >
                    <FileText size={14} color={colors.text.tertiary} strokeWidth={2} />
                      <Text className="text-xs font-semibold text-txt-tertiary dark:text-txt-dark-tertiary">
                        {t('MyTicketRequests')}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowMyWaitlist(true)}
                      className="flex-row items-center gap-xs"
                    >
                      <Clock size={14} color={colors.text.tertiary} strokeWidth={2} />
                      <Text className="text-xs font-semibold text-txt-tertiary dark:text-txt-dark-tertiary">
                        {t('MyTicketWaitlist')}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {approvalSuccess && (
                    <View className="rounded-lg p-md mb-md bg-semantic-success-light dark:bg-semantic-success/20">
                      <Text className="text-xs text-semantic-success">
                        {t('TicketRequestSubmitted')}
                      </Text>
                    </View>
                  )}

                  {error && (
                    <View className="rounded-lg p-sm mb-md bg-semantic-error-light dark:bg-semantic-error/[0.15]">
                      <Text className="text-xs text-semantic-error">{error}</Text>
                    </View>
                  )}

                  {ticketTypes?.map((ticket, index) => {
                    const isSoldOut = ticket.quantityRemaining === 0;
                    const qty = quantities[ticket.id] || 0;
                    const canAdd =
                      !isSoldOut &&
                      (!ticket.maxPerPerson || qty < ticket.maxPerPerson) &&
                      (ticket.quantityRemaining === null || ticket.quantityRemaining === undefined || qty < ticket.quantityRemaining);

                    return (
                      <View
                        key={ticket.id}
                        className={`flex-row items-center justify-between py-md ${
                          index < (ticketTypes?.length || 0) - 1
                            ? 'border-b border-light-border dark:border-dark-border'
                            : ''
                        }`}
                        style={{ opacity: isSoldOut ? 0.4 : 1 }}
                      >
                        <View className="flex-1">
                          <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary">
                            {ticket.name}
                          </Text>
                          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
                            {formatPrice(ticket.priceMinor, ticket.currency)}
                            {ticket.statusMessage && ` · ${ticket.statusMessage}`}
                          </Text>
                        </View>

                        {!isSoldOut ? (
                          <View className="flex-row items-center">
                            <TouchableOpacity
                              onPress={() => handleQuantityChange(ticket.id, -1)}
                              disabled={qty === 0}
                              className={`w-8 h-8 rounded-full items-center justify-center ${qty > 0 ? 'border border-txt-primary dark:border-txt-dark-primary' : ''}`}
                              style={qty === 0 ? { backgroundColor: disabledButtonBackground } : undefined}
                            >
                              <Minus size={14} color={qty > 0 ? colors.text.primary : colors.text.tertiary} strokeWidth={2} />
                            </TouchableOpacity>

                            <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary min-w-[32px] text-center">
                              {qty}
                            </Text>

                            <TouchableOpacity
                              onPress={() => handleQuantityChange(ticket.id, 1, ticket.maxPerPerson, ticket.quantityRemaining)}
                              disabled={!canAdd}
                              className="w-8 h-8 rounded-full items-center justify-center"
                              style={{
                                backgroundColor: canAdd ? colors.text.primary : disabledButtonBackground,
                              }}
                            >
                              <Plus size={14} color={canAdd ? colors.text.inverse : colors.text.tertiary} strokeWidth={2} />
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View className="items-end">
                            <Text className="text-xs font-medium text-semantic-error mb-xs">
                              {t('SoldOut')}
                            </Text>
                            <TouchableOpacity
                              onPress={() => {
                                setWaitlistTicketType(ticket);
                                setShowJoinWaitlist(true);
                              }}
                              className="px-sm py-[6px] rounded-full border border-light-border dark:border-dark-border"
                            >
                              <Text className="text-xs font-semibold text-txt-primary dark:text-txt-dark-primary">
                                {t('JoinWaitlist')}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              </ScrollView>

              <View
                className="absolute bottom-0 left-0 right-0 bg-light-background dark:bg-dark-background px-md pt-sm border-t border-light-border dark:border-dark-border"
                style={{ paddingBottom: Math.max(insets.bottom, 8) }}
              >
                <TouchableOpacity
                  onPress={handleGetTickets}
                  disabled={!hasSelection || approvalLoading}
                  activeOpacity={0.8}
                  className="w-full h-12 rounded-md flex-row items-center justify-center"
                  style={{
                    backgroundColor: hasSelection ? colors.text.primary : disabledButtonBackground,
                  }}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      hasSelection ? 'text-txt-inverse dark:text-txt-dark-inverse' : 'text-txt-tertiary dark:text-txt-dark-tertiary'
                    }`}
                  >
                  {hasSelection
                    ? approvalLoading
                      ? t('Processing')
                      : isApprovalFlow
                        ? t('RequestTickets')
                        : `${t('GetTickets')} · ${formatCurrencyFromMinor(totalPriceMinor, selectedItems[0]?.currency)}`
                    : t('SelectTickets')}
                  </Text>
                  {hasSelection && (
                    <View className="ml-1">
                      <ArrowRight size={16} color={colors.text.inverse} strokeWidth={2} />
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <View className="bg-light-background dark:bg-dark-background" style={{ width, height: '100%' }}>
              <View
                className="flex-row items-center px-md pt-md pb-sm border-b border-light-border dark:border-dark-border"
              >
                <TouchableOpacity onPress={handleBackToSelection} className="p-xs">
                  <ArrowLeft size={20} color={colors.text.primary} strokeWidth={2} />
                </TouchableOpacity>
                <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary ml-sm">
                  {t('Checkout')}
                </Text>
              </View>

              <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
              >
                <View className="p-3 pb-[100px]">
                  <View className="flex-row mb-lg">
                    <ImageBackground
                      source={{ uri: getImageUrl(coverImageUrl) || FALLBACK_IMAGE }}
                      className="w-16 h-16 rounded-lg overflow-hidden"
                      resizeMode="cover"
                    />
                    <View className="flex-1 ml-sm justify-center">
                      <Text className="text-sm font-medium text-txt-primary dark:text-txt-dark-primary" numberOfLines={2}>
                        {eventName}
                      </Text>
                      {formattedDate && (
                        <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
                          {formattedDate}
                        </Text>
                      )}
                    </View>
                  </View>

                  {(error || errorMessage) && (
                    <View
                      className="rounded-lg p-sm mb-md bg-semantic-error-light dark:bg-semantic-error/[0.15]"
                    >
                      <Text className="text-xs text-semantic-error">{error || errorMessage}</Text>
                    </View>
                  )}

                  <View className="mb-lg">
                    <Text className="text-xs font-medium uppercase tracking-wide text-txt-secondary dark:text-txt-dark-secondary mb-sm">
                      {t('PromotionCode')}
                    </Text>
                    <View
                      className="rounded-lg px-md border bg-light-surface-muted dark:bg-dark-surface-soft border-light-border-muted dark:border-dark-border-muted"
                    >
                      <TextInput
                        placeholder={t('EnterPromotionCode')}
                        placeholderTextColor={colors.text.tertiary}
                        value={promotionCode}
                        onChangeText={text => {
                          setPromotionCode(text.trim());
                          setError(null);
                        }}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        className="text-sm text-txt-primary dark:text-txt-dark-primary py-3"
                      />
                    </View>
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-xs">
                      {t('PromotionCodeHint')}
                    </Text>
                  </View>

                  {selectedItems.map((item, index) => (
                    <View key={index} className="flex-row justify-between py-sm">
                      <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary">
                        {item.quantity}× {item.name}
                      </Text>
                      <Text className="text-sm text-txt-primary dark:text-txt-dark-primary">
                        {formatCurrencyFromMinor(item.priceMinor * item.quantity, item.currency)}
                      </Text>
                    </View>
                  ))}

                <View className="h-px my-md bg-light-border dark:bg-dark-border" />

                <View className="flex-row justify-between">
                  <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {t('Total')}
                  </Text>
                  <Text className="text-base font-bold text-txt-primary dark:text-txt-dark-primary">
                    {formatCurrencyFromMinor(totalPriceMinor, selectedItems[0]?.currency)}
                  </Text>
                </View>
                </View>
              </ScrollView>

              <View
                className="absolute bottom-0 left-0 right-0 bg-light-background dark:bg-dark-background px-md pt-sm border-t border-light-border dark:border-dark-border"
                style={{ paddingBottom: Math.max(insets.bottom, 8) }}
              >
                <TouchableOpacity
                  onPress={handlePayNowPress}
                  disabled={loading}
                  activeOpacity={0.8}
                  className="w-full h-12 rounded-md items-center justify-center"
                  style={{
                    backgroundColor: loading ? disabledButtonBackground : colors.text.primary,
                  }}
                >
                  <Text className="text-sm font-semibold text-txt-inverse dark:text-txt-dark-inverse">
                    {loading ? t('Processing') : t('PayNow')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
        {showPaymentMethodPicker && (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              elevation: 10,
              justifyContent: 'flex-end',
            }}
          >
            <TouchableWithoutFeedback onPress={() => setShowPaymentMethodPicker(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
            </TouchableWithoutFeedback>
            <View
              className="absolute bottom-0 left-0 right-0 bg-light-background dark:bg-dark-background rounded-t-2xl px-md pb-lg"
              style={{ paddingBottom: Math.max(insets.bottom, 24) }}
            >
              <View className="items-center py-sm">
                <View className="w-10 h-1 rounded-full bg-light-border dark:bg-dark-border" />
              </View>
              <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary mb-lg">
                {t('SelectPaymentMethod')}
              </Text>
              {[
                { id: 'paypal', label: t('PayWithPayPal'), icon: CreditCard },
                { id: 'card', label: t('PayWithCreditCard'), icon: CreditCard },
                { id: 'apple', label: t('PayWithApplePay'), icon: Smartphone },
                { id: 'google', label: t('PayWithGooglePay'), icon: Smartphone },
              ].map(({ id, label, icon: Icon }) => (
                <TouchableOpacity
                  key={id}
                  onPress={() => {
                    if (id === 'card') {
                      setShowPaymentMethodPicker(false);
                      setShowCardCheckout(true);
                    } else {
                      handlePayNow();
                    }
                  }}
                  activeOpacity={0.7}
                  className="flex-row items-center py-4 border-b border-light-border dark:border-dark-border last:border-b-0"
                >
                  <View className="w-10 h-10 rounded-lg bg-light-surface-muted dark:bg-dark-surface-soft items-center justify-center">
                    <Icon size={20} color={colors.text.primary} strokeWidth={2} />
                  </View>
                  <Text className="ml-md text-base text-txt-primary dark:text-txt-dark-primary font-medium">
                    {label}
                  </Text>
                  <View className="ml-auto">
                    <ArrowRight size={18} color={colors.text.tertiary} strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
        {showCardCheckout && (
          <View
            pointerEvents="box-none"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 20,
              elevation: 20,
              justifyContent: 'flex-end',
            }}
          >
            <TouchableWithoutFeedback onPress={() => setShowCardCheckout(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
            </TouchableWithoutFeedback>
            <View
              className="bg-light-background dark:bg-dark-background rounded-t-2xl px-md pb-lg"
              style={{
                paddingBottom: Math.max(insets.bottom, 24),
                maxHeight: '90%',
              }}
            >
              <View className="flex-row items-center py-sm mb-md">
                <TouchableOpacity onPress={() => setShowCardCheckout(false)} className="p-xs">
                  <ArrowLeft size={24} color={colors.text.primary} strokeWidth={2} />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-txt-primary dark:text-txt-dark-primary ml-sm">
                  {t('CardDetails')}
                </Text>
              </View>
              {totalPriceMinor != null && selectedItems.length > 0 && (
                <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary mb-lg">
                  {t('Total')}: {formatCurrencyFromMinor(totalPriceMinor, selectedItems[0]?.currency)}
                </Text>
              )}
              {(errorMessage || error) && (
                <View className="rounded-lg p-sm mb-md bg-semantic-error-light dark:bg-semantic-error/[0.15]">
                  <Text className="text-xs text-semantic-error">{errorMessage ?? error}</Text>
                </View>
              )}
              <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                <CardForm
                  onSubmit={async (payload) => {
                    await runPayment(payload);
                  }}
                  loading={loading}
                  submitLabel={t('PaySecurely')}
                  cardNumberLabel={t('CardNumber')}
                  expiryLabel={t('ExpiryDate')}
                  cvcLabel={t('CVV')}
                  nameLabel={t('NameOnCard')}
                  cardNumberPlaceholder={t('CardNumberPlaceholder')}
                  expiryPlaceholder={t('ExpiryPlaceholder')}
                  cvcPlaceholder={t('CVVPlaceholder')}
                  namePlaceholder={t('NameOnCardPlaceholder')}
                />
              </ScrollView>
            </View>
          </View>
        )}
      </Modal>

      <MyTicketRequestsModal
        visible={showMyRequests}
        eventId={eventId}
        onClose={() => setShowMyRequests(false)}
      />

      <MyTicketWaitlistModal
        visible={showMyWaitlist}
        eventId={eventId}
        onClose={() => setShowMyWaitlist(false)}
      />

      <JoinTicketWaitlistModal
        visible={showJoinWaitlist}
        eventId={eventId}
        ticketType={waitlistTicketType}
        onClose={() => {
          setShowJoinWaitlist(false);
          setWaitlistTicketType(null);
        }}
        onSuccess={() => {}}
      />
    </>
  );
};
