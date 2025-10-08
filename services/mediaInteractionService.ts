import { http } from './httpClient';

export type ApiReply<T> = { status: number; message: string; data: T | null };

export enum InteractionType {
  LIKE = 'LIKE',
  DISLIKE = 'DISLIKE',
  FAVORITE = 'FAVORITE',
  SHARE = 'SHARE',
  VIEW = 'VIEW',
  COMMENT = 'COMMENT',
  BOOKMARK = 'BOOKMARK',
}

export type UserInteractionDTO = {
  interactionId?: number;
  userId: string;
  mediaId: string;
  interactionType: InteractionType;
  timestamp: string; // YYYY-MM-DDTHH:mm:ss or ISO
  createdAt?: string;
  updatedAt?: string;
};

const base = '/interactions';

export const mediaInteractionService = {
  async createInteraction(payload: UserInteractionDTO) {
    const res = await http.post<ApiReply<UserInteractionDTO>>(base, payload);
    const body = res.data;
    if (body.status === 1 && body.data) return body.data;
    throw new Error(body?.message || 'Failed to create interaction');
  },

  async deleteInteraction(interactionId: number) {
    const res = await http.delete<ApiReply<null>>(`${base}/${interactionId}`);
    const body = res.data;
    if (body.status === 1) return true;
    throw new Error(body?.message || 'Failed to delete interaction');
  },

  async likeMedia(userId: string, mediaId: string) {
    return this.createInteraction({ userId, mediaId, interactionType: InteractionType.LIKE, timestamp: new Date().toISOString() });
  },

  async favoriteMedia(userId: string, mediaId: string) {
    return this.createInteraction({ userId, mediaId, interactionType: InteractionType.FAVORITE, timestamp: new Date().toISOString() });
  },

  async shareMedia(userId: string, mediaId: string) {
    return this.createInteraction({ userId, mediaId, interactionType: InteractionType.SHARE, timestamp: new Date().toISOString() });
  },

  async viewMedia(userId: string, mediaId: string) {
    return this.createInteraction({ userId, mediaId, interactionType: InteractionType.VIEW, timestamp: new Date().toISOString() });
  },
};

