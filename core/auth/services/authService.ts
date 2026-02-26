import { http } from '../../../common/services/httpClient';
import {
  LoginRequest,
  RegisterRequest,
  SecureAuthResponse,
  SecureUserResponse,
  User,
  AuthSessionResponse,
  Auth0JwtPayload,
  JitSignupRequest,
  TokenValidationResponse,
  ValidateTokenRequest,
  PasswordResponse,
  UpdateUserProfileRequest,
  ProfileImageUploadRequest,
  ProfileImageUploadResponse,
  ProfileImageCompleteRequest,
  ProfileImageCompleteResponse,
  PaginatedResponse,
  PublicUserResponse,
  LocationSearchResponse,
  NotificationSettingsUpdateRequest,
  PrivacySettingsUpdateRequest,
  SecuritySettingsUpdateRequest,
} from '../types/auth';
import {
  setToken,
  setIdToken,
  setRefreshToken,
  clearAllAuth,
  setUser,
  getToken,
  getRefreshToken,
} from '../../../common/storage/authStorage';
import { jwtDecode } from 'jwt-decode';
import {
  auth0PasswordLogin,
  auth0SignUp,
  auth0ChangePassword,
  auth0RefreshToken,
} from './auth0Api';
import { AuthError, AuthErrorCode } from '../errors/AuthError';
import { normalizeEmail, isBackendUserMissing } from '../utils/authUtils';

const buildPagedUrl = (base: string, page?: number, size?: number): string => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append('page', page.toString());
  if (size !== undefined) params.append('size', size.toString());
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function extractIdentityFromToken(accessToken: string): User | null {
  try {
    const decoded = jwtDecode<Auth0JwtPayload>(accessToken);
    if (decoded.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }
    const name =
      decoded.name ||
      [decoded.given_name, decoded.family_name].filter(Boolean).join(' ') ||
      decoded.preferred_username;
    return {
      id: decoded.sub,
      email: decoded.email || '',
      name: name || undefined,
      username: decoded.preferred_username || undefined,
      emailVerified: decoded.email_verified === true,
    };
  } catch {
    return null;
  }
}

async function persistTokens(
  accessToken: string,
  refreshToken?: string,
  idToken?: string,
): Promise<void> {
  await setToken(accessToken);
  if (idToken) await setIdToken(idToken);
  if (refreshToken) await setRefreshToken(refreshToken);
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

export const authService = {
  /**
   * Authenticate with email + password, store tokens, and resolve the
   * backend session (or flag onboarding-required).
   */
  async signIn(request: LoginRequest): Promise<SecureAuthResponse> {
    const email = normalizeEmail(request.email);
    const tokens = await auth0PasswordLogin(email, request.password);

    await persistTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);

    const identity = extractIdentityFromToken(tokens.access_token);
    if (!identity?.id) {
      throw new AuthError(
        AuthErrorCode.TOKEN_INVALID,
        'Failed to retrieve authenticated user',
      );
    }
    if (!identity.email && email.includes('@')) {
      identity.email = email;
    }

    let session: AuthSessionResponse | null = null;
    try {
      session = await this.getAuthSession();
    } catch (error: unknown) {
      if (isBackendUserMissing(error)) {
        session = null;
      } else {
        throw new AuthError(
          AuthErrorCode.UNKNOWN,
          'Unable to load user profile after sign-in. Please try again.',
        );
      }
    }

    const user = session?.user ?? identity;
    const onboardingRequired = session?.onboardingRequired ?? true;
    await setUser(user);

    return {
      message: 'Login successful',
      user,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenType: 'Bearer',
      onboardingRequired,
    };
  },

  /**
   * Register a new user via Auth0 database signup.
   * No tokens are issued — user must verify their email first.
   */
  async signUp(
    request: RegisterRequest,
  ): Promise<{ success: boolean; message: string }> {
    const email = normalizeEmail(request.email);
    await auth0SignUp(email, request.password);
    return {
      success: true,
      message: 'Registration successful. Please check your email for a verification link.',
    };
  },

  /**
   * Complete backend onboarding (JIT signup) after initial IdP auth.
   */
  async completeSignup(request: JitSignupRequest): Promise<AuthSessionResponse> {
    const payload: JitSignupRequest = {
      ...request,
      email: normalizeEmail(request.email),
      username: request.username.trim(),
      name: request.name?.trim(),
      phoneNumber: request.phoneNumber?.trim(),
    };
    await http.post<SecureUserResponse>('/api/v1/auth/signup', payload);
    const session = await this.getAuthSession();
    await setUser(session.user);
    return session;
  },

  /**
   * Validate the current access token, attempt a silent refresh if expired,
   * and resolve the backend session user.
   */
  async validateToken(
    request: ValidateTokenRequest,
  ): Promise<TokenValidationResponse> {
    try {
      let accessToken = await getToken();
      if (!accessToken) {
        return { valid: false, error: 'No active session', user: null };
      }

      if (request.token && accessToken !== request.token) {
        const decoded = jwtDecode<Auth0JwtPayload>(request.token);
        if (decoded.exp < Math.floor(Date.now() / 1000)) {
          return { valid: false, error: 'Token expired', user: null };
        }
      }

      let identity = extractIdentityFromToken(accessToken);
      if (!identity?.id) {
        const refresh = await getRefreshToken();
        if (refresh) {
          try {
            const tokens = await auth0RefreshToken(refresh);
            await persistTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);
            accessToken = tokens.access_token;
            identity = extractIdentityFromToken(accessToken);
          } catch {
            // fall through to invalid check
          }
        }
      }
      if (!identity?.id) {
        return { valid: false, error: 'Invalid token payload', user: null };
      }

      try {
        const session = await this.getAuthSession();
        return { valid: true, error: null, user: session.user };
      } catch (sessionError: unknown) {
        if (isBackendUserMissing(sessionError)) {
          return { valid: true, error: null, user: identity };
        }
        return { valid: false, error: 'Backend user not available', user: null };
      }
    } catch {
      return { valid: false, error: 'Token validation failed', user: null };
    }
  },

  async getAuthSession(): Promise<AuthSessionResponse> {
    const response = await http.get<AuthSessionResponse>('/api/v1/auth/session');
    return response.data;
  },

  /** Current auth user ID from the stored token. */
  async getCurrentAuthUser(): Promise<{ userId: string }> {
    const token = await getToken();
    if (!token) {
      throw new AuthError(AuthErrorCode.NO_SESSION, 'No active session');
    }
    const identity = extractIdentityFromToken(token);
    if (!identity?.id) {
      throw new AuthError(AuthErrorCode.NO_SESSION, 'No active session');
    }
    return { userId: identity.id };
  },

  async refreshToken(): Promise<{ accessToken: string; refreshToken?: string }> {
    const refresh = await getRefreshToken();
    if (!refresh) {
      await clearAllAuth();
      throw new AuthError(AuthErrorCode.NO_SESSION, 'No active session');
    }
    const tokens = await auth0RefreshToken(refresh);
    await persistTokens(tokens.access_token, tokens.refresh_token, tokens.id_token);
    if (!tokens.access_token) {
      await clearAllAuth();
      throw new AuthError(
        AuthErrorCode.REFRESH_FAILED,
        'Failed to refresh access token',
      );
    }
    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
    };
  },

  async logout(): Promise<void> {
    try {
      await http.post('/api/v1/auth/logout', { confirm: true });
    } catch {
      // Server-side logout is best-effort
    } finally {
      await clearAllAuth();
    }
  },

  async forgotPassword(email: string): Promise<PasswordResponse> {
    await auth0ChangePassword(normalizeEmail(email));
    return { success: true, message: 'Password reset email sent' };
  },

  // ---------------------------------------------------------------------------
  // Profile / user management (passthrough to backend API)
  // ---------------------------------------------------------------------------

  async updateUserProfile(
    userId: string,
    request: UpdateUserProfileRequest,
  ): Promise<SecureUserResponse> {
    const response = await http.put<SecureUserResponse>(
      `/api/v1/auth/users/${userId}`,
      request,
    );
    return response.data;
  },

  async deleteUser(userId: string): Promise<void> {
    await http.delete(`/api/v1/auth/users/${userId}`);
  },

  async getUser(userId: string): Promise<PublicUserResponse> {
    const response = await http.get<PublicUserResponse>(
      `/api/v1/auth/users/${userId}`,
    );
    return response.data;
  },

  async searchSecureUsers(
    searchTerm: string,
    pagination?: { page: number; size: number },
  ): Promise<PaginatedResponse<SecureUserResponse>> {
    const params = new URLSearchParams();
    params.append('searchTerm', searchTerm.trim());
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('size', pagination.size.toString());
    }
    const response = await http.get<PaginatedResponse<SecureUserResponse>>(
      `/api/v1/auth/users/search?${params.toString()}`,
    );
    return response.data;
  },

  async searchLocations(
    query?: string,
    pagination?: { page: number; size: number },
  ): Promise<PaginatedResponse<LocationSearchResponse>> {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('size', pagination.size.toString());
    }
    const response = await http.get<PaginatedResponse<LocationSearchResponse>>(
      `/api/v1/auth/users/locations/search?${params.toString()}`,
    );
    return response.data;
  },

  async searchDirectory(
    query: string,
    pagination?: { page: number; size: number },
  ): Promise<PaginatedResponse<PublicUserResponse>> {
    const params = new URLSearchParams();
    params.append('searchTerm', query);
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('size', pagination.size.toString());
    }
    const response = await http.get<PaginatedResponse<PublicUserResponse>>(
      `/api/v1/auth/users/directory?${params.toString()}`,
    );
    return response.data;
  },

  async listDirectory(
    pagination?: { page: number; size: number },
  ): Promise<PaginatedResponse<PublicUserResponse>> {
    const params = new URLSearchParams();
    params.append('searchTerm', '');
    if (pagination) {
      params.append('page', pagination.page.toString());
      params.append('size', pagination.size.toString());
    }
    const response = await http.get<PaginatedResponse<PublicUserResponse>>(
      `/api/v1/auth/users/directory?${params.toString()}`,
    );
    return response.data;
  },

  async getProfileImageUploadUrl(
    request: ProfileImageUploadRequest,
  ): Promise<ProfileImageUploadResponse> {
    const response = await http.post<ProfileImageUploadResponse>(
      '/api/v1/auth/profile-image/upload-url',
      request,
    );
    return response.data;
  },

  async completeProfileImageUpload(
    request: ProfileImageCompleteRequest,
  ): Promise<ProfileImageCompleteResponse> {
    const response = await http.post<ProfileImageCompleteResponse>(
      '/api/v1/auth/profile-image/complete',
      request,
    );
    return response.data;
  },

  async getMyPosts(
    page?: number,
    size?: number,
  ): Promise<import('../../feeds/types/feeds').PostListResponse> {
    const response = await http.get<import('../../feeds/types/feeds').PostListResponse>(
      buildPagedUrl('/api/v1/auth/users/me/posts', page, size),
    );
    return response.data;
  },

  async getUserPosts(
    userId: string,
    page?: number,
    size?: number,
  ): Promise<import('../../feeds/types/feeds').PostListResponse> {
    const response = await http.get<import('../../feeds/types/feeds').PostListResponse>(
      buildPagedUrl(`/api/v1/auth/users/${userId}/posts`, page, size),
    );
    return response.data;
  },

  async updateMyNotificationSettings(
    request: NotificationSettingsUpdateRequest,
  ): Promise<SecureUserResponse> {
    const response = await http.put<SecureUserResponse>(
      '/api/v1/auth/users/me/notification-settings',
      request,
    );
    return response.data;
  },

  async updateNotificationSettings(
    userId: string,
    request: NotificationSettingsUpdateRequest,
  ): Promise<SecureUserResponse> {
    const response = await http.put<SecureUserResponse>(
      `/api/v1/auth/users/${userId}/notification-settings`,
      request,
    );
    return response.data;
  },

  async updateMyPrivacySettings(
    request: PrivacySettingsUpdateRequest,
  ): Promise<SecureUserResponse> {
    const response = await http.put<SecureUserResponse>(
      '/api/v1/auth/users/me/privacy-settings',
      request,
    );
    return response.data;
  },

  async updatePrivacySettings(
    userId: string,
    request: PrivacySettingsUpdateRequest,
  ): Promise<SecureUserResponse> {
    const response = await http.put<SecureUserResponse>(
      `/api/v1/auth/users/${userId}/privacy-settings`,
      request,
    );
    return response.data;
  },

  async updateMySecuritySettings(
    request: SecuritySettingsUpdateRequest,
  ): Promise<SecureUserResponse> {
    const response = await http.put<SecureUserResponse>(
      '/api/v1/auth/users/me/security-settings',
      request,
    );
    return response.data;
  },

  async updateSecuritySettings(
    userId: string,
    request: SecuritySettingsUpdateRequest,
  ): Promise<SecureUserResponse> {
    const response = await http.put<SecureUserResponse>(
      `/api/v1/auth/users/${userId}/security-settings`,
      request,
    );
    return response.data;
  },
};
