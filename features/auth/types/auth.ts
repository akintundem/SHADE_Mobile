/**
 * Authentication related types
 */

import { UserType } from '../../../events/types/enums';

// Base types
export type User = {
  id: string;
  email: string;
  name?: string;
  provider?: 'password' | 'spotify';
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

export type UserResponse = {
  id: string;
  email: string;
  name: string;
  phoneNumber: string | null;
  dateOfBirth: string | null;
  userType: UserType;
  emailVerified: boolean;
  marketingOptIn: boolean;
  profileImageUrl: string | null;
  preferences: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  message: string;
  user: UserResponse;
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  deviceId: string;
  onboardingRequired: boolean;
};

export type RefreshTokenRequest = {
  refreshToken: string;
  deviceId?: string;
  clientId?: string;
};

export type ValidateTokenRequest = {
  token: string;
};

export type ValidateTokenResponse = {
  valid: boolean;
  error: string | null;
  user: UserResponse | null;
};

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
  clientId?: string;
};

// Onboarding Types
export type OnboardingRequest = {
  name: string; // Required, 2-100 characters, no HTML tags
  phoneNumber?: string; // Optional, valid phone format: +?[0-9 .-]{7,20}
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
