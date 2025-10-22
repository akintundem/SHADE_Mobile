import { http, persistTokenFrom } from './httpClient';
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
  // New API methods using the microservice endpoints
  async registerNew(request: RegisterRequest) {
    const res = await http.post<AuthResponse>('/api/v1/auth/register', request);
    if (res.data) {
      await persistTokenFrom({ token: res.data.accessToken });
      return res.data;
    }
    throw new Error('Registration failed');
  },

  async loginNew(request: LoginRequest) {
    const res = await http.post<AuthResponse>('/api/v1/auth/login', request);
    if (res.data) {
      await persistTokenFrom({ token: res.data.accessToken });
      return res.data;
    }
    throw new Error('Login failed');
  },

  async getCurrentUser() {
    const res = await http.get<UserResponse>('/api/v1/auth/me');
    return res.data;
  },

  async refreshToken(request: RefreshTokenRequest) {
    const res = await http.post<AuthResponse>('/api/v1/auth/refresh-token', request);
    if (res.data) {
      await persistTokenFrom({ token: res.data.accessToken });
      return res.data;
    }
    throw new Error('Token refresh failed');
  },

  async validateToken(request: ValidateTokenRequest) {
    const res = await http.post<ValidateTokenResponse>('/api/v1/auth/validate-token', request);
    return res.data;
  },

  async healthCheck() {
    const res = await http.get<{ service: string; status: string; timestamp: string }>('/api/v1/auth/health');
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

  async logout() {
    try {
      await http.post<{ message: string }>('/api/v1/auth/logout');
    } finally {
      // Regardless of server response, client removes token (stateless JWT)
      const { clearToken } = await import('../storage/authStorage');
      await clearToken();
    }
  },
};

