# SHADE — Mobile App

**The host's dashboard, in your pocket.**

This is the React Native client for **SHADE**, an event-platform that wraps invites, RSVPs, ticketing, budgets, timelines, collaborators, media and live event-day operations into a single hosting workflow.

It is the companion app to the [SHADE backend](https://github.com/akintundem/SHADE) — together they were built as the foundation of an attempted startup, and are now being released publicly as an open codebase after the project was sunset.

---

## Why this repo exists

SHADE was a project I built end-to-end with the goal of becoming the operating system that hosts actually use to run real events — birthdays, weddings, dinners, conferences, club nights, anything where humans gather and someone is responsible for making it work.

I sunset the project after going through the **North Forge accelerator program** in Winnipeg. During the customer-discovery phase I ran interviews with hosts, planners and event organizers across multiple price points and event types. The pattern that came back, more clearly than I wanted to hear it, was this:

> *Most people would rather be stressed for free than pay anything to feel calm.*

That single insight made the unit economics of the consumer side untenable for a self-funded founder. Spreadsheets, group chats, and free RSVP tools were "good enough" for the vast majority of the market — even when people openly admitted that hosting was painful. The willingness-to-pay for *peace of mind* was structurally low. After sitting with that result, I lost the conviction needed to keep grinding on it as a venture, and stopped active development.

Rather than let the work disappear into a private archive, I'm publishing both the backend and this mobile app publicly. Someone may find the architecture useful, the patterns instructive, or the domain model a useful reference for their own event-tech project.

---

## What this app is

A React Native 0.81 app (iOS + Android), written in TypeScript, structured as a feature-modular client over the SHADE backend. NativeWind / Tailwind handles styling, React Navigation handles routing, and React Query handles all server state. Authentication is OIDC via Auth0, with refresh-token-aware HTTP clients in the core layer.

The app is structured around three top-level concerns:

- **`features/`** — UI features grouped by user-facing surface (auth, create-event, event-dashboard, event-detail, feeds, profile, social, settings, checkout)
- **`core/`** — domain logic and HTTP services that talk to the backend (auth, events, attendee, budget, collaboration, payment, push, social, tickets, timeline, feeds)
- **`main/`, `navigation/`, `common/`, `config/`** — app shell, navigators, shared UI primitives, and environment config

Tests live under `test/` and run on Vitest, with one suite per domain (auth, events, attendee, budget, collaboration, feeds, tickets, timeline, waitlist, social).

---

## Feature accounting — what's in the box

This is an honest snapshot of where each feature actually reached. "Working" means it was wired end-to-end against the backend and exercised in real builds. "Stubbed/partial" means scaffolding exists but it wasn't finished or wasn't exercised end-to-end.

### Authentication & accounts — *working*

Full OIDC auth flow against Auth0, sitting on top of the SHADE backend's identity layer.

- Sign up, sign in, sign out
- Forgot-password / email-sent confirmation
- Onboarding screen for first-time users
- Refresh-token aware HTTP client — silent re-auth, 401 retry, logout on hard failure
- Persistent sessions via AsyncStorage

Files: `features/auth/`, `core/auth/`

### Create event — *working*

Multi-step event creation flow with a context-driven wizard.

- Title, description, dates/times, capacity, location (with Google Places autocomplete)
- Cover image upload
- Visibility (public / private / invite-only)
- Ticketing toggle (paid / free / RSVP-only)
- Posts to the events service on the backend

Files: `features/create-event/`, `core/events/`

### Home, search, event detail — *working*

- Home feed with discovery-style listing of events the user can see
- Search screen with text query and surfacing of public events
- Event detail screen with full event metadata, host info, ticket purchase / RSVP entry-points
- Event feeds (posts/updates from the host) on the detail screen

Files: `main/screens/HomeScreen.tsx`, `main/screens/SearchScreen.tsx`, `features/event-detail/`, `features/feeds/`

### Event admin dashboard — *the deepest part of the app, mostly working*

The host's command center. This is the part of SHADE I believed in most — the screen a host opens the day of the event and uses to actually run things.

- **Dashboard overview** (`EventAdminDashboard.tsx`) — top-level health-of-event view
- **Guests management** — RSVP management, invites management, ticket approvals, attendee detail, ticket waitlist, event waitlist (`features/event-dashboard/guests/`)
- **Tickets management** — ticket-tier configuration and live ticket admin
- **Budget management** (`features/event-dashboard/budget/`) — per-event budget lines, totals, expense tracking, wired to `core/budget`
- **Timeline management** (`features/event-dashboard/timeline/`) — run-of-show / agenda blocks with timestamps for the day-of
- **Collaboration management** (`features/event-dashboard/collaboration/`) — co-host / planner invites with token-based accept flow (`AcceptInviteByTokenScreen.tsx`)
- **Reminders** — scheduled push reminders for guests
- **Media library** — photos and videos attached to the event
- **Insights** — capacity insights and visibility/access insights
- **Event settings** — per-event configuration

Files: `features/event-dashboard/`, `core/events/`, `core/budget/`, `core/timeline/`, `core/collaboration/`, `core/attendee/`, `core/tickets/`

### Social graph — *working*

- Public profiles
- Followers / following lists
- Edit-your-own-profile
- Follow/unfollow surface across the app

Files: `features/social/`, `features/profile/`, `core/social/`

### Push notifications — *working at the wiring level*

- Firebase Cloud Messaging via `@react-native-firebase/messaging`
- In-app notification UX via `@notifee/react-native`
- Token registration and topic subscription against the backend's push service
- Notification settings UI for the user to opt in/out by category
- Test-FCM tooling in the notification settings screen for debug builds

Files: `core/push/`, `features/settings/screens/detail/NotificationSettingsScreen.tsx`

### Settings — *working*

Full settings surface with sub-screens for:

- Notifications
- Privacy
- Security (password change, 2FA placeholders)
- Data (export, delete account)

Files: `features/settings/`

### Checkout / payments — *partial*

Card form and a card checkout modal exist as components, and `core/payment/` has the service shape, but end-to-end payment was not finished — the gateway integration was never fully reconciled with the backend's payment service. This is one of the largest gaps versus the original vision.

Files: `features/checkout/`, `core/payment/`

### Feeds — *working*

Per-event feed with posts from the host, used both on the public event-detail screen and inside the dashboard.

Files: `features/feeds/`, `core/feeds/`

---

## Tech stack

- **React Native** 0.81.4 with the new architecture, **React** 19
- **TypeScript** 5.8 in strict mode
- **NativeWind** + **Tailwind** for styling (no styled-components, no inline-only styles)
- **React Navigation** (native-stack) for routing
- **React Query** (TanStack Query v5) for all server state — caching, background refresh, optimistic updates
- **Axios** for the HTTP layer with interceptors for auth refresh
- **Firebase** (`@react-native-firebase/app`, `@react-native-firebase/messaging`) and **Notifee** for push
- **Vision Camera** + **Image Picker** for media capture
- **React Native Maps** + **Google Places Autocomplete** for venue selection
- **AsyncStorage** for persisted local state (sessions, preferences)
- **Vitest** for the cross-domain test suites; **Jest** + **React Native Testing Library** retained for component tests

---

## Architecture sketch

```
App.tsx
  └── navigation/         ← root stack, auth/main switch
       └── main/MainApp.tsx
             ├── features/        ← UI surfaces, one folder per user-facing area
             │     ├── auth/
             │     ├── create-event/
             │     ├── event-dashboard/   ← deepest feature; subdomains inside
             │     ├── event-detail/
             │     ├── feeds/
             │     ├── profile/
             │     ├── social/
             │     ├── settings/
             │     └── checkout/
             ├── core/            ← domain services + types, HTTP adapters
             │     ├── auth/, events/, attendee/, budget/,
             │     ├── collaboration/, feeds/, payment/,
             │     ├── push/, social/, tickets/, timeline/
             ├── common/          ← shared UI primitives, hooks, utils
             ├── config/          ← env, API base URL, feature flags
             └── main/            ← shell screens (Home, Search, Manage, Profile)
```

The split between `features/` and `core/` is deliberate: anything that talks HTTP or owns domain types lives in `core/`, while `features/` only deals with UI, navigation and React Query glue. That separation is what made the test suites under `test/` possible — they exercise the core services in isolation.

---

## Running it

> **Heads up:** the app expects the SHADE backend to be reachable. See the [SHADE backend repo](https://github.com/akintundem/SHADE) for instructions on bringing up the API + Auth0 + Postgres + Redis stack locally.

You'll also need to provide your own Firebase project for push (the original `google-services.json` and `GoogleService-Info.plist` were intentionally scrubbed from this repo before publishing) and your own Google Places / Geoapify keys if you want venue autocomplete to resolve.

### Prerequisites

- Node 20+
- React Native CLI environment set up per the [official guide](https://reactnative.dev/docs/set-up-your-environment) (Xcode + CocoaPods for iOS, Android Studio + JDK for Android)

### Install

```sh
npm install
# iOS only:
bundle install && bundle exec pod install --project-directory=ios
```

### Configure

Create a `.env` at the project root and set at minimum:

```sh
API_BASE_URL=http://localhost:8080
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_AUDIENCE=your-api-audience
# Optional, for places autocomplete:
GOOGLE_PLACES_API_KEY=your-key
GEOAPIFY_API_KEY=your-key
```

Drop your own Firebase config files in:

- `android/app/google-services.json`
- `ios/capsule/GoogleService-Info.plist`

### Run

```sh
npm start                # Metro
npm run ios              # iOS simulator
npm run ios:sim          # iPhone 16 Pro target
npm run android          # Android emulator
```

### Test

```sh
npm run test:core        # all vitest domain suites
npm run test:auth        # one suite at a time
npm run test:events
npm run test:budget
npm run test:tickets
npm run test:timeline
npm run test:collaboration
npm run test:feeds
npm run test:waitlist
npm run test:attendee
npm run test:social
npm run test:all         # everything, fresh report
npm run test:all:report  # everything + open report
```

---

## What I'd do differently

For anyone reading this as a reference — a few honest notes from hindsight:

- **Validate willingness-to-pay earlier.** I built far more product than I needed to before charging anyone. By the time I tried to put a price on it, the customer interviews already foreshadowed the answer. A landing page with Stripe Checkout would have told me what 18 months of code did.
- **Pick a wedge harder.** SHADE tries to do invites, RSVPs, ticketing, budget, timeline, collaborators, media, push and social — all reasonable host-needs, but the surface area is enormous for one founder. A narrower wedge (say, only run-of-show for weddings) would have been faster to test and more obviously valuable.
- **The dashboard was the right instinct.** The single insight from interviews that did light up was that hosts liked the *day-of* dashboard. If I were to take another swing at this space, I'd start there and only there.

---

## Repos

- **Backend (Spring Boot, Java + Kotlin):** https://github.com/akintundem/SHADE
- **Mobile (this repo, React Native + TypeScript):** https://github.com/akintundem/SHADE_Mobile

---

## License

No license. The code is published for reference and educational reading. If you want to reuse meaningful portions of it in your own project, please reach out.

---

*Built by [@akintundem](https://github.com/akintundem). Sunset 2026 after North Forge customer interviews. Released publicly so the work doesn't sit in a drawer.*
