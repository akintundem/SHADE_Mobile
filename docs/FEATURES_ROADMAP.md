# Capsule Features Roadmap

Suggested features with short descriptions. Each item is tagged **With AI** or **Without AI** (or **Optional AI** where both modes apply).

---

## 1. Event Creation & Setup

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Event title & description generator** | One-tap generation of 3–5 title options and a short description from topic/date/venue. | **With AI** |
| **Venue / location suggestions** | “Suggest venues” from natural language (e.g. “Conference for 200 in Lagos in March”) using places API + ranking. | **With AI** |
| **Schedule / agenda draft** | Auto-draft time blocks and labels from event type (e.g. “Tech meetup, 3 talks, 1 workshop”). | **With AI** |
| **Invite / reminder email copy generator** | Generate on-brand invite or reminder email body (and subject) per event with one click. | **With AI** |
| **Currencies API integration** | Use backend `/api/v1/currencies` in create-event and budget (currency selector). | **Without AI** |
| **Venues API integration** | Use backend `/api/v1/venues` in create-event for venue picker/autocomplete. | **Without AI** |

---

## 2. Event Admin – Media & Reminders

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Media detail view** | View single media item (GET `/events/{eventId}/media/{mediaId}`) in Event Admin → Media. | **Without AI** |
| **Media edit** | Edit media metadata (title, category, etc.) via PUT on same media endpoint. | **Without AI** |
| **Edit reminder** | Edit existing reminder (time, message) via PUT `/events/{eventId}/reminders/{reminderId}`. | **Without AI** |
| **Notification / reminder copy generator** | “Write last-minute reminder” or “Write thank-you after event” with one click. | **With AI** |

---

## 3. Event Admin – Organizer Intelligence (Co-Pilot)

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Event readiness score** | Percentage + checklist: “Add cover image, 2 reminders, confirm venue” with next actions. | **With AI** (summaries) / **Without AI** (rules) |
| **Budget insights** | Compare to norms (“Catering 40% vs 30% typical”) or suggest line items for event type/size. | **With AI** |
| **Task suggestions from description** | Suggest timeline tasks from event description and type (e.g. “Send headcount to venue”). | **With AI** |
| **Guest list insights** | Short summaries: “3 VIPs not responded”, “Most attendees from Lagos”, “10 on waitlist”. | **With AI** |
| **Budget line-item finalize UI** | Wire existing “finalize line item” endpoint in Event Admin → Budget. | **Without AI** |

---

## 4. Guests, Invites & Attendees

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Request invite (invite-only)** | Dedicated “Request invite” flow; backend creates pending invite request for organizer to approve/deny. | **Without AI** (BE + FE) |
| **Request-invite reasoning (organizer)** | AI summary of “why this person wants to attend” for each invite request. | **With AI** |
| **Invites management – approve/deny requests** | List and approve/deny invite requests in Event Admin → Invites. | **Without AI** |

---

## 5. Tickets & Check-In

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Ticket validate (check-in)** | Scan or enter ticket code; validate via API; mark attendee checked in. | **Without AI** |
| **Ticket detail actions** | Cancel, refund, update, transfer, resend from ticket detail screen. | **Without AI** |
| **Wallet pass** | “Add to Apple/Google Wallet” using GET wallet-pass endpoint. | **Without AI** |
| **Checkout status screen** | Poll checkout by id; show Processing / Success / Failed and next steps. | **Without AI** |
| **Cancel checkout** | Cancel pending checkout from status screen. | **Without AI** |
| **Approval request from event** | “Request ticket” flow from event detail using create approval-request API. | **Without AI** |
| **My approval requests** | Profile / “My tickets”: list and cancel my approval requests. | **Without AI** |
| **Join / cancel ticket waitlist** | Join from “Ticket required” modal; “My ticket waitlists” in Profile with cancel. | **Without AI** |
| **Ticket type suggestions** | Suggest ticket tiers (names, descriptions, price hints) for event type/capacity. | **With AI** |
| **Check-in anomaly hints** | Flag unusual patterns (e.g. same device, duplicate use) for organizer. | **With AI** (optional) |
| **Refund request summary** | AI summary of attendee’s free-text refund reason for organizer. | **With AI** (optional) |

---

## 6. User Preferences & Settings

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **User preferences (backend)** | Client + UI for `/api/v1/users/me/preferences` (e.g. language, theme) with sync to backend. | **Without AI** |
| **Export my data** | Honor “export event data” in settings: export my events/tickets/RSVPs (e.g. JSON/CSV) via backend. | **Without AI** |

---

## 7. Discovery & Search

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Natural-language search** | “Tech events in Lagos next month under 5k” → map to filters and list events. | **With AI** |
| **Semantic event search** | Match by meaning (e.g. “something like a hackathon”) via embeddings + vector search. | **With AI** |
| **“Events like this”** | On event detail: “More like this” using embedding similarity. | **With AI** |
| **Discovery filters** | Filters for category, date range, location/distance, price (if backend supports). | **Without AI** |

---

## 8. Feeds & Social

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Smart reply to comments** | “Reply with AI”: one-tap draft reply; user edits and sends. | **With AI** |
| **Post ideas / captions** | “Suggest a post” for event (e.g. “Last few tickets”, “Meet the speakers”). | **With AI** |
| **Feed summary for organizers** | “This week: 12 new RSVPs, 5 posts, top comment…” in Event feed or Admin. | **With AI** |
| **Tone for replies** | “Reply in professional / friendly / excited tone” in Reply with AI. | **With AI** |
| **For You feed explanations** | “Why we think you’ll like this” under each event in For You (e.g. similar events, follows). | **With AI** |

---

## 9. Attendee Experience

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Event Q&A bot** | Attendees ask “Dress code?” “Parking?”; bot answers from event details + FAQ. | **With AI** |
| **Calendar export / Add to calendar** | Generate .ics or deep link to add event to device calendar. | **Without AI** |
| **Share event** | Share sheet with public link or deep link (optional OG image). | **Without AI** |

---

## 10. Profile & Onboarding

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Bio from activity** | “Generate bio” from my events and interests; user edits and saves. | **With AI** |
| **Onboarding “What events do you like?”** | Conversational or guided flow to set preferences and improve For You. | **With AI** (mapping) / **Without AI** (UI) |
| **Smart notification summary** | “You have 5 new RSVPs and 2 comments across 3 events” in notifications or push. | **With AI** |
| **Notifications inbox** | In-app list of notifications with mark-as-read and optional per-event prefs. | **Without AI** |

---

## 11. Product & Platform

| Feature | Short description | AI? |
|--------|---------------------|-----|
| **Recurring events / series** | “Repeat” (e.g. weekly/monthly) and event series; one creation → multiple dates. | **Without AI** |
| **Polls / surveys** | Per-event polls or short surveys (e.g. session choice, post-event feedback). | **Without AI** (BE + FE) |
| **In-app messaging** | Simple DMs or event-level chat (organizer ↔ attendee or attendee ↔ attendee). | **Without AI** (BE + FE) |
| **Analytics dashboard** | Charts: signups over time, check-in rate, revenue by ticket type, demographics. | **Without AI** |
| **Multi-event passes / bundles** | One pass for several events (e.g. festival); redemption per event. | **Without AI** (BE + FE) |
| **Offline / caching** | Cache event list and detail (and optionally tickets) for offline viewing. | **Without AI** |
| **Accessibility** | Screen reader labels, font scaling, contrast, focus order on key flows. | **Without AI** |
| **Localization** | Full i18n using preferred language (EN/FR) and locale bundles. | **Without AI** |

---

## Summary by AI

| Tag | Count (approx.) | Focus |
|-----|------------------|--------|
| **With AI** | ~25 | Co-pilot (creation, admin, search, feeds, Q&A, profile) |
| **Without AI** | ~28 | Wiring APIs, UX gaps, platform (tickets, check-in, settings, messaging, etc.) |
| **Optional AI** | ~3 | Readiness score, onboarding mapping, check-in/refund hints |

---

## Co-Pilot Emphasis (AI-First)

For a strong “Co-Pilot” feel, priority AI features:

1. **Event creation:** Title/description + agenda + invite/reminder copy.
2. **Event Admin:** Readiness score, task suggestions, budget insights, guest insights, ticket tier suggestions.
3. **Feeds & engagement:** Smart reply, post ideas, feed summary, For You explanations.
4. **Discovery:** Natural-language search, “Events like this.”
5. **Attendee:** Event Q&A bot.
6. **Profile:** Bio from activity, notification summary.

All other items in this doc remain as the full feature set (with or without AI) for roadmap and backlog.
