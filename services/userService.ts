import { http } from './httpClient';

export type ApiReply<T> = { status: number; message: string; data: T | null };

export type UserDTO = {
  userId: string;
  email: string;
  username?: string;
  profilePictureUrl?: string;
  profileComplete: boolean;
  fullName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  createdAt?: string;
  updatedAt?: string;
};

export type CompleteProfileRequest = {
  username: string;
  fullName: string;
  dateOfBirth: string; // YYYY-MM-DD
  profilePictureUrl?: string;
};

export const userService = {
  async getUserByUsername(username: string) {
    const res = await http.get<ApiReply<UserDTO>>(`/users/username/${encodeURIComponent(username)}`);
    const body = res.data;
    if ((res.status === 200 || body.status === 200) && body.data) return body.data;
    throw new Error(body?.message || 'Failed to fetch user');
  },

  async getCurrentUser() {
    const res = await http.get<ApiReply<UserDTO>>('/users/me');
    const body = res.data;
    if ((res.status === 200 || body.status === 200) && body.data) return body.data;
    throw new Error(body?.message || 'Failed to fetch current user');
  },

  async updateCurrentUser(update: Partial<Pick<UserDTO, 'username' | 'profilePictureUrl' | 'fullName' | 'dateOfBirth'>>) {
    const res = await http.put<ApiReply<UserDTO>>('/users/me', update);
    const body = res.data;
    if ((res.status === 200 || body.status === 200) && body.data) return body.data;
    throw new Error(body?.message || 'Failed to update user');
  },

  async deleteCurrentUser() {
    const res = await http.delete<ApiReply<null>>('/users/me');
    const body = res.data;
    if (res.status === 200 || body.status === 200) return true;
    throw new Error(body?.message || 'Failed to delete user');
  },

  async completeProfile(payload: CompleteProfileRequest) {
    const res = await http.put<ApiReply<UserDTO>>('/users/me/profile', payload);
    const body = res.data;
    if ((res.status === 200 || body.status === 1) && body.data) return body.data;
    throw new Error(body?.message || 'Failed to complete profile');
  },
};

