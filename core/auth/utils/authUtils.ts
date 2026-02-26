import { User, SecureUserResponse } from '../types/auth';

/**
 * Single source of truth for email normalization.
 * Trim whitespace and lowercase — applied once at the service boundary.
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Canonical mapping from any auth-layer user representation to the
 * lightweight `User` type consumed by the UI.
 *
 * Accepts either a full `SecureUserResponse` (from backend) or a
 * `User` (from JWT decode). Always returns a consistent `User` shape.
 */
export function mapToUser(
  source: SecureUserResponse | User,
  provider: User['provider'] = 'password',
): User {
  return {
    id: source.id,
    email: source.email ?? '',
    name: source.name,
    provider,
  };
}

/**
 * Determine whether an error indicates the backend user record doesn't
 * exist yet (pre-onboarding state), or the backend is unreachable / errored.
 * Shared by authService and AuthContext so the detection logic is defined
 * in exactly one place.
 * Treats 401/403/404 (unauthorized / no user) and 5xx (server error) as
 * "user missing" so sign-in can continue with JWT identity and onboarding.
 */
export function isBackendUserMissing(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }
  const e = error as { status?: number; response?: { status?: number } };
  const status = e.response?.status ?? e.status;
  if (status == null) return false;
  return status === 401 || status === 403 || status === 404 || status >= 500;
}
