# Endpoints Not Integrated with UI

This document lists all API endpoints that are **not** currently used in any UI component, screen, or hook.

**Last verified:** January 2026 (audited against actual codebase usage)

## Authentication Service

_All authentication service endpoints have been integrated._

**Note:** The admin variants (`updateNotificationSettings`, `updatePrivacySettings`, `updateSecuritySettings` for other userId) are intentionally not integrated — they are admin/internal endpoints.

## Events Service

| Description | Endpoint | Method | Suggested UI Placement |
|------------|----------|--------|----------------------|
| Get media (single) | `/api/v1/events/{eventId}/media/{mediaId}` | GET | Event Admin > Media detail |
| Update media | `/api/v1/events/{eventId}/media/{mediaId}` | PUT | Event Admin > Media detail |
| Update reminder | `/api/v1/events/{eventId}/reminders/{reminderId}` | PUT | Event Admin > Reminders edit |

## Event Subscription Service

_All event subscription service endpoints have been integrated._

## Event Waitlist Service

_All event waitlist service endpoints have been integrated._

## Tickets Service

_All tickets service endpoints have been integrated._

## Feeds Service

_All feeds service endpoints have been integrated._

## Attendee Service

### Missing Backend Endpoint

| Description | Suggested Endpoint | Method | Why It's Needed |
|------------|-------------------|--------|----------------|
| Request invite to event | `/api/v1/attendees/events/{eventId}/request-invite` | POST | When a user taps an invite-only event, they should be able to request access from the organizer. Currently there is no dedicated endpoint for this. The UI works around this by calling `rsvpToEvent` as a signal of interest, but this is semantically incorrect — RSVP and invite-request are different actions. A proper endpoint should create a pending invite request that the organizer can approve or deny from the Event Admin > Invites screen. |

**Workaround in use:** `useEventAccess.handleInviteAction` calls `attendeeService.rsvpToEvent()` and shows a confirmation message. This should be replaced once a dedicated request-invite endpoint is available.

## Timeline Service

_All timeline service endpoints have been integrated._

## Budget Service

_All budget service endpoints have been integrated._

## Collaboration Service

_All collaboration service endpoints have been integrated._

## Social/User Follow Service

_All social/user follow service endpoints have been integrated._

## Push Notification Service

_All push notification service endpoints have been integrated._

---

## Summary

**Total endpoints not integrated: 3**
**Missing backend endpoints: 1**

### By Service:
- **Authentication Service**: 0 endpoints (all integrated; 3 admin-only endpoints intentionally excluded)
- **Events Service**: 3 endpoints (get single media, update media, update reminder)
- **Event Subscription Service**: 0 endpoints (all integrated)
- **Event Waitlist Service**: 0 endpoints (all integrated)
- **Tickets Service**: 0 endpoints (all integrated)
- **Feeds Service**: 0 endpoints (all integrated)
- **Attendee Service**: 0 not integrated; 1 missing backend endpoint (request invite to event)
- **Timeline Service**: 0 endpoints (all integrated)
- **Budget Service**: 0 endpoints (all integrated)
- **Collaboration Service**: 0 endpoints (all integrated)
- **Social/User Follow Service**: 0 endpoints (all integrated)
- **Push Notification Service**: 0 endpoints (all integrated)

### Priority Areas:
1. **Attendee service request-invite endpoint** — needed for invite-only event access flow; currently using `rsvpToEvent` as a workaround
2. **Events service media/reminder operations** (media detail + reminder edit)
