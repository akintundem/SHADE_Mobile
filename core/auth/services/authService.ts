import { http, httpUnauthenticated, persistTokenFrom } from '../../../common/services/httpClient';
import {
  ApiMessageResponse,
  SecureAuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
  PaginatedResponse,
  PublicUserResponse,
  SecureUserResponse,
  ValidateTokenRequest,
  TokenValidationResponse,
  ResetPasswordRequest,
  ChangePasswordRequest,
  ResendEmailVerificationRequest,
  UpdateUserProfileRequest,
  UserSessionResponse,
  ProfileImageUploadRequest,
  ProfileImageUploadResponse,
  ProfileImageCompleteRequest,
  ProfileImageCompleteResponse,
} from '../types/auth';

// Lazy load authStorage to avoid circular dependencies
let authStorage: typeof import('../../../common/storage/authStorage') | null = null;

const getAuthStorage = async () => {
  if (!authStorage) {
    authStorage = await import('../../../common/storage/authStorage');
  }
  return authStorage;
};

const updateUserCache = async (user: SecureUserResponse, onboardingRequired?: boolean) => {
  const storage = await getAuthStorage();
  await storage.setUser({
    userId: user.id,
    email: user.email,
    username: user.username || user.email,
    profilePictureUrl: user.profilePictureUrl ?? undefined,
    profileComplete: onboardingRequired === undefined ? true : !onboardingRequired,
  });
};

export const securityService = {
  /**
   * Health check endpoint
   * @returns Health status information
   */
  async healthCheck() {
    const res = await httpUnauthenticated.get<{ service: string; status: string; timestamp: string }>('/api/v1/auth/health');
    return res.data;
  },

  /**
   * Register a new user
   * @param request - Registration request with email and password
   * @returns Success message response
   */
  async registerNew(request: RegisterRequest): Promise<RegisterResponse> {
    const res = await httpUnauthenticated.post<ApiMessageResponse>('/api/v1/auth/register', {
      email: request.email.toLowerCase().trim(),
      password: request.password,
      confirmPassword: request.confirmPassword,
    });

    return {
      success: res.data.success,
      message: res.data.message,
    };
  },

  /**
   * Login a user and store authentication tokens
   * @param request - Login credentials
   * @returns Authentication response with tokens and user data
   */
  async loginNew(request: LoginRequest): Promise<SecureAuthResponse> {
    const res = await httpUnauthenticated.post<SecureAuthResponse>('/api/v1/auth/login', {
      email: request.email.toLowerCase().trim(),
      password: request.password,
      rememberMe: request.rememberMe ?? false,
    });

    if (!res.data) {
      throw new Error('Login failed: No response data');
    }

    // Store access token
    await persistTokenFrom({ token: res.data.accessToken });

    // Store refresh token, device ID, and user data
    const storage = await getAuthStorage();
    if (res.data.refreshToken) {
      await storage.setRefreshToken(res.data.refreshToken);
    }
    if (res.data.deviceId) {
      await storage.setDeviceId(res.data.deviceId);
    }
    await updateUserCache(res.data.user, res.data.onboardingRequired);

    return res.data;
  },

  /**
   * Get the current authenticated user
   * @returns Current user information
   */
  async getCurrentUser(): Promise<SecureUserResponse> {
    const res = await http.get<SecureUserResponse>('/api/v1/auth/me');
    return res.data;
  },

  /**
   * Refresh the access token using refresh token
   * @param request - Optional refresh token request (will use stored token if not provided)
   * @returns New authentication tokens
   */
  async refreshToken(request?: RefreshTokenRequest): Promise<SecureAuthResponse> {
    let refreshRequest = request;

    // If no request provided, get refresh token from storage
    if (!refreshRequest) {
      const storage = await getAuthStorage();
      const refreshToken = await storage.getRefreshToken();
      const deviceId = await storage.getDeviceId();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      refreshRequest = {
        refreshToken,
        deviceId: deviceId || undefined,
      };
    }

    const res = await http.post<SecureAuthResponse>('/api/v1/auth/refresh-token', refreshRequest);

    if (!res.data) {
      throw new Error('Token refresh failed: No response data');
    }

    // Store new access token
    await persistTokenFrom({ token: res.data.accessToken });

    // Update refresh token and device ID if provided
    const storage = await getAuthStorage();
    if (res.data.refreshToken) {
      await storage.setRefreshToken(res.data.refreshToken);
    }
    if (res.data.deviceId) {
      await storage.setDeviceId(res.data.deviceId);
    }

    return res.data;
  },

  /**
   * Validate a JWT token
   * @param request - Token validation request
   * @returns Token validation result with user data if valid
   */
  async validateToken({ token }: ValidateTokenRequest): Promise<TokenValidationResponse> {
    if (!token) {
      throw new Error('Token is required');
    }

    const res = await httpUnauthenticated.post<TokenValidationResponse>(
      '/api/v1/auth/validate-token',
      undefined,
      { params: { token } }
    );
    return res.data;
  },

  /**
   * Logout the current user and clear all stored tokens
   * @returns Success message
   */
  async logout(): Promise<ApiMessageResponse> {
    try {
      const res = await http.post<ApiMessageResponse>('/api/v1/auth/logout', { confirm: true });
      const storage = await getAuthStorage();
      await storage.clearAllAuth();
      return res.data;
    } catch (error) {
      // Even if logout fails, clear client-side tokens
      const storage = await getAuthStorage();
      await storage.clearAllAuth();
      throw error;
    }
  },

  /**
   * Request password reset email
   * @param email - User email address
   * @returns Success message
   */
  async forgotPassword(email: string): Promise<ApiMessageResponse> {
    const res = await httpUnauthenticated.post<ApiMessageResponse>('/api/v1/auth/forgot-password', {
      email: email.toLowerCase().trim(),
    });
    return res.data;
  },

  /**
   * Reset password using reset token
   * @param request - Password reset request with token and new password
   * @returns Success message
   */
  async resetPassword(request: ResetPasswordRequest): Promise<ApiMessageResponse> {
    const res = await httpUnauthenticated.post<ApiMessageResponse>('/api/v1/auth/reset-password', request);
    return res.data;
  },

  /**
   * Change password for authenticated user
   * @param request - Password change request
   * @returns Success message
   */
  async changePassword(request: ChangePasswordRequest): Promise<ApiMessageResponse> {
    const res = await http.post<ApiMessageResponse>('/api/v1/auth/change-password', request);
    return res.data;
  },

  /**
   * Verify email address using verification token
   * @param token - Email verification token from email link
   * @returns HTML content of verification page
   */
  async verifyEmail(token: string): Promise<string> {
    const res = await httpUnauthenticated.get<string>(
      `/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`,
      { headers: { Accept: 'text/html' } }
    );
    return res.data;
  },

  /**
   * Resend email verification
   * @param email - User email address
   * @returns Success message
   */
  async resendEmailVerification(email: string): Promise<ApiMessageResponse> {
    const res = await httpUnauthenticated.post<ApiMessageResponse>('/api/v1/auth/verify-email', {
      email: email.toLowerCase().trim(),
    } as ResendEmailVerificationRequest);
    return res.data;
  },

  /**
   * Update user profile information (handles both onboarding and profile updates)
   * @param userId - User ID to update
   * @param request - Profile update data
   * @returns Updated user information
   */
  async updateUserProfile(userId: string, request: UpdateUserProfileRequest): Promise<SecureUserResponse> {
    const payload: any = {
      name: request.name.trim(),
      username: request.username?.trim() || undefined,
      phoneNumber: request.phoneNumber || null,
      profilePictureUrl: request.profilePictureUrl || undefined,
      dateOfBirth: request.dateOfBirth || null,
      acceptTerms: request.acceptTerms,
      acceptPrivacy: request.acceptPrivacy,
      userType: request.userType,
      preferences: request.preferences || undefined,
      marketingOptIn: request.marketingOptIn ?? false,
      deviceId: request.deviceId || undefined,
    };

    // Include settings if provided (patch-style update)
    if (request.settings) {
      payload.settings = request.settings;
    }

    const res = await http.put<SecureUserResponse>(`/api/v1/auth/users/${userId}`, payload);

    await updateUserCache(res.data);

    return res.data;
  },

  /**
   * Directory search for public user information
   * @param searchTerm - Optional search term (if empty returns all users)
   * @param params - Optional pagination parameters
   * @returns Paginated list of public user information
   */
  async searchDirectory(
    searchTerm?: string,
    params?: { page?: number; size?: number },
  ): Promise<PaginatedResponse<PublicUserResponse>> {
    const queryParams = new URLSearchParams();
    if (searchTerm) {
      queryParams.append('searchTerm', searchTerm.trim());
    }
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      queryParams.append('size', params.size.toString());
    }

    const res = await http.get<PaginatedResponse<PublicUserResponse>>(
      `/api/v1/auth/users/directory?${queryParams.toString()}`,
    );
    return res.data;
  },

  /**
   * Get presigned URL for profile image upload
   * @param request - Image upload request with file metadata
   * @returns Presigned upload URL and metadata
   */
  async getProfileImageUploadUrl(request: ProfileImageUploadRequest): Promise<ProfileImageUploadResponse> {
    const res = await http.post<ProfileImageUploadResponse>('/api/v1/auth/profile-image/upload-url', request);
    return res.data;
  },

  /**
   * Complete profile image upload after S3 upload
   * @param request - Upload completion request with S3 object details
   * @returns Updated profile picture URL
   */
  async completeProfileImageUpload(request: ProfileImageCompleteRequest): Promise<ProfileImageCompleteResponse> {
    const res = await http.post<ProfileImageCompleteResponse>('/api/v1/auth/profile-image/complete', request);

    // Update cached user data with new profile picture URL
    if (res.data.profilePictureUrl) {
      const storage = await getAuthStorage();
      const currentUser = await storage.getUser<SecureUserResponse>();
      if (currentUser) {
        await storage.setUser({
          ...currentUser,
          profilePictureUrl: res.data.profilePictureUrl,
        });
      }
    }

    return res.data;
  },

  /**
   * Get all active user sessions
   * @returns List of active sessions
   */
  async getActiveSessions(): Promise<UserSessionResponse[]> {
    const res = await http.get<UserSessionResponse[]>('/api/v1/auth/sessions');
    return res.data;
  },

  /**
   * Terminate all user sessions
   * @returns Success message
   */
  async terminateAllSessions(): Promise<ApiMessageResponse> {
    const res = await http.delete<ApiMessageResponse>('/api/v1/auth/sessions/all');
    return res.data;
  },
};

// Export as authService for backward compatibility
export const authService = securityService;
