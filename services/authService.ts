import { http, httpUnauthenticated, persistTokenFrom } from './httpClient';
import { 
  ApiResponse, 
  AuthTokens, 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  UserResponse, 
  RefreshTokenRequest, 
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
        userId: res.data.user.id,
        email: res.data.user.email,
        username: res.data.user.name,
        profilePictureUrl: res.data.user.profileImageUrl,
        profileComplete: true
      });
      console.log('🔐 User data cached:', res.data.user.id);
      
      return res.data;
    }
    throw new Error('Registration failed');
  },

  // User Login
  async loginNew(request: LoginRequest) {
    const res = await httpUnauthenticated.post<AuthResponse>('/api/v1/auth/login', request);
    if (res.data) {
      console.log('🔐 Login successful, saving token...');
      await persistTokenFrom({ token: res.data.accessToken });
      
      // Cache user data including user ID for X-User-Id header
      const { setUser } = await import('../storage/authStorage');
      await setUser({
        userId: res.data.user.id,
        email: res.data.user.email,
        username: res.data.user.name,
        profilePictureUrl: res.data.user.profileImageUrl,
        profileComplete: true
      });
      console.log('🔐 User data cached:', res.data.user.id);
      
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
  async validateToken(request: ValidateTokenRequest) {
    const res = await httpUnauthenticated.post<ValidateTokenResponse>('/api/v1/auth/validate-token', request);
    return res.data;
  },

  // Logout
  async logout() {
    try {
      await http.post<{ message: string }>('/api/v1/auth/logout');
    } finally {
      // Regardless of server response, client removes token (stateless JWT)
      const { clearToken } = await import('../storage/authStorage');
      await clearToken();
    }
  },

  // Forgot Password
  async forgotPassword(email: string) {
    const res = await httpUnauthenticated.post<{ message: string }>('/api/v1/auth/forgot-password', { email });
    return res.data;
  },

  // Reset Password
  async resetPassword(token: string, newPassword: string) {
    const res = await httpUnauthenticated.post<{ message: string }>('/api/v1/auth/reset-password', {
      token,
      newPassword
    });
    return res.data;
  },

  // Change Password
  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string, deviceId?: string, clientId?: string) {
    const res = await http.post<{ message: string }>('/api/v1/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword,
      deviceId,
      clientId
    });
    return res.data;
  },

  // Resend Email Verification
  async resendEmailVerification(email: string) {
    const res = await httpUnauthenticated.post<{ message: string }>('/api/v1/auth/verify-email', { email });
    return res.data;
  },

  // Verify Email
  async verifyEmail(token: string) {
    const res = await httpUnauthenticated.get<{ message: string }>(`/api/v1/auth/verify-email/${token}`);
    return res.data;
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

