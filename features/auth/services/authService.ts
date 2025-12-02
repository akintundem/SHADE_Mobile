import { http, httpUnauthenticated, persistTokenFrom } from '../../../common/services/httpClient';
import {
  ApiMessageResponse,
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
  OnboardingRequest,
  UserResponse,
  ValidateTokenRequest,
  ValidateTokenResponse
} from '../types';

export const authService = {
  // Health Check
  async healthCheck() {
    const res = await httpUnauthenticated.get<{ service: string; status: string; timestamp: string }>('/api/v1/auth/health');
    return res.data;
  },

  /**
   * Register a new user
   * @param request - RegisterRequest
   * @returns RegisterResponse
   * @throws Error
   */
  async registerNew(request: RegisterRequest) {
    try {
      const res = await httpUnauthenticated.post<RegisterResponse>('/api/v1/auth/register', {
        email: request.email.toLowerCase().trim(),
        password: request.password,
        confirmPassword: request.confirmPassword,
      });
      if (res.data) {
        return res.data;
      }
      throw new Error('Registration failed: No response data');
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Login a user
   * @param request - LoginRequest
   * @returns AuthResponse
   * @throws Error
   */
  async loginNew(request: LoginRequest) {
    const res = await httpUnauthenticated.post<AuthResponse>('/api/v1/auth/login', {
      email: request.email.toLowerCase().trim(),
      password: request.password,
      rememberMe: request.rememberMe ?? false,

    });
    if (res.data) {
      await persistTokenFrom({ token: res.data.accessToken });
      // Store refresh token and deviceId
      const { setRefreshToken, setDeviceId, setUser } = await import('../../../common/storage/authStorage');
      if (res.data.refreshToken) {
        await setRefreshToken(res.data.refreshToken);
      }
      if (res.data.deviceId) {
        await setDeviceId(res.data.deviceId);
      }
      await setUser({
        userId: res.data.user.email,
        email: res.data.user.email,
        username: res.data.user.email,
        profilePictureUrl: res.data.user.profileImageUrl ?? undefined,
        profileComplete: !res.data.onboardingRequired
      });

      return res.data;
    }
    throw new Error('Login failed');
  },

  /**
   * Get the current user
   * @returns UserResponse
   * @throws Error
   */
  async getCurrentUser() {
    const res = await http.get<UserResponse>('/api/v1/auth/me');
    return res.data;
  },

  /**
   * Refresh the access token
   * @param request - RefreshTokenRequest
   * @returns AuthResponse
   * @throws Error
   */
  async refreshToken(request?: RefreshTokenRequest) {
    // If no request provided, try to get refresh token from storage
    if (!request) {
      const { getRefreshToken, getDeviceId } = await import('../../../common/storage/authStorage');
      const refreshToken = await getRefreshToken();
      const deviceId = await getDeviceId();

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      request = {
        refreshToken,
        deviceId: deviceId || undefined,
      };
    }

    const res = await httpUnauthenticated.post<AuthResponse>('/api/v1/auth/refresh-token', request);
    if (res.data) {
      await persistTokenFrom({ token: res.data.accessToken });

      // Store new refresh token if provided
      if (res.data.refreshToken) {
        const { setRefreshToken } = await import('../../../common/storage/authStorage');
        await setRefreshToken(res.data.refreshToken);
      }

      // Update deviceId if provided
      if (res.data.deviceId) {
        const { setDeviceId } = await import('../../../common/storage/authStorage');
        await setDeviceId(res.data.deviceId);
      }

      return res.data;
    }
    throw new Error('Token refresh failed');
  },

  /**
   * Validate a token
   * @param request - ValidateTokenRequest
   * @returns ValidateTokenResponse
   * @throws Error
   */
  async validateToken({ token }: ValidateTokenRequest) {
    if (!token) {
      throw new Error('Token is required');
    }
    const res = await httpUnauthenticated.post<ValidateTokenResponse>(
      '/api/v1/auth/validate-token',
      undefined,
      { params: { token } }
    );
    return res.data;
  },

  /**
   * Logout a user
   * @returns ApiMessageResponse
   * @throws Error
   */
  async logout() {
    try {
      // deviceId is automatically added by httpClient interceptor from storage
      const res = await http.post<ApiMessageResponse>('/api/v1/auth/logout', { confirm: true });
      // Only clear after successful logout
      const { clearAllAuth } = await import('../../../common/storage/authStorage');
      await clearAllAuth();
      return res.data;
    } catch (error) {
      // Even if logout fails, clear client-side tokens (stateless JWT)
      const { clearAllAuth } = await import('../../../common/storage/authStorage');
      await clearAllAuth();
      throw error;
    }
  },

  /**
   * Forgot a user's password
   * @param email - email of the user
   * @returns ApiMessageResponse
   * @throws Error
   */
  async forgotPassword(email: string) {
    try {
      const res = await httpUnauthenticated.post<ApiMessageResponse>('/api/v1/auth/forgot-password', { email });
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Change a user's password
   * @param currentPassword - current password of the user
   * @param newPassword - new password of the user
   * @param confirmPassword - confirm password of the user
   * @returns ApiMessageResponse
   * @throws Error
   */
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    try {
      // deviceId is automatically added by httpClient interceptor from storage
      const res = await http.post<ApiMessageResponse>('/api/v1/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Verify a user's email
   * @param token - token of the user
   * @returns ApiMessageResponse
   * @throws Error
   */
  async verifyEmail(token: string) {
    try {
      const res = await httpUnauthenticated.get<ApiMessageResponse>(`/api/v1/auth/verify-email/${token}`);
      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Complete a user's onboarding
   * @param request - OnboardingRequest
   * @returns UserResponse
   * @throws Error
   */
  async completeOnboarding(request: OnboardingRequest) {
    try {
      const res = await http.post<UserResponse>('/api/v1/auth/complete-onboarding', {
        name: request.name.trim(),
        phoneNumber: request.phoneNumber || null,
        dateOfBirth: request.dateOfBirth || null,
        acceptTerms: true, // Must be true
        acceptPrivacy: true, // Must be true
        marketingOptIn: request.marketingOptIn ?? false,
      });

      // Update cached user data
      const { setUser } = await import('../../../common/storage/authStorage');
      await setUser({
        userId: res.data.id ?? res.data.email,
        email: res.data.email,
        username: res.data.name,
        profilePictureUrl: res.data.profileImageUrl ?? undefined,
        profileComplete: true
      });

      return res.data;
    } catch (error: any) {
      throw error;
    }
  },

  /**
   * Search for users
   * @param query - query to search for
   * @param params - optional parameters
   * @returns ApiResponse<{ users: UserResponse[]; total: number; page: number; size: number }>
   * @throws Error
   */
  async searchUsers(query: string, params?: { page?: number; size?: number }) {
    const queryParams = new URLSearchParams({ q: query });
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.size) queryParams.append('size', params.size.toString());

    const url = `/api/v1/users/search?${queryParams.toString()}`;
    const res = await http.get<ApiResponse<{ users: UserResponse[]; total: number; page: number; size: number }>>(url);
    const body = res.data;
    if (body.status === 200 && body.data) {
      return body.data;
    }
    throw new Error(body.message || 'Failed to search users');
  },
};

