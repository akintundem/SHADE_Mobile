import React from 'react';
import { EventItem } from '../../features/event-dashboard/dashboard/components/EventCard';
import { TicketRequiredModal } from '../../features/feeds/components/TicketRequiredModal';
import type { TicketCheckoutItemRequest } from '../../core/tickets/types/ticket';
import { RSVPRequiredModal } from '../../features/feeds/components/RSVPRequiredModal';
import { InviteRequiredModal } from '../../features/feeds/components/InviteRequiredModal';
import type { ActionResult } from '../../main/hooks/useEventAccess';
import { getImageUrl } from '../../config/appConfig';

type EventAccessModalsProps = {
  selectedEvent: EventItem | null;
  showTicketModal: boolean;
  showRSVPModal: boolean;
  showInviteModal: boolean;
  onTicketAction: (payload: { items: TicketCheckoutItemRequest[]; promotionCode?: string | null }) => Promise<void>;
  onRSVPAction: () => Promise<void>;
  onInviteAction: () => Promise<void>;
  onTicketDismiss: () => void;
  onRSVPDismiss: () => void;
  onInviteDismiss: () => void;
  isProcessing?: boolean;
  actionResult?: ActionResult;
};

/**
 * Renders all three event access modals (Ticket, RSVP, Invite)
 * Use with the useEventAccess hook for state management
 */
export const EventAccessModals = ({
  selectedEvent,
  showTicketModal,
  showRSVPModal,
  showInviteModal,
  onTicketAction,
  onRSVPAction,
  onInviteAction,
  onTicketDismiss,
  onRSVPDismiss,
  onInviteDismiss,
  isProcessing = false,
  actionResult,
}: EventAccessModalsProps) => {
  const hasValidEvent = Boolean(selectedEvent?.id);
  const [ticketError, setTicketError] = React.useState<string | null>(null);
  const [rsvpError, setRsvpError] = React.useState<string | null>(null);
  const [inviteError, setInviteError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  if (!hasValidEvent) {
    return null;
  }

  const runAction = async (
    type: 'ticket' | 'rsvp' | 'invite',
    payload?: { items: TicketCheckoutItemRequest[]; promotionCode?: string | null }
  ) => {
    setLoading(true);
    if (type === 'ticket') setTicketError(null);
    if (type === 'rsvp') setRsvpError(null);
    if (type === 'invite') setInviteError(null);
    try {
      if (type === 'ticket') {
        await onTicketAction(payload ?? { items: [] });
      } else if (type === 'rsvp') {
        await onRSVPAction();
      } else {
        await onInviteAction();
      }
    } catch (error: any) {
      const message = actionResult?.type === 'error'
        ? actionResult.message
        : 'Unable to complete this action. Please try again.';
      if (type === 'ticket') setTicketError(message);
      if (type === 'rsvp') setRsvpError(message);
      if (type === 'invite') setInviteError(message);
    } finally {
      setLoading(false);
    }
  };

  const successMessage = actionResult?.type === 'success' ? actionResult.message : null;

  return (
    <>
      <TicketRequiredModal
        visible={showTicketModal}
        eventId={selectedEvent?.id || ''}
        eventName={selectedEvent?.title || ''}
        description={selectedEvent?.description}
        coverImageUrl={getImageUrl(selectedEvent?.imageUrl) ?? selectedEvent?.imageUrl}
        startDateTime={selectedEvent?.startAt}
        venue={selectedEvent?.venue}
        city={selectedEvent?.city}
        state={selectedEvent?.state}
        attendeeCount={selectedEvent?.attendeeCount}
        capacity={selectedEvent?.capacity}
        ticketTypes={selectedEvent?.ticketTypes}
        onAction={payload => runAction('ticket', payload)}
        loading={loading || isProcessing}
        errorMessage={ticketError || undefined}
        onClose={onTicketDismiss}
      />

      <RSVPRequiredModal
        visible={showRSVPModal}
        eventId={selectedEvent?.id || ''}
        eventName={selectedEvent?.title || ''}
        description={selectedEvent?.description}
        coverImageUrl={getImageUrl(selectedEvent?.imageUrl) ?? selectedEvent?.imageUrl}
        startDateTime={selectedEvent?.startAt}
        venue={selectedEvent?.venue}
        city={selectedEvent?.city}
        state={selectedEvent?.state}
        attendeeCount={selectedEvent?.attendeeCount}
        capacity={selectedEvent?.capacity}
        onAction={() => runAction('rsvp')}
        loading={loading || isProcessing}
        errorMessage={rsvpError || undefined}
        successMessage={showRSVPModal ? successMessage : null}
        onClose={onRSVPDismiss}
      />

      <InviteRequiredModal
        visible={showInviteModal}
        eventId={selectedEvent?.id || ''}
        eventName={selectedEvent?.title || ''}
        description={selectedEvent?.description}
        coverImageUrl={getImageUrl(selectedEvent?.imageUrl) ?? selectedEvent?.imageUrl}
        startDateTime={selectedEvent?.startAt}
        venue={selectedEvent?.venue}
        city={selectedEvent?.city}
        state={selectedEvent?.state}
        attendeeCount={selectedEvent?.attendeeCount}
        capacity={selectedEvent?.capacity}
        onAction={() => runAction('invite')}
        loading={loading || isProcessing}
        errorMessage={inviteError || undefined}
        successMessage={showInviteModal ? successMessage : null}
        onClose={onInviteDismiss}
      />
    </>
  );
};
