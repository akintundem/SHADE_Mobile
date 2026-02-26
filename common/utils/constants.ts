// API Constants — base URL is driven by API_BASE_URL in .env
// httpClient.ts is the actual HTTP layer; these are fallback constants.
export const API_CONFIG = {
  TIMEOUT: 15000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME_PREFERENCE: 'pref:theme',
  OFFLINE_ACTIONS: 'offline_actions',
  CACHE_PREFIX: 'cache_',
  CACHE_EXPIRY_PREFIX: 'cache_expiry_',
} as const;

// Cache Configuration
export const CACHE_CONFIG = {
  DEFAULT_DURATION: 5 * 60 * 1000, // 5 minutes
  EVENTS_CACHE_DURATION: 10 * 60 * 1000, // 10 minutes
  USER_CACHE_DURATION: 30 * 60 * 1000, // 30 minutes
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
} as const;

// Validation Constants
export const VALIDATION_LIMITS = {
  EVENT_TITLE_MIN: 3,
  EVENT_TITLE_MAX: 100,
  EVENT_DESCRIPTION_MIN: 10,
  EVENT_DESCRIPTION_MAX: 1000,
  USERNAME_MIN: 3,
  USERNAME_MAX: 50,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  CAPACITY_MIN: 1,
  CAPACITY_MAX: 10000,
  PRICE_MIN: 0,
  PRICE_MAX: 10000,
} as const;

// UI Constants
export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  SWIPE_THRESHOLD: 50,
  SWIPE_VELOCITY: 0.3,
  PULL_TO_REFRESH_THRESHOLD: 60,
  SKELETON_ANIMATION_DURATION: 1000,
} as const;

// Date/Time Formats
export const DATE_FORMATS = {
  API_DATE: 'YYYY-MM-DD',
  API_DATETIME: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
  DISPLAY_DATE: 'MMM DD, YYYY',
  DISPLAY_TIME: 'HH:mm',
  DISPLAY_DATETIME: 'MMM DD, YYYY HH:mm',
} as const;

// Event Categories
export const EVENT_CATEGORIES = [
  'Music',
  'Sports',
  'Food',
  'Technology',
  'Art',
  'Education',
  'Business',
  'Health',
  'Fashion',
  'Culture',
  'Entertainment',
  'Other',
] as const;

// Event Status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  ATTENDEE: 'attendee',
} as const;

// Error Codes
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  SERVER_ERROR: 'SERVER_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// Platform Constants
export const PLATFORM = {
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_OFFLINE_MODE: true,
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
  ENABLE_DARK_MODE: true,
} as const;
