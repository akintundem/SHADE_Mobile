import { http } from './httpClient';

// Types from the spec
export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  AUDIO = 'AUDIO',
  DOCUMENT = 'DOCUMENT',
}

export type CommentDTO = {
  id?: string;
  userId: string;
  userName: string;
  content: string;
  createdAt?: string;
};

export type MediaPostDTO = {
  id?: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType: MediaType;
  thumbnailUrl?: string;
  fileSize?: number;
  duration?: number;
  tags?: string[];
  isHighlighted: boolean;
  uploadedBy: string;
  eventId: string;
  uploadedAt?: string;
  likesCount?: number;
  comments?: CommentDTO[];
};

export type PresignedUrlResponse = {
  uploadUrl: string;
  mediaUrl: string;
  key: string;
};

const base = '/media';

export const mediaPostService = {
  // Create
  async createMediaPost(eventId: string, mediaPost: MediaPostDTO) {
    const res = await http.post<MediaPostDTO>(`${base}/event/${encodeURIComponent(eventId)}`, mediaPost);
    return res.data;
  },

  // Presigned URL
  async getPresignedUrl(eventId: string, contentType: string) {
    const res = await http.post<PresignedUrlResponse>(
      `${base}/presigned-url/event/${encodeURIComponent(eventId)}`,
      null,
      { params: { contentType } },
    );
    return res.data;
  },

  // Direct upload to S3 (or compatible) via presigned URL
  async uploadToPresigned(uploadUrl: string, data: Blob | ArrayBuffer | Uint8Array, contentType: string) {
    const resp = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: (data as any),
    });
    if (!resp.ok) throw new Error(`Upload failed (${resp.status})`);
  },

  // Update
  async updateMediaPost(id: string, eventId: string, updates: Partial<MediaPostDTO>) {
    const res = await http.put<MediaPostDTO>(`${base}/${encodeURIComponent(id)}/event/${encodeURIComponent(eventId)}`, updates);
    return res.data;
  },

  // Delete
  async deleteMediaPost(id: string, eventId: string) {
    await http.delete(`${base}/${encodeURIComponent(id)}/event/${encodeURIComponent(eventId)}`);
  },

  // Comments
  async addComment(id: string, eventId: string, comment: CommentDTO) {
    const res = await http.post<MediaPostDTO>(`${base}/${encodeURIComponent(id)}/event/${encodeURIComponent(eventId)}/comments`, comment);
    return res.data;
  },

  // Likes
  async likePost(id: string, eventId: string) {
    const res = await http.post<MediaPostDTO>(`${base}/${encodeURIComponent(id)}/event/${encodeURIComponent(eventId)}/likes`, null);
    return res.data;
  },
  async unlikePost(id: string, eventId: string) {
    const res = await http.delete<MediaPostDTO>(`${base}/${encodeURIComponent(id)}/event/${encodeURIComponent(eventId)}/likes`);
    return res.data;
  },

  // Queries
  async getEventMedia(eventId: string, opts?: { mediaType?: MediaType; highlight?: boolean; from?: string | Date; to?: string | Date }) {
    const params: any = {};
    if (opts?.mediaType) params.mediaType = opts.mediaType;
    if (opts?.highlight !== undefined) params.highlight = String(opts.highlight);
    if (opts?.from) params.from = (opts.from instanceof Date ? opts.from.toISOString() : opts.from);
    if (opts?.to) params.to = (opts.to instanceof Date ? opts.to.toISOString() : opts.to);
    const res = await http.get<MediaPostDTO[]>(`${base}/event/${encodeURIComponent(eventId)}`, { params });
    return res.data;
  },

  async getEventHighlights(eventId: string) {
    const res = await http.get<MediaPostDTO[]>(`${base}/event/${encodeURIComponent(eventId)}/highlights`);
    return res.data;
  },
};

// Helper: naive content-type inference from file extension
export function guessContentTypeFromPath(path: string): string {
  const lower = path.split('?')[0].toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  if (lower.endsWith('.mov')) return 'video/quicktime';
  if (lower.endsWith('.mp3')) return 'audio/mpeg';
  if (lower.endsWith('.wav')) return 'audio/wav';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}

// Helper: create a post from a local file URI using presigned upload.
// NOTE: This relies on React Native fetch/Blob support. For large files,
// consider using a streaming uploader library.
export async function createPostFromLocalUri(args: {
  eventId: string;
  localUri: string; // e.g., file:///.... or content://
  uploadedBy: string;
  title?: string;
  description?: string;
  tags?: string[];
  isHighlighted?: boolean;
  thumbnailUrl?: string;
  duration?: number;
  fileSize?: number;
}) {
  const { eventId, localUri, uploadedBy, title, description, tags, isHighlighted = false, thumbnailUrl, duration, fileSize } = args;

  const head = await fetch(localUri);
  const blob = await head.blob();
  const contentType = (head.headers.get('Content-Type') || guessContentTypeFromPath(localUri));

  const { uploadUrl, mediaUrl } = await mediaPostService.getPresignedUrl(eventId, contentType);
  await mediaPostService.uploadToPresigned(uploadUrl, blob, contentType);

  const mediaType: MediaType = contentType.startsWith('image/')
    ? MediaType.IMAGE
    : contentType.startsWith('video/')
      ? MediaType.VIDEO
      : contentType.startsWith('audio/')
        ? MediaType.AUDIO
        : MediaType.DOCUMENT;

  const payload: MediaPostDTO = {
    title: title || localUri.split('/').pop() || 'Upload',
    description,
    mediaUrl,
    mediaType,
    thumbnailUrl,
    fileSize: fileSize ?? (blob.size || undefined),
    duration,
    tags,
    isHighlighted,
    uploadedBy,
    eventId,
  };

  return mediaPostService.createMediaPost(eventId, payload);
}

