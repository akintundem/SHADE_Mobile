const sanitizeBaseUrl = (value?: string) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const API_BASE_URL = sanitizeBaseUrl(process.env.API_BASE_URL);
const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY?.trim?.() || '';

const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN?.trim?.() || '';
const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID?.trim?.() || '';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE?.trim?.() || '';
const AUTH0_CONNECTION = process.env.AUTH0_CONNECTION?.trim?.() || 'Username-Password-Authentication';
const USE_IN_APP_PAYMENT =
  process.env.USE_IN_APP_PAYMENT?.trim?.() === 'true' ||
  process.env.USE_DEMO_PAYMENT?.trim?.() === 'true' ||
  process.env.USE_FAKE_PAYMENT?.trim?.() === 'true';
const ASSET_BASE_URL = sanitizeBaseUrl(process.env.ASSET_BASE_URL);

/** MinIO origins the backend may return (Docker: host.docker.internal or minio; host: localhost; http or https) */
const MINIO_ORIGINS = [
  'http://minio:9000',
  'http://host.docker.internal:9000',
  'http://localhost:9000',
  'https://minio:9000',
  'https://host.docker.internal:9000',
  'https://localhost:9000',
];
const MINIO_ORIGIN_LOCALHOST_HTTP = 'http://localhost:9000';
const MINIO_ORIGIN_LOCALHOST_HTTPS = 'https://localhost:9000';

/**
 * Resolves a MinIO/S3 URL for use in the app. Use for both display and presigned upload URLs.
 * Rewrites MinIO origins so the app can reach storage:
 * - minio:9000 or host.docker.internal:9000 (http/https) → localhost:9000 for simulator.
 * - When ASSET_BASE_URL is set, rewrite localhost:9000 to that base for devices/emulators.
 */
export function getImageUrl(url: string | null | undefined): string | undefined {
  if (url == null || url === '') return undefined;
  try {
    for (const origin of MINIO_ORIGINS) {
      if (url.startsWith(origin)) {
        const isHttps = origin.startsWith('https');
        const localhostOrigin = isHttps ? MINIO_ORIGIN_LOCALHOST_HTTPS : MINIO_ORIGIN_LOCALHOST_HTTP;
        url = localhostOrigin + url.slice(origin.length);
        break;
      }
    }
    const localhostOrigins = [MINIO_ORIGIN_LOCALHOST_HTTP, MINIO_ORIGIN_LOCALHOST_HTTPS];
    if (ASSET_BASE_URL) {
      for (const localhostOrigin of localhostOrigins) {
        if (url.startsWith(localhostOrigin)) {
          const base = ASSET_BASE_URL.replace(/\/$/, '');
          return base + url.slice(localhostOrigin.length);
        }
      }
    }
  } catch {
    // ignore
  }
  return url;
}

export const appConfig = {
  apiBaseUrl: API_BASE_URL ?? '',
  geoapifyApiKey: GEOAPIFY_API_KEY,
  /** When true, ticket checkout uses in-app payment instead of redirecting to an external payment URL. */
  useInAppPayment: USE_IN_APP_PAYMENT,
  /** Optional base URL for object storage (MinIO). When set, image URLs with origin http://localhost:9000 are rewritten so devices/emulators can load from host (e.g. http://10.0.2.2:9000 for Android). */
  assetBaseUrl: ASSET_BASE_URL ?? undefined,
  auth0: {
    domain: AUTH0_DOMAIN,
    clientId: AUTH0_CLIENT_ID,
    audience: AUTH0_AUDIENCE || undefined,
    connection: AUTH0_CONNECTION,
  },
};

if (__DEV__ && !appConfig.apiBaseUrl) {
  console.warn('[config] apiBaseUrl is not set; set API_BASE_URL for development builds.');
}
