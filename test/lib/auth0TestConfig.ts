/**
 * Auth0 test configuration.
 * Use in beforeAll to ensure AUTH0_DOMAIN and AUTH0_CLIENT_ID are set for auth-dependent tests.
 */
export function ensureAuth0ForTests(): void {
  const domain = process.env.AUTH0_DOMAIN?.trim() || '';
  const clientId = process.env.AUTH0_CLIENT_ID?.trim() || '';

  if (!domain || !clientId) {
    throw new Error(
      'Missing Auth0 configuration. Set AUTH0_DOMAIN and AUTH0_CLIENT_ID in .env for auth tests.'
    );
  }
}
