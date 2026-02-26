import { EventAccessType, EventResponse, EventStatus, UserEventContext } from '../core/events/types/event';
import { TicketTypeSummary } from '../core/tickets/types/ticket';

export type RootStackParamList = {
  MainTabs: undefined;

  EventAdmin: {
    eventId: string;
    title?: string;
    imageUrl?: string;
    description?: string;
    status?: EventStatus;
    accessType?: EventAccessType | null;
    userContext?: UserEventContext | null;
    ticketTypes?: TicketTypeSummary[] | null;
  };

  EventDetail: {
    eventId: string;
    accessType?: EventAccessType | null;
    userContext?: UserEventContext | null;
    ticketTypes?: TicketTypeSummary[] | null;
  };

  EventFeeds: {
    eventId: string;
    eventName?: string;
    coverImageUrl?: string;
    accessType?: EventAccessType | null;
    userContext?: UserEventContext | null;
    ticketTypes?: TicketTypeSummary[] | null;
  };

  BudgetManagement: { eventId: string; userContext?: UserEventContext | null };
  TimelineManagement: { eventId: string; userContext?: UserEventContext | null };
  CollaborationManagement: { eventId: string; userContext?: UserEventContext | null };
  RSVPManagement: { eventId: string; userContext?: UserEventContext | null };
  AttendeeDetail: { eventId: string; attendeeId: string; userContext?: UserEventContext | null };
  InvitesManagement: { eventId: string; userContext?: UserEventContext | null };
  TicketsManagement: { eventId: string; userContext?: UserEventContext | null };
  TicketApprovals: { eventId: string; userContext?: UserEventContext | null };
  TicketWaitlist: { eventId: string; userContext?: UserEventContext | null };
  EventWaitlist: { eventId: string; userContext?: UserEventContext | null };
  MediaLibrary: { eventId: string; userContext?: UserEventContext | null };
  Assets: { eventId: string; userContext?: UserEventContext | null };
  Reminders: { eventId: string; userContext?: UserEventContext | null };

  PublicProfile: {
    userId: string;
    currentUserId?: string;
  };

  FollowersList: {
    userId: string;
    userName?: string;
    currentUserId?: string;
  };

  FollowingList: {
    userId: string;
    userName?: string;
    currentUserId?: string;
  };

  AcceptInviteByToken: {
    token?: string;
  };

  EventSettings: {
    eventId: string;
    event?: EventResponse | null;
    onEventUpdated?: () => void;
  };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export {};
