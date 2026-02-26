# Events Service Tests

Comprehensive test suite for `core/events` services. These tests use the actual core services and make real API calls to verify they work correctly.

## Overview

This test suite validates all endpoints in `core/events/services/event.ts`:

- ✅ `listEvents()` - List events with filters and pagination
- ✅ `listMyEvents()` - List user's events
- ✅ `getEvent()` - Get event by ID with optional views
- ✅ `getEventCapacity()` - Get event capacity information
- ✅ `getEventVisibility()` - Get event visibility information
- ✅ `getEventFeed()` - Get event social feed
- ✅ `createEvent()` - Create new event
- ✅ `updateEvent()` - Update existing event
- ✅ `updateRegistrationState()` - Open/close registration
- ✅ `archiveEvent()` - Archive event
- ✅ `restoreEvent()` - Restore archived event
- ✅ `getEventMedia()` - Get event media
- ✅ `uploadMedia()` - Get presigned URL for media upload
- ✅ `getMedia()` - Get specific media
- ✅ `updateMedia()` - Update media information
- ✅ `deleteMedia()` - Delete media

## Setup

### Environment Variables

Uses the same environment variables as auth tests:

```bash
# API Configuration
API_BASE_URL=http://localhost:8080
API_ACCESS_TOKEN=your-access-token  # Optional if using LOGIN_EMAIL/PASSWORD
API_DEVICE_ID=test-device-123        # Optional, auto-generated if not set
API_SERVICE_API_KEY=your-service-key # Optional

# Login Credentials (for tests that need authentication)
LOGIN_EMAIL=test@example.com
LOGIN_PASSWORD=TestPassword123!

# Optional: Use specific event for tests
TEST_EVENT_ID=your-event-id  # If not set, tests will use first event from listMyEvents
```

## Running Tests

### Run All Tests

```bash
npm run test:events
```

Or directly:

```bash
node --loader ts-node/esm test/events/run.ts
```

### Run Individual Tests

```bash
# Test list events
node --loader ts-node/esm test/events/listEvents.test.ts

# Test get event
node --loader ts-node/esm test/events/getEvent.test.ts

# Test create/update event
node --loader ts-node/esm test/events/createUpdateEvent.test.ts

# Test event management
node --loader ts-node/esm test/events/eventManagement.test.ts

# Test event media
node --loader ts-node/esm test/events/eventMedia.test.ts
```

## Test Structure

Each test file follows this pattern:

1. **Setup**: Inject test HTTP client
2. **Create DTO**: Create request objects using types from `core/events/types/event.ts`
3. **Call Service**: Use the actual core service methods
4. **Assert Results**: Verify the response matches expected structure
5. **Report**: Generate test report with results

### Example

```typescript
// 1. Setup
const http = createHttpClient(config.baseUrl, accessToken, deviceId, serviceApiKey);
const cleanup = setupTestEnvironment(http);

// 2. Create DTO
const createRequest: CreateEventRequest = {
  name: 'Test Event',
  eventType: EventType.CONFERENCE,
  // ... other fields
};

// 3. Call Service
const result = await eventService.createEvent(createRequest);

// 4. Verify
console.log('Created event:', result);
```

## Code Reuse

This test suite reuses utilities from `test/auth/lib`:
- `setup.ts` - Test environment setup
- `http.ts` - HTTP client creation
- `reporter.ts` - Test reporting

This ensures consistency across test suites and reduces code duplication.

## Test Reports

Test reports are generated in `test/events/reports/` directory as Markdown files:

```
test/events/reports/event_test_report_2024-01-01T12-00-00-000Z.md
```

## Notes

- **Event ID**: Most tests require an event ID. If `TEST_EVENT_ID` is not set, tests will try to use the first event from `listMyEvents()`. If no events exist, some tests will be skipped.
- **Media Upload**: The media upload tests get presigned URLs but don't actually upload to S3. You can extend them to do real uploads if needed.
- **Idempotency**: The `createEvent` test uses an idempotency key to prevent duplicate event creation on retries.

## Troubleshooting

### "No events found"
- Create an event first using `createUpdateEvent.test.ts`
- Or set `TEST_EVENT_ID` environment variable to use an existing event

### "No access token or login credentials"
- Set `API_ACCESS_TOKEN` or `LOGIN_EMAIL`/`LOGIN_PASSWORD` environment variables

### "Login failed"
- Verify your login credentials are correct
- Check that the backend API is running and accessible
