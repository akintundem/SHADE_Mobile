/**
 * Authentication related types
 */

import { UserType } from './enums';

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
  deviceId?: string;
  clientId?: string;
};

export type RegisterRequest = {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingOptIn?: boolean;
  deviceId?: string;
  clientId?: string;
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
  tokenType: string;
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
