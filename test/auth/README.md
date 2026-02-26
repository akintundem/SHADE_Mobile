# Auth Service Tests

Comprehensive test suite for `core/auth` services. These tests use the actual core services and make real API calls to verify they work correctly.

## Overview

This test suite validates all endpoints in `core/auth/services/authService.ts`:

- ✅ `getAuthSession()` - Get current user session
- ✅ `signIn()` - Sign in via Auth0
- ✅ `signUp()` - Sign up via Auth0
- ✅ `updateUserProfile()` - Update user profile
- ✅ `deleteUser()` - Delete user account
- ✅ `searchDirectory()` - Search user directory
- ✅ `listDirectory()` - List all public users
- ✅ `searchLocations()` - Search locations
- ✅ `getProfileImageUploadUrl()` - Get presigned URL for profile image
- ✅ `completeProfileImageUpload()` - Complete profile image upload

## Setup

### Environment Variables

Create a `.env` file or set these environment variables:

```bash
# API Configuration
API_BASE_URL=http://localhost:8080
API_ACCESS_TOKEN=your-access-token  # Optional if using LOGIN_EMAIL/PASSWORD
API_DEVICE_ID=test-device-123        # Optional, auto-generated if not set
API_SERVICE_API_KEY=your-service-key # Optional

# Login Credentials (for tests that need authentication)
LOGIN_EMAIL=test@example.com
LOGIN_PASSWORD=TestPassword123!

# Auth0 (for auth tests)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
```

### Install Dependencies

All dependencies should already be installed. The tests use:
- Auth0 (via core authService; set AUTH0_DOMAIN and AUTH0_CLIENT_ID)
- `axios` - For HTTP requests (via core services)
- `tsx` - For running TypeScript files

## Running Tests

### Run All Tests

```bash
npm run test:auth
```

Or directly:

```bash
npx tsx test/auth/run.ts
```

### Run Individual Tests

```bash
# Test getAuthSession
npx tsx test/auth/getAuthSession.test.ts

# Test sign in/sign up
npx tsx test/auth/signInSignUp.test.ts

# Test user profile
npx tsx test/auth/userProfile.test.ts

# Test directory
npx tsx test/auth/directory.test.ts

# Test locations
npx tsx test/auth/locations.test.ts

# Test profile image
npx tsx test/auth/profileImage.test.ts
```

## Test Structure

Each test file follows this pattern:

1. **Setup**: Ensure Auth0 env and inject test HTTP client
2. **Create DTO**: Create request objects using types from `core/auth/types/auth.ts`
3. **Call Service**: Use the actual core service methods
4. **Assert Results**: Verify the response matches expected structure
5. **Report**: Generate test report with results

### Example

```typescript
// 1. Setup
const config = loadTestConfig();
const http = createHttpClient(config.baseUrl, accessToken, deviceId, serviceApiKey);
const cleanup = setupTestEnvironment(http);

// 2. Create DTO
const updateRequest: UpdateUserProfileRequest = {
  name: 'Test User',
  username: 'testuser',
};

// 3. Call Service
const result = await authService.updateUserProfile(userId, updateRequest);

// 4. Verify
console.log('Updated user:', result);
```

## How It Works

1. **No Mocks**: Tests use real Auth0 and real HTTP calls
2. **Core Services**: Tests call the exact same services the UI uses
3. **HTTP Injection**: Test HTTP client is injected into core services
4. **Auth0 configuration**: Auth0 env (AUTH0_DOMAIN, AUTH0_CLIENT_ID) is required for auth tests
5. **Real Backend**: All tests hit your actual backend API

## Test Reports

Test reports are generated in `test/auth/reports/` directory as Markdown files:

```
test/auth/reports/auth_test_report_2024-01-01T12-00-00-000Z.md
```

Each report includes:
- Test suite name
- Individual test results (pass/fail/skip)
- Status codes and messages
- Overall summary

## Notes

- **Sign Up/Sign In**: Requires Auth0 to be configured. Email verification may be required depending on your Auth0 settings.
- **Delete User**: The `deleteUser` test is commented out by default to prevent accidental account deletion. Uncomment if you want to test it with a disposable account.
- **Profile Image**: The profile image upload test gets a presigned URL but doesn't actually upload to S3. You can extend it to do a real upload if needed.

## Troubleshooting

### "Auth0 not configured"
- Set `AUTH0_DOMAIN` and `AUTH0_CLIENT_ID` in .env

### "No access token or login credentials"
- Set `API_ACCESS_TOKEN` or `LOGIN_EMAIL`/`LOGIN_PASSWORD` environment variables

### "Login failed"
- Verify your login credentials are correct
- Check that the backend API is running and accessible
- Ensure the user account exists and is verified (if email verification is required)

### Auth0 errors
- Verify AUTH0_DOMAIN and AUTH0_CLIENT_ID are correct
- Ensure network connectivity to Auth0
