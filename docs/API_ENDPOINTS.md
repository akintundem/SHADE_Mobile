# API Endpoints Documentation

This document outlines all API endpoints used in the Capsule app, including their descriptions, endpoints, query parameters, body types, and UI integration status.

## Authentication Service (`core/auth/services/authService.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Sign in user | `/api/v1/auth/session` (via Cognito) | POST | - | `LoginRequest: { email: string, password: string }` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Sign up user | `/api/v1/auth/signup` (via Cognito) | POST | - | `RegisterRequest: { email: string, password: string }` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Complete signup | `/api/v1/auth/signup` | POST | - | `JitSignupRequest: { email: string, username: string, name?: string, phoneNumber?: string }` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get auth session | `/api/v1/auth/session` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Validate token | N/A (local validation) | - | - | `ValidateTokenRequest: { token?: string }` | Yes | <span style="color:#16A34A;font-weight:600;">No — system/internal</span> |
| Refresh token | N/A (via Cognito) | - | - | - | No | <span style="color:#16A34A;font-weight:600;">No — system/internal</span> |
| Logout | `/api/v1/auth/logout` | POST | - | `{ confirm: true }` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Forgot password | N/A (via Cognito) | - | - | `email: string` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update user profile | `/api/v1/auth/users/{userId}` | PUT | - | `UpdateUserProfileRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Delete user | `/api/v1/auth/users/{userId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get user | `/api/v1/auth/users/{userId}` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Search secure users | `/api/v1/auth/users/search` | GET | `searchTerm: string, page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Search locations | `/api/v1/auth/users/locations/search` | GET | `query?: string, page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Search directory | `/api/v1/auth/users/directory` | GET | `searchTerm: string, page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List directory | `/api/v1/auth/users/directory` | GET | `searchTerm: '' (empty), page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get profile image upload URL | `/api/v1/auth/profile-image/upload-url` | POST | - | `ProfileImageUploadRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Complete profile image upload | `/api/v1/auth/profile-image/complete` | POST | - | `ProfileImageCompleteRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get my posts | `/api/v1/auth/users/me/posts` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get user posts | `/api/v1/auth/users/{userId}/posts` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update my notification settings | `/api/v1/auth/users/me/notification-settings` | PUT | - | `NotificationSettingsUpdateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update notification settings | `/api/v1/auth/users/{userId}/notification-settings` | PUT | - | `NotificationSettingsUpdateRequest` | No | <span style="color:#16A34A;font-weight:600;">No — admin/internal</span> |
| Update my privacy settings | `/api/v1/auth/users/me/privacy-settings` | PUT | - | `PrivacySettingsUpdateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update privacy settings | `/api/v1/auth/users/{userId}/privacy-settings` | PUT | - | `PrivacySettingsUpdateRequest` | No | <span style="color:#16A34A;font-weight:600;">No — admin/internal</span> |
| Update my security settings | `/api/v1/auth/users/me/security-settings` | PUT | - | `SecuritySettingsUpdateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update security settings | `/api/v1/auth/users/{userId}/security-settings` | PUT | - | `SecuritySettingsUpdateRequest` | No | <span style="color:#16A34A;font-weight:600;">No — admin/internal</span> |

## Events Service (`core/events/services/event.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| List events | `/api/v1/events` | GET | `page?: number, size?: number, status?: string, eventType?: string, isPublic?: boolean, startDateFrom?: string, startDateTo?: string, isArchived?: boolean, mine?: boolean, timeframe?: string, search?: string, sortBy?: string, sortDirection?: string` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List my events | `/api/v1/events?mine=true` | GET | Same as listEvents | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get event | `/api/v1/events/{eventId}` | GET | `view?: 'capacity' \| 'visibility' \| 'full' \| 'feed', page?: number, size?: number, postType?: string` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get event capacity | `/api/v1/events/{eventId}?view=capacity` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get event visibility | `/api/v1/events/{eventId}?view=visibility` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get event feed | `/api/v1/events/{eventId}/feed` | GET | `page?: number, size?: number, postType?: string` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Create event | `/api/v1/events` | POST | - | `{ event: CreateEventRequest }` (header: `Idempotency-Key?: string`) | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update event | `/api/v1/events/{eventId}` | PUT | - | `UpdateEventWithCoverUploadRequest` (header: `If-Match?: string`) | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update registration state | `/api/v1/events/{eventId}/registration` | POST | `action: 'open' \| 'close'` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Archive event | `/api/v1/events/{eventId}/archive` | POST | `reason?: string` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Restore event | `/api/v1/events/{eventId}/restore` | POST | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Clone event | `/api/v1/events/{eventId}/clone` | POST | - | `CloneEventRequest?` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get event media | `/api/v1/events/{eventId}/media` | GET | `category?: string, type?: string` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Upload media | `/api/v1/events/{eventId}/media` | POST | - | `EventMediaUploadRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Complete media upload | `/api/v1/events/{eventId}/media/{mediaId}/complete` | POST | - | `EventMediaUploadCompleteRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get media | `/api/v1/events/{eventId}/media/{mediaId}` | GET | - | - | No | <span style="color:#C2410C;font-weight:600;">Yes — Event Admin > Media detail</span> |
| Update media | `/api/v1/events/{eventId}/media/{mediaId}` | PUT | - | `EventMediaRequest` | No | <span style="color:#C2410C;font-weight:600;">Yes — Event Admin > Media detail</span> |
| Delete media | `/api/v1/events/{eventId}/media/{mediaId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get event assets | `/api/v1/events/{eventId}/assets` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Upload asset | `/api/v1/events/{eventId}/assets` | POST | - | `EventMediaUploadRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Complete asset upload | `/api/v1/events/{eventId}/assets/{assetId}/complete` | POST | - | `EventMediaUploadCompleteRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update cover image | `/api/v1/events/{eventId}/cover-image` | PUT | - | `EventMediaUploadRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Create cover image upload | `/api/v1/events/{eventId}/cover-image` | POST | - | `EventMediaUploadRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Complete cover image upload (path) | `/api/v1/events/{eventId}/cover-image/{coverId}/complete` | POST | - | `EventMediaUploadCompleteRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Complete cover image upload (body) | `/api/v1/events/{eventId}/cover-image/complete` | POST | - | `EventCoverImageCompleteRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Remove cover image | `/api/v1/events/{eventId}/cover-image` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get notification settings | `/api/v1/events/{eventId}/notifications` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Send notification | `/api/v1/events/{eventId}/notifications/send` | POST | - | `EventNotificationRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get reminders | `/api/v1/events/{eventId}/reminders` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Create reminder | `/api/v1/events/{eventId}/reminders` | POST | - | `EventReminderRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update reminder | `/api/v1/events/{eventId}/reminders/{reminderId}` | PUT | - | `EventReminderRequest` | No | <span style="color:#C2410C;font-weight:600;">Yes — Event Admin > Reminders edit</span> |
| Delete reminder | `/api/v1/events/{eventId}/reminders/{reminderId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get reminder | `/api/v1/events/{eventId}/reminders/{reminderId}` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get For You feed | `/api/v1/events/for-you` | GET | Same as listEvents | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get Following feed | `/api/v1/events/following` | GET | Same as listEvents | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

## Event Waitlist Service (`core/events/services/waitlist.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Join waitlist | `/api/v1/events/{eventId}/waitlist` | POST | - | `CreateEventWaitlistRequest?` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List waitlist | `/api/v1/events/{eventId}/waitlist` | GET | `status?: string, page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get my waitlist entries | `/api/v1/events/{eventId}/waitlist/my-entries` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Cancel waitlist entry | `/api/v1/events/{eventId}/waitlist/{entryId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

## Tickets Service (`core/tickets/services/ticket.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Issue tickets | `/api/v1/tickets` | POST | - | `IssueTicketRequest[]` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get tickets by event | `/api/v1/tickets/events/{eventId}` | GET | `ticketId?: string, status?: TicketStatus, ticketTypeId?: string, page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC' \| 'DESC'` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Validate ticket | `/api/v1/tickets/validate` | POST | - | `ValidateTicketRequest` | No | <span style="color:#C2410C;font-weight:600;">Yes — Event check-in screen</span> |
| Cancel ticket | `/api/v1/tickets/{ticketId}/cancel` | POST | - | - | No | <span style="color:#C2410C;font-weight:600;">Yes — Ticket detail</span> |
| Refund ticket | `/api/v1/tickets/{ticketId}/refund` | POST | `reason?: string` | - | No | <span style="color:#C2410C;font-weight:600;">Yes — Ticket detail</span> |
| Update ticket | `/api/v1/tickets/{ticketId}` | PUT | - | `UpdateTicketRequest` | No | <span style="color:#C2410C;font-weight:600;">Yes — Ticket detail</span> |
| Transfer ticket | `/api/v1/tickets/{ticketId}/transfer` | POST | - | `TransferTicketRequest` | No | <span style="color:#C2410C;font-weight:600;">Yes — Ticket detail > Transfer</span> |
| Resend ticket | `/api/v1/tickets/{ticketId}/resend` | POST | - | `ResendTicketRequest?` | No | <span style="color:#C2410C;font-weight:600;">Yes — Ticket detail > Resend</span> |
| Bulk ticket action | `/api/v1/tickets/bulk` | POST | - | `BulkTicketActionRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get wallet pass | `/api/v1/tickets/{ticketId}/wallet-pass` | GET | - | - | No | <span style="color:#C2410C;font-weight:600;">Yes — Ticket detail > Add to wallet</span> |
| Create ticket type | `/api/v1/events/{eventId}/ticket-types` | POST | - | `CreateTicketTypeRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get ticket types | `/api/v1/events/{eventId}/ticket-types` | GET | `id?: string, category?: TicketTypeCategory, activeOnly?: boolean, name?: string` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update ticket type | `/api/v1/events/{eventId}/ticket-types/{ticketTypeId}` | PUT | - | `UpdateTicketTypeRequest` (header: `If-Match?: number`) | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Delete ticket type | `/api/v1/events/{eventId}/ticket-types/{ticketTypeId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Clone ticket type | `/api/v1/events/{eventId}/ticket-types/{ticketTypeId}/clone` | POST | - | `CloneTicketTypeRequest?` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Archive ticket type | `/api/v1/events/{eventId}/ticket-types/{ticketTypeId}/archive` | POST | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Restore ticket type | `/api/v1/events/{eventId}/ticket-types/{ticketTypeId}/restore` | POST | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Hard delete ticket type | `/api/v1/events/{eventId}/ticket-types/{ticketTypeId}/hard-delete` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Create ticket type template | `/api/v1/ticket-type-templates` | POST | - | `CreateTicketTypeTemplateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List ticket type templates | `/api/v1/ticket-type-templates` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update ticket type template | `/api/v1/ticket-type-templates/{templateId}` | PUT | - | `UpdateTicketTypeTemplateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Delete ticket type template | `/api/v1/ticket-type-templates/{templateId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Apply ticket type template | `/api/v1/ticket-type-templates/{templateId}/apply/events/{eventId}` | POST | - | `ApplyTicketTypeTemplateRequest?` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Start ticket checkout | `/api/v1/events/{eventId}/tickets/checkout` | POST | - | `TicketCheckoutRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get ticket checkout | `/api/v1/events/{eventId}/tickets/checkout/{checkoutId}` | GET | - | - | No | <span style="color:#C2410C;font-weight:600;">Yes — Checkout status screen</span> |
| Start ticket payment | `/api/v1/events/{eventId}/tickets/checkout/{checkoutId}/start-payment` | POST | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Complete ticket payment (fake) | `/api/v1/events/{eventId}/tickets/checkout/{checkoutId}/fake-payment` | POST | - | `PaymentRequestPayload?` (e.g. `paymentMethod`, `last4`, `expiryMonth`, `expiryYear`) | Yes | <span style="color:#16A34A;font-weight:600;">No</span> — see Payment Service |
| Cancel ticket checkout | `/api/v1/events/{eventId}/tickets/checkout/{checkoutId}/cancel` | POST | - | - | No | <span style="color:#C2410C;font-weight:600;">Yes — Checkout status screen</span> |
| Create approval request | `/api/v1/events/{eventId}/tickets/requests` | POST | - | `CreateTicketApprovalRequest` | No | <span style="color:#C2410C;font-weight:600;">Yes — Ticket request flow (event detail)</span> |
| List approval requests | `/api/v1/events/{eventId}/tickets/requests` | GET | `status?: TicketApprovalStatus, page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC' \| 'DESC'` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List my approval requests | `/api/v1/events/{eventId}/tickets/requests/mine` | GET | - | - | No | <span style="color:#C2410C;font-weight:600;">Yes — Profile > Ticket requests</span> |
| Approve request | `/api/v1/events/{eventId}/tickets/requests/{requestId}/approve` | POST | - | `TicketApprovalDecisionRequest?` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Reject request | `/api/v1/events/{eventId}/tickets/requests/{requestId}/reject` | POST | - | `TicketApprovalDecisionRequest?` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Cancel approval request | `/api/v1/events/{eventId}/tickets/requests/{requestId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Join ticket waitlist | `/api/v1/events/{eventId}/tickets/waitlist` | POST | - | `CreateTicketWaitlistRequest` | No | <span style="color:#C2410C;font-weight:600;">Yes — Ticket Required modal</span> |
| List ticket waitlist | `/api/v1/events/{eventId}/tickets/waitlist` | GET | `status?: TicketWaitlistStatus, page?: number, size?: number, sortBy?: string, sortDirection?: 'ASC' \| 'DESC'` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List my ticket waitlist | `/api/v1/events/{eventId}/tickets/waitlist/mine` | GET | - | - | No | <span style="color:#C2410C;font-weight:600;">Yes — Profile > Ticket waitlist</span> |
| Fulfill waitlist entry | `/api/v1/events/{eventId}/tickets/waitlist/{entryId}/fulfill` | POST | - | `TicketWaitlistFulfillRequest?` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Cancel ticket waitlist entry | `/api/v1/events/{eventId}/tickets/waitlist/{entryId}` | DELETE | - | - | No | <span style="color:#C2410C;font-weight:600;">Yes — Profile > Ticket waitlist</span> |

## Feeds Service (`core/feeds/services/feeds.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Create post | `/api/v1/events/{eventId}/posts` | POST | - | `FeedPostCreateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Complete media upload | `/api/v1/events/{eventId}/posts/{postId}/media/{mediaId}/complete` | POST | - | `FeedPostMediaUploadCompleteRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List posts | `/api/v1/events/{eventId}/posts` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get post | `/api/v1/events/{eventId}/posts/{postId}` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Delete post | `/api/v1/events/{eventId}/posts/{postId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Like post | `/api/v1/events/{eventId}/posts/{postId}/like` | POST | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Unlike post | `/api/v1/events/{eventId}/posts/{postId}/like` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Create comment | `/api/v1/events/{eventId}/posts/{postId}/comments` | POST | - | `CommentCreateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update comment | `/api/v1/events/{eventId}/posts/{postId}/comments/{commentId}` | PUT | - | `CommentUpdateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Delete comment | `/api/v1/events/{eventId}/posts/{postId}/comments/{commentId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get comments | `/api/v1/events/{eventId}/posts/{postId}/comments` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Repost | `/api/v1/events/{eventId}/posts/{postId}/repost` | POST | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Quote post | `/api/v1/events/{eventId}/posts/{postId}/quote` | POST | - | `QuotePostRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

## Attendee Service (`core/attendee/services/attendee.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Add attendees | `/api/v1/attendees` | POST | - | `BulkAttendeeCreateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get attendee | `/api/v1/attendees/{attendeeId}` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Delete attendee | `/api/v1/attendees/{attendeeId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List attendees | `/api/v1/attendees` | GET | `eventId: string, status?: string, checkedIn?: boolean, search?: string, userId?: string, email?: string, page?: number, size?: number, sortBy?: string, sortDirection?: string` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update invite status | `/api/v1/attendees/invites` | POST | `inviteId?: string, token?: string, status: AttendeeInviteStatus` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get tickets by attendee | `/api/v1/attendees/{attendeeId}/tickets` | GET | `eventId?: string, status?: TicketStatus` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Create invite | `/api/v1/attendees/events/{eventId}/invites` | POST | - | `CreateAttendeeInviteRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Create invites bulk | `/api/v1/attendees/events/{eventId}/invites/bulk` | POST | - | `BulkAttendeeInviteRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List invites | `/api/v1/attendees/events/{eventId}/invites` | GET | `status?: string, page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get invite | `/api/v1/attendees/events/{eventId}/invites/{inviteId}` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Revoke invite | `/api/v1/attendees/events/{eventId}/invites/{inviteId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Resend invite | `/api/v1/attendees/events/{eventId}/invites/{inviteId}/resend` | POST | `sendEmail?: boolean, sendPush?: boolean` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get invited events | `/api/v1/attendees/invitations` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| RSVP to event | `/api/v1/attendees/events/{eventId}/rsvp` | POST | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get RSVP status | `/api/v1/attendees/events/{eventId}/rsvp` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update RSVP status | `/api/v1/attendees/events/{eventId}/rsvp` | PUT | - | `UpdateRsvpStatusRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Cancel RSVP | `/api/v1/attendees/events/{eventId}/rsvp` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Bulk update RSVP status | `/api/v1/attendees/events/{eventId}/rsvp/bulk` | POST | - | `BulkRsvpUpdateRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

## Timeline Service (`core/timeline/services/timeline.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Get all tasks | `/api/v1/events/{eventId}/tasks` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Auto-save task | `/api/v1/events/{eventId}/tasks/auto-save` | PATCH | - | `TaskAutoSaveRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Finalize task | `/api/v1/events/{eventId}/tasks/{taskId}/finalize` | PUT | - | `TaskAutoSaveRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update task order | `/api/v1/events/{eventId}/tasks/order` | PATCH | - | `string[]` (task IDs) | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Delete task | `/api/v1/events/{eventId}/tasks/{taskId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Auto-save checklist item | `/api/v1/tasks/{taskId}/checklist/auto-save` | PATCH | - | `ChecklistAutoSaveRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Finalize checklist item | `/api/v1/tasks/{taskId}/checklist/{itemId}/finalize` | PUT | - | `ChecklistAutoSaveRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update checklist order | `/api/v1/tasks/{taskId}/checklist/order` | PATCH | - | `string[]` (item IDs) | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Delete checklist item | `/api/v1/tasks/{taskId}/checklist/{itemId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

## Budget Service (`core/budget/services/budget.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Get budget | `/api/v1/events/{eventId}/budget` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update budget | `/api/v1/events/{eventId}/budget` | PUT | - | `UpdateBudgetRequest` (header: `If-Match?: string`) | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get categories | `/api/v1/events/{eventId}/budget/categories` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Auto-save draft | `/api/v1/events/{eventId}/budget/line-items/auto-save` | PATCH | - | `BudgetLineItemAutoSaveRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get line items | `/api/v1/events/{eventId}/budget/line-items` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Delete line item | `/api/v1/events/{eventId}/budget/line-items/{itemId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Finalize line item | `/api/v1/events/{eventId}/budget/line-items/{itemId}/finalize` | PUT | - | `BudgetLineItemAutoSaveRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

## Collaboration Service (`core/collaboration/services/collaboration.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Get collaborators | `/api/v1/events/{eventId}/collaborators` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Add collaborator | `/api/v1/events/{eventId}/collaborators` | POST | - | `EventCollaboratorRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Update collaborator | `/api/v1/events/{eventId}/collaborators/{collaboratorId}` | PUT | - | `EventCollaboratorRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Remove collaborator | `/api/v1/events/{eventId}/collaborators/{collaboratorId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Create invite | `/api/v1/events/{eventId}/collaborator-invites` | POST | - | `CreateCollaboratorInviteRequest` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List event invites | `/api/v1/events/{eventId}/collaborator-invites` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Revoke invite | `/api/v1/events/{eventId}/collaborator-invites/{inviteId}` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| List my invites | `/api/v1/collaborator-invites/incoming` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Accept invite | `/api/v1/collaborator-invites/{inviteId}/accept` | POST | - | `RespondToCollaboratorInviteRequest?` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Accept invite by token | `/api/v1/collaborator-invites/accept` | POST | `token: string` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Decline invite | `/api/v1/collaborator-invites/{inviteId}/decline` | POST | - | `RespondToCollaboratorInviteRequest?` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

## Social/User Follow Service (`core/social/services/userFollow.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Follow user | `/api/v1/users/{userId}/follow` | POST | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Unfollow user | `/api/v1/users/{userId}/follow` | DELETE | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get follow status | `/api/v1/users/{userId}/follow-status` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get following | `/api/v1/users/{userId}/following` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get followers | `/api/v1/users/{userId}/followers` | GET | `page?: number, size?: number` | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Get follow stats | `/api/v1/users/{userId}/follow-stats` | GET | - | - | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

## Payment Service (`core/payment/services/payment.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Complete ticket checkout payment | `/api/v1/events/{eventId}/tickets/checkout/{checkoutId}/fake-payment` | POST | - | `PaymentRequestPayload?` (`paymentMethod: 'card'`, `last4`, `expiryMonth`, `expiryYear`) | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

Used when in-app card payment is enabled for ticket checkout. For real payments, use the start-payment flow; this fake-payment endpoint is for development or test card flows.

## Push Notification Service (`core/push/services/pushNotificationService.ts`)

| Description | Endpoint | Method | Query Params | Body | Integrated with UI | Needs UI / Suggested placement |
|------------|----------|--------|--------------|------|-------------------|-------------------------------|
| Register device token | `/api/v1/push-notifications/devices/register` | POST | - | `RegisterDeviceTokenRequest: { userId: string, deviceToken: string, platform: PushPlatform, deviceId?: string, appVersion?: string }` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |
| Refresh device token | `/api/v1/push-notifications/refresh-device-token` | POST | - | `RefreshDeviceTokenRequest: { userId: string, deviceToken: string, oldDeviceToken?: string, platform: PushPlatform, deviceId?: string, appVersion?: string }` | Yes | <span style="color:#16A34A;font-weight:600;">No</span> |

## Notes

- **Query Params**: Parameters marked with `?` are optional
- **Body**: Types are TypeScript interfaces/types defined in the respective type files
- **Integrated with UI**: "Yes" indicates the endpoint is used in at least one UI component/screen; "No" means it's available in the service but not currently used in the UI
- **Needs UI / Suggested placement**: "No" means no UI is required or it's already wired; "Yes — ..." suggests the most obvious place to add UI
- All endpoints require authentication unless otherwise specified
- Base URL is configured via `appConfig.apiBaseUrl` (defaults to `http://localhost:8080` for development)
- **Payment**: Ticket checkout can use `start-payment` (external payment) or `fake-payment` (in-app test flow) via `core/payment/services/payment.ts`
