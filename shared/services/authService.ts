import { http, httpUnauthenticated, persistTokenFrom } from './httpClient';
import {
  ApiMessageResponse,
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  UserResponse,
  ValidateTokenRequest,
  ValidateTokenResponse
} from '../types';

// Legacy types for backward compatibility
export type UserDTO = {
  userId: string;
  email: string;
  username: string;
  profilePictureUrl?: string;
  profileComplete: boolean;
};

export type RegisterResponse = {
  token: string;
  requiresProfile: boolean;
  user: UserDTO;
};

export type SignInResponse = {
  token: string;
  user: UserDTO;
};

export type SpotifyResponse = {
  marker: 1 | 0; // 1 = existing, 0 = new
  token: string;
  user: UserDTO;
};

export const authService = {
  // Health Check
  async healthCheck() {
    const res = await httpUnauthenticated.get<{ service: string; status: string; timestamp: string }>('/api/v1/auth/health');
    return res.data;
  },

  // User Registration
  async registerNew(request: RegisterRequest) {
    const res = await httpUnauthenticated.post<AuthResponse>('/api/v1/auth/register', request);
    if (res.data) {
      console.log('🔐 Registration successful, saving token...');
      await persistTokenFrom({ token: res.data.accessToken });
      
      // Cache user data including user ID for X-User-Id header
      const { setUser } = await import('../storage/authStorage');
      await setUser({
        userId: res.data.user.id ?? res.data.user.email,
        email: res.data.user.email,
        username: res.data.user.name,
        profilePictureUrl: res.data.user.profileImageUrl ?? undefined,
        profileComplete: true
      });
      console.log('🔐 User data cached:', res.data.user.id ?? res.data.user.email);
      
      return res.data;
    }
    throw new Error('Registration failed');
  },

  // User Login
  async loginNew(request: LoginRequest) {
    const res = await httpUnauthenticated.post<AuthResponse>('/api/v1/auth/login', request);
    if (res.data) {
      await persistTokenFrom({ token: res.data.accessToken });
      
      // Cache user data including user ID for X-User-Id header
      const { setUser } = await import('../storage/authStorage');
      await setUser({
        userId: res.data.user.id ?? res.data.user.email,
        email: res.data.user.email,
        username: res.data.user.name,
        profilePictureUrl: res.data.user.profileImageUrl ?? undefined,
        profileComplete: true
      });
      
      return res.data;
    }
    throw new Error('Login failed');
  },

  // Get Current User
  async getCurrentUser() {
    const res = await http.get<UserResponse>('/api/v1/auth/me');
    return res.data;
  },

  // Refresh Token
  async refreshToken(request: RefreshTokenRequest) {
    const res = await httpUnauthenticated.post<AuthResponse>('/api/v1/auth/refresh-token', request);
    if (res.data) {
      await persistTokenFrom({ token: res.data.accessToken });
      return res.data;
    }
    throw new Error('Token refresh failed');
  },

  // Validate Token
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

  // Logout
  async logout() {
    try {
      const res = await http.post<ApiMessageResponse>('/api/v1/auth/logout');
      // Only clear after successful logout
      const { clearToken, clearUser } = await import('../storage/authStorage');
      await Promise.all([clearToken(), clearUser()]);
      return res.data;
    } catch (error) {
      // Even if logout fails, clear client-side token (stateless JWT)
      const { clearToken, clearUser } = await import('../storage/authStorage');
      await Promise.all([clearToken(), clearUser()]);
      throw error;
    }
  },

  // Forgot Password
  async forgotPassword(email: string) {
    console.log('🔐 [API] Forgot Password - Request:', { email });
    try {
      const res = await httpUnauthenticated.post<ApiMessageResponse>('/api/v1/auth/forgot-password', { email });
      console.log('✅ [API] Forgot Password - Success:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ [API] Forgot Password - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Reset Password
  async resetPassword(token: string, newPassword: string, confirmPassword?: string) {
    console.log('🔐 [API] Reset Password - Request:', { token: token.substring(0, 20) + '...', passwordLength: newPassword.length });
    try {
      const res = await httpUnauthenticated.post<ApiMessageResponse>('/api/v1/auth/reset-password', {
        token,
        newPassword,
        confirmPassword: confirmPassword ?? newPassword
      });
      console.log('✅ [API] Reset Password - Success:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ [API] Reset Password - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Change Password
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string, deviceId?: string, clientId?: string) {
    console.log('🔐 [API] Change Password - Request:', {
      currentPasswordLength: currentPassword.length,
      newPasswordLength: newPassword.length,
      deviceId,
      clientId
    });
    try {
      const res = await http.post<ApiMessageResponse>('/api/v1/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword,
        deviceId,
        clientId
      });
      console.log('✅ [API] Change Password - Success:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ [API] Change Password - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Resend Email Verification
  async resendEmailVerification(email: string) {
    console.log('📧 [API] Resend Email Verification - Request:', { email });
    try {
      const res = await httpUnauthenticated.post<ApiMessageResponse>('/api/v1/auth/verify-email', { email });
      console.log('✅ [API] Resend Email Verification - Success:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ [API] Resend Email Verification - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Verify Email
  async verifyEmail(token: string) {
    console.log('📧 [API] Verify Email - Request:', { token: token.substring(0, 20) + '...' });
    try {
      const res = await httpUnauthenticated.get<ApiMessageResponse>(`/api/v1/auth/verify-email/${token}`);
      console.log('✅ [API] Verify Email - Success:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('❌ [API] Verify Email - Error:', error.response?.data || error.message);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  async register(email: string, password: string) {
    const res = await http.post<ApiResponse<RegisterResponse>>('/auth/register', {
      email,
      password,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      await persistTokenFrom(body.data);
      return body.data;
    }
    throw new Error(body.message || 'Registration failed');
  },

  async signIn(email: string, password: string) {
    const res = await http.post<ApiResponse<SignInResponse>>('/auth/signin', {
      email,
      password,
    });
    const body = res.data;
    if (body.status === 200 && body.data) {
      await persistTokenFrom(body.data);
      return body.data;
    }
    throw new Error(body.message || 'Sign in failed');
  },

  async spotifyOAuth(code: string, redirectUri: string) {
    const res = await http.post<ApiResponse<SpotifyResponse>>('/auth/oauth/spotify', {
      code,
      redirectUri,
    });
    const body = res.data;
    if ((body.status === 200 || body.status === 201) && body.data) {
      await persistTokenFrom(body.data);
      return body.data;
    }
    throw new Error(body.message || 'OAuth failed');
  },

};

