/**
 * Helpers for detecting opaque IDs (Auth0 subject, etc.) that should not be shown as display names.
 */

/** True if the value looks like an Auth0 id or other opaque id (e.g. auth0|xxx, google-oauth2|xxx). */
export function looksLikeId(value: string): boolean {
  if (!value || value.length < 10) return false;
  const v = value.trim();
  return /^auth0\|/i.test(v) || /^[\w-]+\|[a-z0-9]+$/i.test(v) || /^[a-f0-9-]{20,}$/i.test(v);
}
