/**
 * Auth0 REST API client.
 *
 * Every function throws an `AuthError` with a machine-readable `code` so that
 * upstream consumers never need to parse error messages.
 *
 * Email normalization is the caller's responsibility (via `normalizeEmail`).
 * This layer sends values as-is.
 */

import { auth0Config } from '../config/auth0Config';
import { AuthError, AuthErrorCode } from '../errors/AuthError';

const AUTH0_SCOPE = 'openid profile email offline_access';

function getBaseUrl(): string {
  const domain = auth0Config.domain;
  if (!domain) {
    throw new AuthError(
      AuthErrorCode.UNKNOWN,
      'Auth0 domain is not configured. Set AUTH0_DOMAIN.',
    );
  }
  return `https://${domain}`;
}

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export type Auth0TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
};

export type Auth0SignUpResponse = {
  _id: string;
  email?: string;
  email_verified?: boolean;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Map an Auth0 `/oauth/token` error response to a canonical `AuthErrorCode`.
 */
function classifyTokenError(
  data: Record<string, any>,
  status: number,
): AuthErrorCode {
  const code = data.error as string | undefined;
  const desc = String(data.error_description ?? '').toLowerCase();

  if (code === 'invalid_grant') {
    if (desc.includes('verify your email') || desc.includes('not verified')) {
      return AuthErrorCode.EMAIL_NOT_VERIFIED;
    }
    return AuthErrorCode.INVALID_CREDENTIALS;
  }
  if (code === 'too_many_attempts' || status === 429) {
    return AuthErrorCode.RATE_LIMITED;
  }
  return AuthErrorCode.UNKNOWN;
}

/**
 * Map an Auth0 `/dbconnections/signup` error response to a canonical code.
 */
function classifySignUpError(
  data: Record<string, any>,
  status: number,
): AuthErrorCode {
  const code = data.code as string | undefined;
  const desc = String(data.description ?? data.message ?? '').toLowerCase();

  if (
    code === 'invalid_signup' &&
    (desc.includes('already') || desc.includes('user_exists'))
  ) {
    return AuthErrorCode.USER_ALREADY_EXISTS;
  }
  if (status === 429 || code === 'too_many_attempts') {
    return AuthErrorCode.RATE_LIMITED;
  }
  if (code === 'invalid_password' || desc.includes('validation')) {
    return AuthErrorCode.VALIDATION_ERROR;
  }
  return AuthErrorCode.UNKNOWN;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Login with email and password (Resource Owner Password grant).
 */
export async function auth0PasswordLogin(
  email: string,
  password: string,
): Promise<Auth0TokenResponse> {
  const base = getBaseUrl();
  const body: Record<string, string> = {
    grant_type: 'password',
    username: email,
    password,
    client_id: auth0Config.clientId,
    scope: AUTH0_SCOPE,
  };
  if (auth0Config.audience) {
    body.audience = auth0Config.audience;
  }

  const res = await fetch(`${base}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = classifyTokenError(data, res.status);
    const message =
      typeof data.error_description === 'string'
        ? data.error_description
        : 'Login failed';
    throw new AuthError(code, message, res.status);
  }

  return data as Auth0TokenResponse;
}

/**
 * Sign up a new user (Database connection signup).
 */
export async function auth0SignUp(
  email: string,
  password: string,
): Promise<Auth0SignUpResponse> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/dbconnections/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: auth0Config.clientId,
      email,
      password,
      connection: auth0Config.connection,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const code = classifySignUpError(data, res.status);
    const message =
      typeof (data.description ?? data.message) === 'string'
        ? data.description ?? data.message
        : 'Sign up failed';
    throw new AuthError(code, message, res.status);
  }

  return data as Auth0SignUpResponse;
}

/**
 * Request password reset email.
 */
export async function auth0ChangePassword(email: string): Promise<void> {
  const base = getBaseUrl();
  const res = await fetch(`${base}/dbconnections/change_password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: auth0Config.clientId,
      email,
      connection: auth0Config.connection,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const desc = data.description ?? data.message;
    const message = typeof desc === 'string' ? desc : 'Password reset request failed';

    let code: AuthErrorCode = AuthErrorCode.UNKNOWN;
    if (res.status === 429) code = AuthErrorCode.RATE_LIMITED;

    throw new AuthError(code, message, res.status);
  }
}

/**
 * Refresh access token using refresh token.
 */
export async function auth0RefreshToken(
  refreshToken: string,
): Promise<Auth0TokenResponse> {
  const base = getBaseUrl();
  const body: Record<string, string> = {
    grant_type: 'refresh_token',
    client_id: auth0Config.clientId,
    refresh_token: refreshToken,
  };

  const res = await fetch(`${base}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data.error_description === 'string'
        ? data.error_description
        : 'Token refresh failed';
    throw new AuthError(AuthErrorCode.REFRESH_FAILED, message, res.status);
  }

  return data as Auth0TokenResponse;
}
