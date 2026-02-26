# Core Services Test Suite

E2E tests for all core services. Tests use the actual core service code and hit the **sade-mono** backend API.

## Backend (BE)

Tests target the **sade-mono** API. Backend source:

- **Path:** `sade-mono/src/main` (e.g. `/Users/mayokun/Desktop/SHDE/sade-mono/src/main`)
- **API base:** Set `API_BASE_URL` in `.env` (e.g. `http://localhost:8080` when the backend is running)
- **API prefix:** `/api/v1` (auth, events, attendees, budget, collaboration, feeds, tickets, timeline, etc.)

Ensure the backend is running and Auth0 env (AUTH0_DOMAIN, AUTH0_CLIENT_ID) and test credentials are configured before running tests.

## Endpoint coverage

**Included in `npm run test:all` / `test/run.ts`:** auth, events, attendee, budget, collaboration, feeds, tickets, timeline, **waitlist**, **social**. These suites exercise the backend API used by the app.

**Coverage summary:**

| Area | Backend (sade-mono) | Core client | E2E tests |
|------|---------------------|------------|-----------|
| **Auth / users** | `/api/v1/auth`, `/api/v1/auth/users`, profile-image | ✅ | ✅ auth/test.ts |
| **User preferences** | `/api/v1/users/me/preferences` | ❌ no dedicated client | ❌ |
| **Events** | `/api/v1/events` (CRUD, clone, registration, archive, restore, feed, for-you, following, media, assets, cover, notifications, reminders) | ✅ | ✅ events/test.ts |
| **Attendees** | `/api/v1/attendees` (CRUD, invites, invitations, tickets, RSVP) | ✅ | ✅ attendee/test.ts |
| **Budget** | `/api/v1/events/{id}/budget` | ✅ | ✅ budget/test.ts |
| **Collaboration** | `/api/v1/events/{id}/collaborators`, collaborator-invites, **accept/decline** | ✅ | ✅ collaboration/test.ts |
| **Feeds** | `/api/v1/events/{id}/posts`, like, comments, repost, quote | ✅ | ✅ feeds/test.ts |
| **Tickets** | `/api/v1/tickets`, ticket-types, templates, **checkout**, **validate**, **wallet-pass**, **refund**, **approval requests**, **ticket waitlist** | ✅ | ✅ tickets/test.ts |
| **Timeline** | `/api/v1/events/{id}/tasks`, `/api/v1/tasks/{id}/checklist` | ✅ | ✅ timeline/test.ts |
| **Event waitlist** | `/api/v1/events/{eventId}/waitlist` | ✅ | ✅ waitlist/test.ts (in test:all) |
| **Social (follow)** | `/api/v1/users/{id}/follow`, follow-status, following, followers | ✅ | ✅ social/test.ts (in test:all) |
| **Currencies** | `/api/v1/currencies` | ❌ no core client | ❌ |
| **Venues** | `/api/v1/venues` | ❌ no core client | ❌ |
| **Push** | `/api/v1/push-notifications/devices/register`, refresh-device-token | ✅ | ❌ no E2E (device/FCM specific) |

Remaining gaps: **user preferences** (no client), **currencies** / **venues** (no client), **push** (no E2E; device/FCM-specific).

## Structure

```
test/
├── lib/                    # Shared test utilities (used by all test suites)
│   ├── setup.ts            # Test environment setup (HTTP injection)
│   ├── auth0TestConfig.ts  # Auth0 env check for auth-dependent tests
│   ├── http.ts             # HTTP client creation
│   ├── reporter.ts         # Test reporting and result collection
│   ├── testHelpers.ts      # authenticateAndOnboard, getOrCreateTestEvent, buildEventPayload
│   ├── delay.ts            # Rate-limit delays and retries
│   ├── types.ts            # getErrorMessage, getErrorStatus, getErrorResponseData
│   └── errorHelpers.ts     # createErrorResult
├── auth/                   # Auth service E2E tests
│   ├── test.ts
│   └── run.ts
├── events/                 # Events service E2E tests
│   ├── test.ts
│   └── run.ts
├── attendee/               # Attendee service E2E tests
│   └── test.ts
├── budget/                 # Budget service E2E tests
│   └── test.ts
├── collaboration/          # Collaboration service E2E tests
│   └── test.ts
├── feeds/                  # Feeds service E2E tests
│   └── test.ts
├── tickets/                # Tickets service E2E tests
│   └── test.ts
├── timeline/               # Timeline service E2E tests
│   └── test.ts
├── waitlist/               # Event waitlist E2E tests
│   └── test.ts
├── social/                 # User follow E2E tests
│   └── test.ts
├── seed/                   # Seed/data helpers (optional)
│   ├── seedData.ts
│   ├── seed.test.ts
│   └── clean-auth0.test.ts # Auth0 cleanup for full reset
├── reports/                # Generated reports (gitignored)
└── run.ts                  # Root test runner (runs all suites via vitest)
```

## Shared Utilities

All test suites use the shared utilities in `test/lib/`:

- **`setup.ts`** - Injects test HTTP client; **`auth0TestConfig.ts`** - Ensures AUTH0_DOMAIN and AUTH0_CLIENT_ID for auth tests
- **`http.ts`** - Creates HTTP client with auth headers
- **`reporter.ts`** - Collects test results and generates reports

This ensures consistency and reduces code duplication across test suites.

## Running Tests

### Run All Test Suites

```bash
npm run test:all
```

Or via the root runner (same coverage):

```bash
npx tsx test/run.ts
```

Runs auth, events, attendee, budget, collaboration, feeds, tickets, and timeline E2E tests sequentially.

### Run Individual Test Suites

```bash
npm run test:auth
npm run test:events
npm run test:attendee
npm run test:budget
npm run test:collaboration
npm run test:feeds
npm run test:tickets
npm run test:timeline
npm run test:waitlist
npm run test:social
```

### Seeding and Full Environment Reset

To seed the database for design work, use `npm run seed:data`. This runs a **full environment reset** before seeding:

1. **Auth0 cleanup** — Removes the 3 seed users from Auth0 (IDP) via the backend API
2. **Compose** (optional) — Runs `make compose-down` and `make compose-up` in your backend dir to recreate DB tables
3. **DB wipe** — Truncates all tables (including `auth_users`)
4. **Seed** — Creates seed users in Auth0 and populates the DB via API

**Setup:** Set `SEED_BACKEND_DIR` in `.env` to your sade-mono backend path (e.g. `/Users/mayokun/Desktop/SHDE/sade-mono`). The script will run the BE's `scripts/Reset_Clean_Up_DB.sh` (drop schema, recreate PostGIS) then `make compose-down` and `make compose-up`. Ensure `DB_*` vars are set in the **backend's** `.env` for the reset script.

**Other commands:**
- `npm run seed:data:only` — Run just the seed suite (no reset)
- `npm run seed:reset` — Partial DB reset (keeps auth_users)
- `npm run seed:reset:full` — Full DB truncate (including auth_users)
- `npm run seed` — Partial reset + seed (legacy flow)

## Environment Variables

All test suites use the same environment variables:

```bash
# API Configuration
API_BASE_URL=http://localhost:8080
API_ACCESS_TOKEN=your-access-token  # Optional if using LOGIN_EMAIL/PASSWORD
API_DEVICE_ID=test-device-123        # Optional, auto-generated if not set
API_SERVICE_API_KEY=your-service-key # Optional

# Login Credentials (for tests that need authentication)
TEST_USER_EMAIL=test@example.com   # or LOGIN_EMAIL
TEST_USER_PASSWORD=TestPassword123!   # or LOGIN_PASSWORD

# Auth0 (for auth-dependent tests)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id

# Optional: Use specific event for events tests
TEST_EVENT_ID=your-event-id  # If not set, tests will use first event from listMyEvents
```

## Test Reports

Reports are written to `test/reports/`:

- `auth_test_report_<timestamp>.md`
- `events_test_report_<timestamp>.md`
- `attendee_test_report_<timestamp>.md`
- `budget_test_report_<timestamp>.md`
- `collaboration_test_report_<timestamp>.md`
- `feeds_test_report_<timestamp>.md`
- `tickets_test_report_<timestamp>.md`
- `timeline_test_report_<timestamp>.md`
- `waitlist_test_report_<timestamp>.md` (if reporter used)
- `social_test_report_<timestamp>.md` (if reporter used)

Each report includes:
- Individual test results (pass/fail/skip)
- Status codes and messages
- Overall summary with totals

## How Tests Work

1. **Setup**: Ensure Auth0 env and inject test HTTP client into core services
2. **Create DTO**: Create request objects using types from core service types
3. **Call Service**: Use the actual core service methods (no mocks!)
4. **Verify Result**: Check the response matches expected structure
5. **Report**: Generate test report with results

### Example

```typescript
// 1. Setup
const http = createHttpClient(config.baseUrl, accessToken, deviceId, serviceApiKey);
const cleanup = setupTestEnvironment(http);

// 2. Create DTO
const request: CreateEventRequest = {
  name: 'Test Event',
  eventType: EventType.CONFERENCE,
  // ... other fields
};

// 3. Call Service
const result = await eventService.createEvent(request);

// 4. Verify
console.log('Created event:', result);
```

## Adding New Test Suites

To add a new test suite (e.g. for a new backend feature):

1. Create the test directory and `test.ts`: e.g. `test/<feature>/test.ts`
2. Use the shared utilities and pattern from existing suites (e.g. `test/attendee/test.ts`):
   - Mocks for `react-native` and `@react-native-async-storage/async-storage`
   - `dotenv` + `ensureAuth0ForTests()` from `auth0TestConfig`, then import core services and `TestReporter`, `testHelpers`, `delay`, `types`, `errorHelpers`
   - `describe`/`it` with `reporter.startSuite` and `reporter.addResult`
3. Add npm script in `package.json`: `"test:<feature>": "vitest run test/<feature>/test.ts"`
4. Add the test file to the list in `test/run.ts` and to `npm run test:all` in `package.json`

## Benefits

- ✅ **No Mocks**: Tests use real core services and real API calls
- ✅ **Code Reuse**: Shared utilities eliminate duplication
- ✅ **Consistency**: All test suites follow the same pattern
- ✅ **Real Integration**: If tests pass, the UI will work correctly
- ✅ **Easy to Extend**: Simple to add new test suites
