import { http } from './httpClient';

// Shared API reply shape for Events
export type ApiReply<T> = { status: number; message: string; data: T | null };

export type CreateEventDTO = {
  title: string;
  description?: string;
  startDate: string; // YYYY-MM-DDTHH:mm:ss
  endDate: string; // YYYY-MM-DDTHH:mm:ss
  location?: string;
  isPrivate: boolean;
  maxAttendees?: number;
  tags?: string[];
};

export type EventDTO = {
  eventId: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  location?: string;
  isPrivate: boolean;
  creatorId: string;
  maxAttendees?: number;
  tags?: string[];
  createdAt: string;
  updatedAt?: string;
};

export type EventCosigner = {
  id: string;
  eventId: string;
  cosignerId: string;
  addedAt: string;
};

export enum AccessLevel {
  VIEWER = 'VIEWER',
  COLLABORATOR = 'COLLABORATOR',
  OWNER = 'OWNER',
}

export type EventViewer = {
  id: string;
  eventId: string;
  userId: string;
  accessLevel: AccessLevel;
  grantedAt: string;
};

const base = '/events';

export const eventService = {
  async createEvent(payload: CreateEventDTO) {
    const res = await http.post<ApiReply<EventDTO>>(base, payload);
    const body = res.data;
    if (body.status === 1 && body.data) return body.data;
    throw new Error(body?.message || 'Failed to create event');
  },

  async getEvent(eventId: string) {
    const res = await http.get<ApiReply<EventDTO>>(`${base}/${encodeURIComponent(eventId)}`);
    const body = res.data;
    if (body.status === 1 && body.data) return body.data;
    throw new Error(body?.message || 'Failed to fetch event');
  },

  async getAllEvents() {
    const res = await http.get<ApiReply<EventDTO[]>>(base);
    const body = res.data;
    if (body.status === 1 && body.data) return body.data;
    throw new Error(body?.message || 'Failed to fetch events');
  },

  async updateEvent(eventId: string, payload: CreateEventDTO) {
    const res = await http.put<ApiReply<EventDTO>>(`${base}/${encodeURIComponent(eventId)}`, payload);
    const body = res.data;
    if (body.status === 1 && body.data) return body.data;
    throw new Error(body?.message || 'Failed to update event');
  },

  async deleteEvent(eventId: string) {
    const res = await http.delete<ApiReply<null>>(`${base}/${encodeURIComponent(eventId)}`);
    const body = res.data;
    if (body.status === 1) return true;
    throw new Error(body?.message || 'Failed to delete event');
  },

  async addCosigner(eventId: string, cosignerId: string) {
    const res = await http.post<ApiReply<EventCosigner>>(`${base}/${encodeURIComponent(eventId)}/cosigners`, undefined, {
      params: { cosignerId },
    });
    const body = res.data;
    if (body.status === 1 && body.data) return body.data;
    throw new Error(body?.message || 'Failed to add cosigner');
  },

  async removeCosigner(eventId: string, cosignerId: string) {
    const res = await http.delete<ApiReply<null>>(`${base}/${encodeURIComponent(eventId)}/cosigners/${encodeURIComponent(cosignerId)}`);
    const body = res.data;
    if (body.status === 1) return true;
    throw new Error(body?.message || 'Failed to remove cosigner');
  },

  async getEventCosigners(eventId: string) {
    const res = await http.get<ApiReply<EventCosigner[]>>(`${base}/${encodeURIComponent(eventId)}/cosigners`);
    const body = res.data;
    if (body.status === 1 && body.data) return body.data;
    throw new Error(body?.message || 'Failed to fetch cosigners');
  },

  async grantAccess(eventId: string, userId: string, accessLevel: AccessLevel = AccessLevel.VIEWER) {
    const res = await http.post<ApiReply<EventViewer>>(`${base}/${encodeURIComponent(eventId)}/access`, undefined, {
      params: { userId, accessLevel },
    });
    const body = res.data;
    if (body.status === 1 && body.data) return body.data;
    throw new Error(body?.message || 'Failed to grant access');
  },

  async revokeAccess(eventId: string, userId: string) {
    const res = await http.delete<ApiReply<null>>(`${base}/${encodeURIComponent(eventId)}/access/${encodeURIComponent(userId)}`);
    const body = res.data;
    if (body.status === 1) return true;
    throw new Error(body?.message || 'Failed to revoke access');
  },

  async getEventAccessList(eventId: string) {
    const res = await http.get<ApiReply<EventViewer[]>>(`${base}/${encodeURIComponent(eventId)}/access`);
    const body = res.data;
    if (body.status === 1 && body.data) return body.data;
    throw new Error(body?.message || 'Failed to fetch access list');
  },
};

