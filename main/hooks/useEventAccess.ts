import { useState, useCallback } from 'react';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { RootStackNavigationProp } from '../../navigation/types';
import { EventItem } from '../../features/event-dashboard/dashboard/components/EventCard';
import { EventAccessType, UserAccessStatus } from '../../core/events/types/event';
import { attendeeService } from '../../core/attendee/services/attendee';
import type { CardPaymentPayload } from '../../core/payment/types';
import { paymentService } from '../../core/payment/services/payment';
import { ticketService } from '../../core/tickets/services/ticket';
import { TicketCheckoutItemRequest, TicketCheckoutStatus } from '../../core/tickets/types/ticket';
import { appConfig } from '../../config/appConfig';

export type AccessRequirement = 'ticket' | 'rsvp' | 'invite' | null;

/**
 * Determines what access requirement a user needs to complete for an event
 */
export const getAccessRequirement = (event: EventItem): AccessRequirement => {
  const { accessType, userContext } = event;

  if (!accessType || accessType === EventAccessType.OPEN) return null;
  // Owners and collaborators always have full access
  if (userContext?.isOwner === true || userContext?.isCollaborator === true) return null;

  if (userContext) {
    switch (accessType) {
      case EventAccessType.TICKETED:
        return userContext.hasValidTicket !== true ? 'ticket' : null;
      case EventAccessType.RSVP_REQUIRED:
        return !(userContext.hasRsvp === true && userContext.rsvpStatus === 'CONFIRMED') ? 'rsvp' : null;
      case EventAccessType.INVITE_ONLY:
        return !(userContext.hasInvite === true && userContext.inviteStatus === 'ACCEPTED') ? 'invite' : null;
      default:
        return null;
    }
  }

  // No userContext for restricted event
  switch (accessType) {
    case EventAccessType.TICKETED:
      return 'ticket';
    case EventAccessType.RSVP_REQUIRED:
      return 'rsvp';
    case EventAccessType.INVITE_ONLY:
      return 'invite';
    default:
      return null;
  }
};

export type ActionResult = {
  type: 'success' | 'error';
  message: string;
} | null;

export type UseEventAccessReturn = {
  // State
  selectedEvent: EventItem | null;
  showTicketModal: boolean;
  showRSVPModal: boolean;
  showInviteModal: boolean;
  actionLoading: boolean;
  actionResult: ActionResult;

  // Handlers
  handleEventPress: (event: EventItem) => void;
  handleTicketModalDismiss: () => void;
  handleRSVPModalDismiss: () => void;
  handleInviteModalDismiss: () => void;
  handleTicketAction: (payload: { items: TicketCheckoutItemRequest[]; promotionCode?: string | null }) => Promise<void>;
  handleRSVPAction: () => Promise<void>;
  handleInviteAction: () => Promise<void>;
  isProcessing: boolean;
};

/**
 * Hook to manage event access control and navigation
 * Handles showing appropriate modals for ticketed, RSVP, and invite-only events
 */
export const useEventAccess = (currentUserId?: string): UseEventAccessReturn => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [showRSVPModal, setShowRSVPModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<ActionResult>(null);

  const navigateToFeed = useCallback((event: EventItem) => {
    navigation.navigate('EventFeeds', {
      eventId: event.id,
      eventName: event.title,
      coverImageUrl: event.imageUrl,
      userContext: event.userContext,
      ticketTypes: event.ticketTypes,
    });
  }, [navigation]);

  const dismissAll = useCallback(() => {
    setShowTicketModal(false);
    setShowRSVPModal(false);
    setShowInviteModal(false);
    setSelectedEvent(null);
    setActionResult(null);
  }, []);

  const handleEventPress = useCallback((event: EventItem) => {
    const userContext = event.userContext;

    // Determine management/ownership status
    const accessStatus = userContext?.accessStatus;
    const accessStatusIsManager = accessStatus
      ? [
          UserAccessStatus.OWNER,
          UserAccessStatus.ORGANIZER,
          UserAccessStatus.COORDINATOR,
          UserAccessStatus.COLLABORATOR,
        ].includes(accessStatus)
      : false;
    const isOwnerFromContext = userContext?.isOwner ?? false;
    const isOwnerFromId = currentUserId && event.ownerId && event.ownerId === currentUserId;
    const isOwner = isOwnerFromContext || Boolean(isOwnerFromId) || accessStatus === UserAccessStatus.OWNER;
    const isCollaborator = userContext?.isCollaborator ?? accessStatus === UserAccessStatus.COLLABORATOR;
    const canManageEvent = accessStatusIsManager || isOwner || isCollaborator;

    if (isOwner || isCollaborator || canManageEvent) {
      navigation.navigate('EventAdmin', {
        eventId: event.id,
        title: event.title,
        imageUrl: event.imageUrl,
        description: event.description,
        status: event.status,
        accessType: event.accessType,
        userContext: event.userContext,
        ticketTypes: event.ticketTypes,
      });
      return;
    }

    const accessRequired = getAccessRequirement(event);

    if (accessRequired) {
      setSelectedEvent(event);
      setActionResult(null);
      switch (accessRequired) {
        case 'ticket':
          setShowTicketModal(true);
          break;
        case 'rsvp':
          setShowRSVPModal(true);
          break;
        case 'invite':
          setShowInviteModal(true);
          break;
      }
    } else {
      // User has access, go to EventFeeds
      navigation.navigate('EventFeeds', {
        eventId: event.id,
        eventName: event.title,
        coverImageUrl: event.imageUrl,
        accessType: event.accessType,
        userContext: event.userContext,
        ticketTypes: event.ticketTypes,
      });
    }
  }, [navigation, currentUserId]);

  const handleTicketModalDismiss = useCallback(() => {
    setShowTicketModal(false);
    setSelectedEvent(null);
    setActionResult(null);
  }, []);

  const handleRSVPModalDismiss = useCallback(() => {
    setShowRSVPModal(false);
    setSelectedEvent(null);
    setActionResult(null);
  }, []);

  const handleInviteModalDismiss = useCallback(() => {
    setShowInviteModal(false);
    setSelectedEvent(null);
    setActionResult(null);
  }, []);

  const handleTicketAction = useCallback(
    async (
      payload: { items: TicketCheckoutItemRequest[]; promotionCode?: string | null },
      cardPayload?: CardPaymentPayload
    ) => {
      if (!selectedEvent) {
        throw new Error('No event selected');
      }
      if (!payload.items || payload.items.length === 0) {
        throw new Error('No ticket selection');
      }
      setActionLoading(true);
      try {
        const checkout = await ticketService.startTicketCheckout(selectedEvent.id, {
          items: payload.items,
          promotionCode: payload.promotionCode ?? null,
        });

        if (checkout.status === TicketCheckoutStatus.PENDING_PAYMENT && checkout.id) {
          const payment = await ticketService.startTicketPayment(selectedEvent.id, checkout.id);
          if (appConfig.useInAppPayment) {
            const result = await paymentService.completeTicketCheckoutPayment(
              selectedEvent.id,
              checkout.id,
              cardPayload
            );
            if (result.success) {
              setShowTicketModal(false);
              setSelectedEvent(null);
              setActionResult(null);
              navigateToFeed(selectedEvent);
            } else {
              setActionResult({
                type: 'error',
                message: result.message ?? 'Payment failed. Please try again.',
              });
            }
            return;
          }
          if (payment.paymentUrl) {
            await Linking.openURL(payment.paymentUrl);
          }
        }

        dismissAll();
      } catch (error) {
        setActionResult({ type: 'error', message: 'Unable to complete checkout. Please try again.' });
        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [dismissAll, selectedEvent, navigateToFeed]
  );

  const handleRSVPAction = useCallback(async () => {
    if (!selectedEvent) {
      throw new Error('No event selected');
    }
    setActionLoading(true);
    try {
      await attendeeService.rsvpToEvent(selectedEvent.id);
      // RSVP grants instant access - navigate to the feed
      setShowRSVPModal(false);
      setSelectedEvent(null);
      setActionResult(null);
      navigateToFeed(selectedEvent);
    } catch (error) {
      setActionResult({ type: 'error', message: 'Unable to RSVP. Please try again.' });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [navigateToFeed, selectedEvent]);

  const handleInviteAction = useCallback(async () => {
    if (!selectedEvent) {
      throw new Error('No event selected');
    }
    setActionLoading(true);
    try {
      await attendeeService.rsvpToEvent(selectedEvent.id);
      // Show confirmation - user doesn't have access yet, request is pending organizer review
      setActionResult({
        type: 'success',
        message: 'Your request has been sent. The event organizer will review it.',
      });
    } catch (error) {
      setActionResult({ type: 'error', message: 'Unable to send request. Please try again.' });
      throw error;
    } finally {
      setActionLoading(false);
    }
  }, [selectedEvent]);

  return {
    selectedEvent,
    showTicketModal,
    showRSVPModal,
    showInviteModal,
    actionLoading,
    actionResult,
    isProcessing: actionLoading,
    handleEventPress,
    handleTicketModalDismiss,
    handleRSVPModalDismiss,
    handleInviteModalDismiss,
    handleTicketAction,
    handleRSVPAction,
    handleInviteAction,
  };
};
