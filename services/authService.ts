import { http, persistTokenFrom } from './httpClient';

// DTOs aligned with backend docs
export type ApiReply<T> = { status: number; message: string; data: T | null };

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
  async register(email: string, password: string) {
    const res = await http.post<ApiReply<RegisterResponse>>('/auth/register', {
      email,
      password,
    });
    const body = res.data;
    if (body.status === 1 && body.data) {
      await persistTokenFrom(body.data);
      return body.data;
    }
    throw new Error(body.message || 'Registration failed');
  },

  async signIn(email: string, password: string) {
    const res = await http.post<ApiReply<SignInResponse>>('/auth/signin', {
      email,
      password,
    });
    const body = res.data;
    if (body.status === 1 && body.data) {
      await persistTokenFrom(body.data);
      return body.data;
    }
    throw new Error(body.message || 'Sign in failed');
  },

  async spotifyOAuth(code: string, redirectUri: string) {
    const res = await http.post<ApiReply<SpotifyResponse>>('/auth/oauth/spotify', {
      code,
      redirectUri,
    });
    const body = res.data;
    if ((body.status === 1 || body.status === 0) && body.data) {
      await persistTokenFrom(body.data);
      return body.data;
    }
    throw new Error(body.message || 'OAuth failed');
  },

  async logout() {
    try {
      await http.post<ApiReply<null>>('/auth/logout');
    } finally {
      // Regardless of server response, client removes token (stateless JWT)
      const { clearToken } = await import('../storage/authStorage');
      await clearToken();
    }
  },
};

