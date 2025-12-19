/**
 * Security related types
 */

// Base types
export type User = {
  id: string;
  email: string;
  name?: string;
  provider?: 'password' | 'spotify';
};

export type SecureUserResponse = {
  id: string;
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
  createdAt: string; // ISO datetime
  updatedAt: string; // ISO datetime
};

export type PublicUserResponse = {
  id: string;
  name: string;
  username: string;
  profilePictureUrl: string | null;
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
  rememberMe?: boolean;
};

export type RegisterRequest = {
  email: string;
  password: string;
  confirmPassword: string;
};

export type SecureAuthResponse = {
  message: string;
  user: SecureUserResponse;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  deviceId: string; // Server-issued device identifier for session validation
  onboardingRequired: boolean; // Indicates if user needs to complete profile onboarding
};

export type RefreshTokenRequest = {
  refreshToken: string;
  deviceId?: string;
};

export type ValidateTokenRequest = {
  token: string;
};

export type TokenValidationResponse = {
  valid: boolean;
  error: string | null;
  user: SecureUserResponse | null;
};

// Password Management Types
export type ForgotPasswordRequest = {
  email: string;
};

export type ResetPasswordRequest = {
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  deviceId?: string;
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
  username?: string; // Optional, 3-30 characters, letters, numbers, '.' or '_' (cannot start/end with '.' or '_')
  phoneNumber?: string; // Optional, valid phone format: +?[0-9 .-]{7,20}
  profilePictureUrl?: string; // Optional, max 500 characters
  userType?: string; // Optional
  preferences?: string; // Optional, max 2000 characters
  marketingOptIn?: boolean; // Optional, default: false
  deviceId?: string; // Optional, max 120 characters
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

