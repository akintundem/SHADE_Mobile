/**
 * Structured authentication error codes.
 *
 * Auth0 API layer maps provider-specific errors to these canonical codes so
 * that upstream consumers (hooks, context) never need to string-match on
 * error messages.
 */
export const AuthErrorCode = {
  // Credential / identity errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',

  // Token lifecycle
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  REFRESH_FAILED: 'REFRESH_FAILED',
  NO_SESSION: 'NO_SESSION',

  // Transient / operational
  NETWORK_ERROR: 'NETWORK_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  TIMEOUT: 'TIMEOUT',

  // Backend-specific
  BACKEND_USER_MISSING: 'BACKEND_USER_MISSING',
  ONBOARDING_EMAIL_MISMATCH: 'ONBOARDING_EMAIL_MISMATCH',
  USERNAME_TAKEN: 'USERNAME_TAKEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Catch-all
  UNKNOWN: 'UNKNOWN',
} as const;

export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];

/**
 * A typed error that carries a machine-readable `code` alongside the
 * human-readable `message`. All auth-layer functions throw this instead of
 * plain `Error` objects.
 */
export class AuthError extends Error {
  readonly code: AuthErrorCode;
  readonly statusCode: number | undefined;

  constructor(code: AuthErrorCode, message: string, statusCode?: number) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
  }

  /** Type-guard to check whether an unknown value is an AuthError. */
  static is(value: unknown): value is AuthError {
    return value instanceof AuthError;
  }

  /** Extract the code from an unknown error (falls back to UNKNOWN). */
  static codeOf(error: unknown): AuthErrorCode {
    return AuthError.is(error) ? error.code : AuthErrorCode.UNKNOWN;
  }
}
