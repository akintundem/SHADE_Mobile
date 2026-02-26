import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  Linking,
  RefreshControl,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Calendar,
  ChevronLeft,
  ExternalLink,
  Globe,
  Lock,
  MapPin,
  Share2,
  Ticket,
  Users,
} from 'lucide-react-native';
import { getImageUrl } from '../../../config/appConfig';
import { useTheme } from '../../../common/theme/ThemeProvider';
import { useI18n } from '../../../common/i18n/I18nProvider';
import { EmptyState, LoadingOverlay } from '../../../common/components/LoadingStates';
import { eventService } from '../../../core/events/services/event';
import type { CardPaymentPayload } from '../../../core/payment/types';
import { paymentService } from '../../../core/payment/services/payment';
import { ticketService } from '../../../core/tickets/services/ticket';
import { EventAccessType, EventResponse, EventStatus, UserEventContext } from '../../../core/events/types/event';
import { TicketCheckoutItemRequest, TicketCheckoutStatus, TicketTypeSummary } from '../../../core/tickets/types/ticket';
import { ErrorHandler } from '../../../common/utils/errorHandler';
import { dateUtils } from '../../../common/utils/helpers';
import { DATE_FORMATS } from '../../../common/utils/constants';
import { RsvpStatusCard } from '../components/RsvpStatusCard';
import { TicketRequiredModal } from '../../feeds/components/TicketRequiredModal';
import { InviteRequiredModal } from '../../feeds/components/InviteRequiredModal';
import { attendeeService } from '../../../core/attendee/services/attendee';
import { appConfig } from '../../../config/appConfig';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1400&auto=format&fit=crop';

const EVENT_TYPE_I18N_KEYS: Record<string, string> = {
  CONFERENCE: 'EventTypeConference',
  WORKSHOP: 'EventTypeWorkshop',
  SEMINAR: 'EventTypeSeminar',
  MEETING: 'EventTypeMeeting',
  PARTY: 'EventTypeParty',
  WEDDING: 'EventTypeWedding',
  BIRTHDAY: 'EventTypeBirthday',
  CORPORATE_EVENT: 'EventTypeCorporateEvent',
  TRADE_SHOW: 'EventTypeTradeShow',
  CONCERT: 'EventTypeConcert',
  FESTIVAL: 'EventTypeFestival',
  SPORTS_EVENT: 'EventTypeSportsEvent',
  CHARITY_EVENT: 'EventTypeCharityEvent',
  NETWORKING: 'EventTypeNetworking',
  TRAINING: 'EventTypeTraining',
  RETREAT: 'EventTypeRetreat',
  OTHER: 'EventTypeOther',
};

const STATUS_CONFIG: Record<
  string,
  { i18nKey: string; textClass: string; bgClass: string }
> = {
  DRAFT: { i18nKey: 'Draft', textClass: 'text-txt-tertiary dark:text-txt-dark-tertiary', bgClass: 'bg-light-surface dark:bg-dark-surface' },
  PLANNING: { i18nKey: 'Draft', textClass: 'text-txt-tertiary dark:text-txt-dark-tertiary', bgClass: 'bg-light-surface dark:bg-dark-surface' },
  PUBLISHED: { i18nKey: 'Published', textClass: 'text-semantic-success', bgClass: 'bg-semantic-success/10' },
  REGISTRATION_OPEN: { i18nKey: 'RegistrationOpen', textClass: 'text-semantic-success', bgClass: 'bg-semantic-success/10' },
  REGISTRATION_CLOSED: { i18nKey: 'RegistrationClosed', textClass: 'text-semantic-warning', bgClass: 'bg-semantic-warning/10' },
  IN_PROGRESS: { i18nKey: 'Live', textClass: 'text-semantic-error', bgClass: 'bg-semantic-error/10' },
  COMPLETED: { i18nKey: 'Completed', textClass: 'text-txt-tertiary dark:text-txt-dark-tertiary', bgClass: 'bg-light-surface dark:bg-dark-surface' },
  CANCELLED: { i18nKey: 'Cancelled', textClass: 'text-semantic-error', bgClass: 'bg-semantic-error/10' },
  POSTPONED: { i18nKey: 'Postponed', textClass: 'text-semantic-warning', bgClass: 'bg-semantic-warning/10' },
};

function formatPrice(priceMinor: number, currency = 'USD'): string {
  const amount = priceMinor / 100;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function TicketTypeRow({ ticket }: { ticket: TicketTypeSummary }) {
  const { t } = useI18n();
  const isFree = !ticket.priceMinor || ticket.priceMinor === 0 || ticket.isFree;
  const soldOut = ticket.quantityRemaining === 0;
  const unavailable = !ticket.isAvailable || !ticket.isActive;

  return (
    <View className="flex-row items-center justify-between py-md">
      <View className="flex-1 mr-md">
        <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
          {ticket.name}
        </Text>
        {ticket.description ? (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]" numberOfLines={2}>
            {ticket.description}
          </Text>
        ) : null}
        {ticket.maxPerPerson ? (
          <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
            {t('MaxPerPerson').replace('{max}', String(ticket.maxPerPerson))}
          </Text>
        ) : null}
      </View>

      <View className="items-end gap-[3px]">
        <Text className="text-sm font-bold text-txt-primary dark:text-txt-dark-primary">
          {isFree ? t('Free') : formatPrice(ticket.priceMinor!, ticket.currency ?? 'USD')}
        </Text>
        {soldOut ? (
          <Text className="text-xs font-medium text-semantic-error">{t('SoldOut')}</Text>
        ) : unavailable ? (
          <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary">
            {ticket.statusMessage ?? t('Unavailable')}
          </Text>
        ) : ticket.quantityRemaining != null && ticket.quantityRemaining <= 10 ? (
          <Text className="text-xs font-medium text-semantic-warning">
            {ticket.quantityRemaining} {t('Left').toLowerCase()}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

type Props = {
  eventId: string;
  initialEvent?: EventResponse | null;
  accessType?: EventAccessType | null;
  userContext?: UserEventContext | null;
  ticketTypes?: TicketTypeSummary[] | null;
  onBack: () => void;
  onAdminPress?: () => void;
};

export function EventDetailScreen({
  eventId,
  initialEvent,
  userContext: initialUserContext,
  ticketTypes: initialTicketTypes,
  onBack,
  onAdminPress,
}: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { t } = useI18n();

  const [event, setEvent] = useState<EventResponse | null>(initialEvent ?? null);
  const [loading, setLoading] = useState(!initialEvent);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Ticket checkout state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Invite request state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null);

  const fetchEvent = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) {
        setRefreshing(true);
      } else if (!initialEvent) {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await eventService.getEvent(eventId, 'full');
        setEvent(data as EventResponse);
      } catch (err) {
        const e = err instanceof Error ? err : new Error(String(err));
        setError(e);
        ErrorHandler.handle(err, 'EventDetailScreen.fetchEvent');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [eventId, initialEvent]
  );

  useEffect(() => {
    if (!initialEvent) {
      fetchEvent();
    }
  }, [fetchEvent, initialEvent]);

  const handleShare = useCallback(async () => {
    if (!event) return;
    try {
      await Share.share({
        title: event.name,
        message: event.hashtag ? `${event.name} ${event.hashtag}` : event.name,
      });
    } catch {
      // dismissed
    }
  }, [event]);

  const handleOpenWebsite = useCallback(() => {
    if (event?.eventWebsiteUrl) {
      Linking.openURL(event.eventWebsiteUrl);
    }
  }, [event]);

  const handleTicketAction = useCallback(
    async (
      payload: { items: TicketCheckoutItemRequest[]; promotionCode?: string | null },
      cardPayload?: CardPaymentPayload
    ) => {
      setCheckoutLoading(true);
      setCheckoutError(null);
      try {
        const checkout = await ticketService.startTicketCheckout(eventId, {
          items: payload.items,
          promotionCode: payload.promotionCode ?? null,
        });

        if (checkout.status === TicketCheckoutStatus.PENDING_PAYMENT && checkout.id) {
          const payment = await ticketService.startTicketPayment(eventId, checkout.id);
          if (appConfig.useInAppPayment) {
            const result = await paymentService.completeTicketCheckoutPayment(
              eventId,
              checkout.id,
              cardPayload
            );
            if (result.success) {
              setShowTicketModal(false);
              setCheckoutError(null);
              fetchEvent(true);
            } else {
              setCheckoutError(result.message ?? t('UnableToCompletePurchase') ?? 'Payment failed. Please try again.');
            }
            return;
          }
          if (payment.paymentUrl) {
            await Linking.openURL(payment.paymentUrl);
          }
        }

        setShowTicketModal(false);
        setCheckoutError(null);
      } catch (err) {
        setCheckoutError(t('UnableToCompletePurchase') ?? 'Unable to complete checkout. Please try again.');
        throw err;
      } finally {
        setCheckoutLoading(false);
      }
    },
    [eventId, t, fetchEvent]
  );

  const handleInviteAction = useCallback(async () => {
    setInviteLoading(true);
    setInviteError(null);
    setInviteSuccess(null);
    try {
      await attendeeService.rsvpToEvent(eventId);
      setInviteSuccess(t('InviteOnlyMessage'));
    } catch (err) {
      setInviteError(t('UnableToPost') ?? 'Unable to send request. Please try again.');
      throw err;
    } finally {
      setInviteLoading(false);
    }
  }, [eventId, t]);

  const userCtx = event?.userContext ?? initialUserContext ?? null;
  const tickets = event?.ticketTypes ?? initialTicketTypes ?? null;
  const canManage = userCtx?.isOwner || userCtx?.isCollaborator;
  const hasValidTicket = userCtx?.hasValidTicket === true;
  const hasAcceptedInvite = userCtx?.hasInvite === true && userCtx?.inviteStatus === 'ACCEPTED';

  const isTicketedEvent = event?.accessType === EventAccessType.TICKETED;
  const isInviteOnlyEvent = event?.accessType === EventAccessType.INVITE_ONLY;
  const isActiveEvent =
    event?.eventStatus !== EventStatus.CANCELLED &&
    event?.eventStatus !== EventStatus.COMPLETED;

  const showGetTicketsButton =
    !canManage &&
    isTicketedEvent &&
    isActiveEvent &&
    !hasValidTicket &&
    tickets != null &&
    tickets.length > 0;

  const showRequestInviteButton =
    !canManage &&
    isInviteOnlyEvent &&
    isActiveEvent &&
    !hasAcceptedInvite;

  const statusConfig =
    STATUS_CONFIG[event?.eventStatus ?? ''] ?? STATUS_CONFIG.DRAFT;

  const formattedDate = event?.startDateTime
    ? dateUtils.formatDate(event.startDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : null;

  const formattedEnd = event?.endDateTime
    ? dateUtils.formatDate(event.endDateTime, DATE_FORMATS.DISPLAY_DATETIME)
    : null;

  const venueLines = [
    event?.venue?.address,
    [event?.venue?.city, event?.venue?.state].filter(Boolean).join(', '),
    event?.venue?.country,
  ].filter(Boolean);

  const accessIcon =
    event?.accessType === EventAccessType.INVITE_ONLY ||
    event?.accessType === EventAccessType.TICKETED ? (
      <Lock size={13} color={colors.text.tertiary} strokeWidth={2} />
    ) : (
      <Globe size={13} color={colors.text.tertiary} strokeWidth={2} />
    );

  const accessLabel =
    event?.accessType === EventAccessType.TICKETED
      ? t('Ticketed')
      : event?.accessType === EventAccessType.INVITE_ONLY
      ? t('InviteOnly')
      : event?.accessType === EventAccessType.RSVP_REQUIRED
      ? t('RSVPRequired')
      : t('OpenToAll');

  const eventTypeLabel = event?.eventType
    ? t((EVENT_TYPE_I18N_KEYS[event.eventType] ?? 'EventTypeOther') as Parameters<typeof t>[0])
    : null;

  if (loading) {
    return <LoadingOverlay visible={true} />;
  }

  if (error || !event) {
    return (
      <SafeAreaView className="flex-1 bg-light-background dark:bg-dark-background" edges={['top']}>
        <TouchableOpacity onPress={onBack} className="p-lg">
          <ChevronLeft size={28} color={colors.text.primary} strokeWidth={2} />
        </TouchableOpacity>
        <View className="flex-1 items-center justify-center px-xl">
          <EmptyState
            icon={<Calendar size={40} color={colors.text.tertiary} />}
            title={t('EventNotFound')}
            subtitle={error?.message}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1 bg-light-background dark:bg-dark-background">
      {/* Back/share bar at physical top of screen (pull up past parent SafeAreaView) */}
      <View
        className="absolute left-0 right-0 z-[100] flex-row items-center justify-between px-md"
        style={{ top: -insets.top, paddingTop: insets.top }}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          onPress={onBack}
          activeOpacity={0.8}
          className="w-9 h-9 rounded-full bg-dark-overlay/60 items-center justify-center"
        >
          <ChevronLeft size={22} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <View className="flex-row gap-sm">
          <TouchableOpacity
            onPress={handleShare}
            activeOpacity={0.8}
            className="w-9 h-9 rounded-full bg-dark-overlay/60 items-center justify-center"
          >
            <Share2 size={17} color="#fff" strokeWidth={2.2} />
          </TouchableOpacity>
          {canManage && onAdminPress && (
            <TouchableOpacity
              onPress={onAdminPress}
              activeOpacity={0.8}
              className="px-md h-9 rounded-full bg-dark-overlay/60 items-center justify-center"
            >
              <Text className="text-xs font-semibold text-white">{t('Manage')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchEvent(true)}
            tintColor={colors.text.primary}
          />
        }
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom + 24, 40) }}
      >
        {/* Hero image - no overlay so the photo stays clear */}
        <View className="relative">
          <Image
            source={{ uri: getImageUrl(event.coverImageUrl) || FALLBACK_IMAGE }}
            className="w-full"
            style={{ height: 260 }}
            resizeMode="cover"
          />
          {/* Status pill over image */}
          <View className="absolute bottom-md left-lg">
            <View className={`self-start px-sm py-[4px] rounded-full ${statusConfig.bgClass}`}>
              <Text className={`text-xs font-semibold ${statusConfig.textClass}`}>
                {t(statusConfig.i18nKey as Parameters<typeof t>[0])}
              </Text>
            </View>
          </View>
        </View>

        <View className="px-lg pt-lg gap-lg">
          {/* Title + type */}
          <View>
            <Text className="text-2xl font-bold text-txt-primary dark:text-txt-dark-primary leading-tight">
              {event.name}
            </Text>
            <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary mt-xs">
              {eventTypeLabel ?? t('EventTypeOther')}
              {event.hashtag ? ` · ${event.hashtag}` : ''}
            </Text>
          </View>

          {/* Key info card */}
          <View className="rounded-xl border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface p-lg gap-md">
            {formattedDate && (
              <View className="flex-row items-start gap-md">
                <View className="w-8 h-8 rounded-lg bg-light-surface-soft dark:bg-dark-surface-elevated items-center justify-center mt-[1px]">
                  <Calendar size={16} color={colors.text.secondary} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                    {t('DateAndTime')}
                  </Text>
                  <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {formattedDate}
                  </Text>
                  {formattedEnd && (
                    <Text className="text-xs text-txt-tertiary dark:text-txt-dark-tertiary mt-[2px]">
                      {t('Ends')} {formattedEnd}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {venueLines.length > 0 && (
              <View className="flex-row items-start gap-md">
                <View className="w-8 h-8 rounded-lg bg-light-surface-soft dark:bg-dark-surface-elevated items-center justify-center mt-[1px]">
                  <MapPin size={16} color={colors.text.secondary} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                    {t('Location')}
                  </Text>
                  {venueLines.map((line, i) => (
                    <Text
                      key={i}
                      className={`text-sm ${i === 0 ? 'font-semibold text-txt-primary dark:text-txt-dark-primary' : 'text-txt-tertiary dark:text-txt-dark-tertiary'}`}
                    >
                      {line}
                    </Text>
                  ))}
                </View>
              </View>
            )}

            {event.capacity != null && (
              <View className="flex-row items-start gap-md">
                <View className="w-8 h-8 rounded-lg bg-light-surface-soft dark:bg-dark-surface-elevated items-center justify-center mt-[1px]">
                  <Users size={16} color={colors.text.secondary} strokeWidth={2} />
                </View>
                <View className="flex-1">
                  <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                    {t('Capacity')}
                  </Text>
                  <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                    {event.currentAttendeeCount ?? 0} / {event.capacity} {t('Attending').toLowerCase()}
                  </Text>
                </View>
              </View>
            )}

            <View className="flex-row items-center gap-md">
              <View className="w-8 h-8 rounded-lg bg-light-surface-soft dark:bg-dark-surface-elevated items-center justify-center">
                {accessIcon}
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium text-txt-tertiary dark:text-txt-dark-tertiary mb-[2px]">
                  {t('Access')}
                </Text>
                <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {accessLabel}
                </Text>
              </View>
            </View>
          </View>

          {/* RSVP card — for non-managers on active non-invite-only events */}
          {!canManage && isActiveEvent && !isInviteOnlyEvent && (
            <RsvpStatusCard eventId={event.id} />
          )}

          {/* Request invite CTA — for invite-only events where user hasn't been accepted */}
          {showRequestInviteButton && (
            <TouchableOpacity
              onPress={() => {
                setInviteError(null);
                setInviteSuccess(null);
                setShowInviteModal(true);
              }}
              activeOpacity={0.8}
              className="w-full h-12 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface items-center justify-center flex-row gap-sm"
            >
              <Lock size={16} color={colors.text.primary} strokeWidth={2} />
              <Text className="text-sm font-semibold text-txt-primary dark:text-txt-dark-primary">
                {t('RequestInvite')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Description */}
          {event.description ? (
            <View>
              <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary mb-sm">
                {t('About')}
              </Text>
              <Text className="text-sm text-txt-secondary dark:text-txt-dark-secondary leading-[22px]">
                {event.description}
              </Text>
            </View>
          ) : null}

          {/* Ticket types */}
          {tickets && tickets.length > 0 && (
            <View>
              <View className="flex-row items-center gap-sm mb-sm">
                <Ticket size={16} color={colors.text.primary} strokeWidth={2} />
                <Text className="text-base font-semibold text-txt-primary dark:text-txt-dark-primary">
                  {t('Tickets')}
                </Text>
              </View>
              <View className="rounded-xl border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface px-lg">
                {tickets.map((ticket, i) => (
                  <TicketTypeRow key={ticket.id ?? i} ticket={ticket} />
                ))}
              </View>

              {showGetTicketsButton && (
                <TouchableOpacity
                  onPress={() => {
                    setCheckoutError(null);
                    setShowTicketModal(true);
                  }}
                  activeOpacity={0.8}
                  className="mt-md w-full h-12 rounded-xl bg-neutral-black dark:bg-neutral-white items-center justify-center flex-row gap-sm"
                >
                  <Ticket size={16} color={colors.text.inverse} strokeWidth={2} />
                  <Text className="text-sm font-semibold text-txt-inverse dark:text-txt-dark-inverse">
                    {t('GetTickets')}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Website link */}
          {event.eventWebsiteUrl ? (
            <TouchableOpacity
              onPress={handleOpenWebsite}
              activeOpacity={0.7}
              className="flex-row items-center gap-sm py-md px-lg rounded-xl border border-light-border-muted dark:border-dark-border-strong bg-light-surface dark:bg-dark-surface"
            >
              <ExternalLink size={16} color={colors.text.secondary} strokeWidth={2} />
              <Text className="flex-1 text-sm font-medium text-txt-secondary dark:text-txt-dark-secondary" numberOfLines={1}>
                {event.eventWebsiteUrl}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      {/* Ticket purchase modal */}
      {showTicketModal && tickets && (
        <TicketRequiredModal
          visible={showTicketModal}
          eventId={event.id}
          eventName={event.name}
          description={event.description}
          coverImageUrl={getImageUrl(event.coverImageUrl) ?? event.coverImageUrl}
          startDateTime={event.startDateTime}
          venue={event.venue?.address ?? null}
          city={event.venue?.city ?? null}
          state={event.venue?.state ?? null}
          attendeeCount={event.currentAttendeeCount}
          capacity={event.capacity}
          ticketTypes={tickets}
          onAction={handleTicketAction}
          loading={checkoutLoading}
          errorMessage={checkoutError ?? undefined}
          onClose={() => {
            setShowTicketModal(false);
            setCheckoutError(null);
          }}
        />
      )}

      {/* Invite request modal */}
      {showInviteModal && (
        <InviteRequiredModal
          visible={showInviteModal}
          eventId={event.id}
          eventName={event.name}
          description={event.description}
          coverImageUrl={getImageUrl(event.coverImageUrl) ?? event.coverImageUrl}
          startDateTime={event.startDateTime}
          venue={event.venue?.address ?? null}
          city={event.venue?.city ?? null}
          state={event.venue?.state ?? null}
          attendeeCount={event.currentAttendeeCount}
          capacity={event.capacity}
          onAction={handleInviteAction}
          loading={inviteLoading}
          errorMessage={inviteError ?? undefined}
          successMessage={inviteSuccess}
          onClose={() => {
            setShowInviteModal(false);
            setInviteError(null);
            setInviteSuccess(null);
          }}
        />
      )}
    </View>
  );
}
