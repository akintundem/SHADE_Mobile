/**
 * Security related types
 */

// Base types
export type User = {
  id: string; // IdP user ID (sub claim)
  email: string;
  name?: string;
  username?: string;
  phoneNumber?: string | null;
  emailVerified?: boolean;
  provider?: 'password' | 'spotify';
};

// Auth0 / OIDC Access Token JWT payload (standard claims; used for API authorization)
export interface Auth0JwtPayload {
  sub: string;
  exp: number;
  iat: number;
  iss?: string;
  aud?: string | string[];
  scope?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  [key: string]: any;
}

export type SecureUserResponse = {
  id: string; // IdP user ID (sub claim)
  email: string;
  name: string;
  username: string;
  phoneNumber: string | null;
  dateOfBirth: string | null; // ISO date format "YYYY-MM-DD"
  userType?: string;
  emailVerified: boolean;
  marketingOptIn: boolean;
  profilePictureUrl: string | null;
  preferences: string | null;
  settings?: UserSettings;
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};

export type PublicUserResponse = {
  id: string;
  name: string;
  username: string;
  profilePictureUrl: string | null;
};

// User Settings Enums
export enum VisibilityLevel {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  FRIENDS_ONLY = 'FRIENDS_ONLY',
}

export enum ThemePreference {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

export enum PreferredLanguage {
  EN = 'EN',
  FR = 'FR',
}

// Location Types
export type LocationDto = {
  locationId: string; // UUID
};

export type LocationSearchResponse = {
  id: string; // UUID
  city: string;
  state: string | null;
  country: string;
  displayName: string;
  latitude: number;
  longitude: number;
};

// User Settings Types
// Note: preferredLanguage is stored as uppercase (EN, FR) from API but we use lowercase (en, fr) in frontend
// Conversion happens in authService
export type UserSettings = {
  bio?: string | null;
  location?: LocationDto | null;
  preferredLanguage?: PreferredLanguage | 'en' | 'fr' | null; // Allow both for flexibility
  profileVisibility?: VisibilityLevel;
  searchVisibility?: boolean;
  themePreference?: ThemePreference;
  emailNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  eventInvitationsEnabled?: boolean;
  eventUpdatesEnabled?: boolean;
  eventRemindersEnabled?: boolean;
  rsvpNotificationsEnabled?: boolean;
  commentNotificationsEnabled?: boolean;
  collaborationRequestsEnabled?: boolean;
  weeklyDigestEnabled?: boolean;
  activityFeedNotificationsEnabled?: boolean;
  autoAcceptInvitations?: boolean;
  exportEventDataEnabled?: boolean;
  mfaEnabled?: boolean;
  eventParticipationVisibility?: VisibilityLevel;
  reminderTimingMinutes?: number | null;
  showInEventDirectory?: boolean;
  smsNotificationsEnabled?: boolean;
};

export type UserSettingsUpdateRequest = {
  bio?: string;
  location?: LocationDto | null; // null explicitly clears the location
  preferredLanguage?: PreferredLanguage | 'en' | 'fr'; // Frontend uses lowercase, converted to uppercase in authService
  profileVisibility?: VisibilityLevel;
  searchVisibility?: boolean;
  themePreference?: ThemePreference;
  emailNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  eventInvitationsEnabled?: boolean;
  eventUpdatesEnabled?: boolean;
  eventRemindersEnabled?: boolean;
  rsvpNotificationsEnabled?: boolean;
  commentNotificationsEnabled?: boolean;
  collaborationRequestsEnabled?: boolean;
  weeklyDigestEnabled?: boolean;
  activityFeedNotificationsEnabled?: boolean;
  exportEventDataEnabled?: boolean;
  mfaEnabled?: boolean;
  autoAcceptInvitations?: boolean;
  eventParticipationVisibility?: VisibilityLevel;
  reminderTimingMinutes?: number | null;
  showInEventDirectory?: boolean;
  smsNotificationsEnabled?: boolean;
};

export type NotificationSettingsUpdateRequest = {
  emailNotificationsEnabled?: boolean;
  pushNotificationsEnabled?: boolean;
  smsNotificationsEnabled?: boolean;
  eventInvitationsEnabled?: boolean;
  eventUpdatesEnabled?: boolean;
  eventRemindersEnabled?: boolean;
  rsvpNotificationsEnabled?: boolean;
  commentNotificationsEnabled?: boolean;
  collaborationRequestsEnabled?: boolean;
  weeklyDigestEnabled?: boolean;
  activityFeedNotificationsEnabled?: boolean;
  reminderTimingMinutes?: number | null;
};

export type PrivacySettingsUpdateRequest = {
  profileVisibility?: VisibilityLevel;
  eventParticipationVisibility?: VisibilityLevel;
  searchVisibility?: boolean;
  showInEventDirectory?: boolean;
};

export type SecuritySettingsUpdateRequest = {
  mfaEnabled?: boolean;
  autoAcceptInvitations?: boolean;
  exportEventDataEnabled?: boolean;
};

export type PaginatedResponse<T> = {
  content: T[];
  pageable?: Record<string, unknown>;
  totalElements: number;
  totalPages: number;
  size?: number;
  number?: number;
};

// API Response Types
export type ApiResponse<T> = {
  status: number;
  message: string;
  data: T | null;
};

export type ApiErrorResponse = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
  validationErrors?: Record<string, string>;
};

export type ApiMessageResponse = {
  success: boolean;
  message: string;
};

// Auth Types
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
};

export type LoginRequest = {
  email: string;
  password: string;
  rememberMe?: boolean; // Kept for UI compatibility
};

export type RegisterRequest = {
  email: string;
  password: string;
};

// JIT onboarding request for backend signup after IdP auth
export type JitSignupRequest = {
  email: string;
  username: string;
  name?: string;
  phoneNumber?: string;
  marketingOptIn?: boolean;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
};

export type SecureAuthResponse = {
  message: string;
  user: SecureUserResponse | User;
  accessToken: string;
  refreshToken?: string;
  tokenType: 'Bearer';
  onboardingRequired: boolean;
};

export type AuthSessionResponse = {
  user: SecureUserResponse;
  onboardingRequired: boolean;
};

export type RefreshTokenRequest = {
  refreshToken: string;
};

export type ValidateTokenRequest = {
  token: string;
};

export type TokenValidationResponse = {
  valid: boolean;
  error: string | null;
  user: SecureUserResponse | User | null;
};

export type PasswordResponse = {
  message: string;
  success: boolean;
};

// Onboarding Types
export type OnboardingRequest = {
  name: string; // Required, 2-100 characters, no HTML tags
  username?: string; // Optional, 3-30 characters, letters, numbers, '.' or '_' (cannot start/end with '.' or '_')
  phoneNumber?: string; // Optional, valid phone format: +?[0-9 .-]{7,20}
  profilePictureUrl?: string; // Optional, max 500 characters
  dateOfBirth?: string; // Optional, ISO date format "YYYY-MM-DD", must be in past
  acceptTerms: boolean; // Required, must be true
  acceptPrivacy: boolean; // Required, must be true
  marketingOptIn?: boolean; // Optional, default: false
};

// Register Response (just success message, no tokens)
export type RegisterResponse = {
  success: boolean;
  message: string;
};

// Email Verification Types
export type ResendEmailVerificationRequest = {
  email: string;
};

// Profile Management Types
export type UpdateUserProfileRequest = {
  name: string; // Required, 2-100 characters, no HTML tags
  username?: string; // Optional, 3-30 characters, letters, numbers, '.' or '_' (cannot start/end with '.' or '_'). Can only be set once.
  phoneNumber?: string; // Optional, valid phone format: +?[0-9 .-]{7,20}
  profilePictureUrl?: string; // Optional, max 500 characters
  dateOfBirth?: string; // Optional, ISO date format "YYYY-MM-DD", must be in past
  acceptTerms?: boolean; // Optional, for onboarding
  acceptPrivacy?: boolean; // Optional, for onboarding
  userType?: string; // Optional
  preferences?: string; // Optional, max 2000 characters
  marketingOptIn?: boolean; // Optional, default: false
  settings?: UserSettingsUpdateRequest; // Optional, nested user settings (patch-style update)
};

// Profile Image Types
export type ProfileImageUploadRequest = {
  fileName: string; // Required, original file name
  contentType: string; // Required, MIME content type (e.g., "image/png")
};

export type ProfileImageUploadResponse = {
  uploadMethod: string; // HTTP method to use when uploading (e.g., "PUT")
  uploadUrl: string; // Pre-signed URL to upload the image to S3
  headers: Record<string, string>; // Headers that must be included when uploading
  objectKey: string; // Key of the object that will be created in S3
  resourceUrl: string; // URL where the uploaded image will be accessible
  expiresAt: string; // ISO datetime, expiration timestamp for the upload URL
};

export type ProfileImageCompleteRequest = {
  objectKey: string; // Required, S3 object key returned by /profile-image/upload-url
  resourceUrl: string; // Required, non-presigned URL to the uploaded object (no query params)
};

export type ProfileImageCompleteResponse = {
  profilePictureUrl: string;
  updatedAt: string; // ISO datetime
};

export type CompleteOnboardingWithImageRequest = {
  onboarding: OnboardingRequest; // Required, user profile information
  imageUpload?: ProfileImageUploadRequest; // Optional, profile image upload metadata (to get a presigned URL)
};

export type CompleteOnboardingWithImageResponse = {
  user: SecureUserResponse; // Updated user profile info
  imageUpload?: ProfileImageUploadResponse; // Presigned URL and metadata for profile image upload (if requested)
};

// Session Management Types
export type LogoutRequest = {
  confirm: boolean; // Required, must be true to confirm logout action
};

export type LogoutResponse = {
  message: string;
  success: boolean;
};

export type SessionResponse = {
  message: string;
  success: boolean;
};

export type UserSessionResponse = {
  id: string;
  deviceId: string;
  ipAddress: string;
  createdAt: string; // ISO datetime
  lastSeenAt: string; // ISO datetime
  expiresAt: string; // ISO datetime
  active: boolean;
};
