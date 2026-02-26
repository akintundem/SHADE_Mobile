/**
 * Central RBAC hook for event dashboard permissions.
 *
 * Role hierarchy (highest → lowest):
 *   Owner          → everything
 *   ORGANIZER      → everything except delete event
 *   COORDINATOR    → budget (read-only), timeline (full), collaboration (read-only),
 *                    RSVP, feeds, reminders
 *   STAFF / ADMIN  → timeline (full), RSVP, feeds
 *   All others     → feeds only (VOLUNTEER, VENDOR, SPEAKER, SPONSOR, MEDIA)
 *
 * Hidden = completely absent from UI (not locked with an icon).
 */
import { useMemo } from 'react';
import { EventUserType, UserEventContext } from '../../../core/events/types/event';

export type EventPermissions = {
  /** Can see and use the full event management dashboard */
  canAccessDashboard: boolean;
  /** Can edit event details (name, dates, description, cover image) */
  canEditEvent: boolean;
  /** Can see Budget menu item (read + write for OWNER/ORGANIZER/COORDINATOR) */
  canViewBudget: boolean;
  /** Can create/edit/delete budget line items */
  canEditBudget: boolean;
  /** Can see Timeline menu item */
  canViewTimeline: boolean;
  /** Can create/edit/delete tasks on the timeline */
  canEditTimeline: boolean;
  /** Can see Collaboration menu item */
  canViewCollaboration: boolean;
  /** Can invite / remove collaborators */
  canManageCollaborators: boolean;
  /** Can see Guest List / RSVP menu item */
  canViewRSVP: boolean;
  /** Can see Tickets menu item */
  canViewTickets: boolean;
  /** Can create/edit/delete/issue ticket types and perform bulk actions */
  canEditTickets: boolean;
  /** Can see and create Reminders */
  canViewReminders: boolean;
  /** Can see Media Library menu item */
  canViewMedia: boolean;
  /** Can upload/delete/update media in the library */
  canEditMedia: boolean;
  /** Can see Assets menu item */
  canViewAssets: boolean;
  /** Can upload/delete assets */
  canEditAssets: boolean;
  /** Can see Event Feeds menu item */
  canViewFeeds: boolean;
  /** Can permanently delete the event */
  canDeleteEvent: boolean;
};

const FULL_ACCESS: EventPermissions = {
  canAccessDashboard: true,
  canEditEvent: true,
  canViewBudget: true,
  canEditBudget: true,
  canViewTimeline: true,
  canEditTimeline: true,
  canViewCollaboration: true,
  canManageCollaborators: true,
  canViewRSVP: true,
  canViewTickets: true,
  canEditTickets: true,
  canViewReminders: true,
  canViewMedia: true,
  canEditMedia: true,
  canViewAssets: true,
  canEditAssets: true,
  canViewFeeds: true,
  canDeleteEvent: true,
};

const NO_ACCESS: EventPermissions = {
  canAccessDashboard: false,
  canEditEvent: false,
  canViewBudget: false,
  canEditBudget: false,
  canViewTimeline: false,
  canEditTimeline: false,
  canViewCollaboration: false,
  canManageCollaborators: false,
  canViewRSVP: false,
  canViewTickets: false,
  canEditTickets: false,
  canViewReminders: false,
  canViewMedia: false,
  canEditMedia: false,
  canViewAssets: false,
  canEditAssets: false,
  canViewFeeds: false,
  canDeleteEvent: false,
};

function resolvePermissions(userContext: UserEventContext | null | undefined): EventPermissions {
  if (!userContext) return NO_ACCESS;

  // Owners get everything
  if (userContext.isOwner) return FULL_ACCESS;

  const role = userContext.eventRole;

  // ORGANIZER — full except delete
  if (userContext.isCollaborator && role === EventUserType.ORGANIZER) {
    return { ...FULL_ACCESS, canDeleteEvent: false };
  }

  // COORDINATOR — budget (read), timeline (full), collaboration (read), RSVP, feeds, reminders
  if (userContext.isCollaborator && (role === EventUserType.COORDINATOR)) {
    return {
      ...NO_ACCESS,
      canAccessDashboard: true,
      canViewBudget: true,
      canEditBudget: false,
      canViewTimeline: true,
      canEditTimeline: true,
      canViewCollaboration: true,
      canManageCollaborators: false,
      canViewRSVP: true,
      canViewReminders: true,
      canViewFeeds: true,
    };
  }

  // STAFF / ADMIN — timeline (full), RSVP, feeds
  if (
    userContext.isCollaborator &&
    (role === EventUserType.STAFF || role === EventUserType.ADMIN)
  ) {
    return {
      ...NO_ACCESS,
      canAccessDashboard: true,
      canViewTimeline: true,
      canEditTimeline: true,
      canViewRSVP: true,
      canViewFeeds: true,
    };
  }

  // COLLABORATOR (generic) — same as STAFF for now
  if (userContext.isCollaborator && role === EventUserType.COLLABORATOR) {
    return {
      ...NO_ACCESS,
      canAccessDashboard: true,
      canViewTimeline: true,
      canEditTimeline: true,
      canViewRSVP: true,
      canViewFeeds: true,
    };
  }

  // All other collaborator roles (VOLUNTEER, VENDOR, SPEAKER, SPONSOR, MEDIA) — feeds only
  if (userContext.isCollaborator) {
    return {
      ...NO_ACCESS,
      canAccessDashboard: true,
      canViewFeeds: true,
    };
  }

  // Non-collaborator / attendee / public — no management access
  return NO_ACCESS;
}

export function useEventPermissions(
  userContext: UserEventContext | null | undefined
): EventPermissions {
  return useMemo(() => resolvePermissions(userContext), [userContext]);
}
