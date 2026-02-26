import { dateUtils } from '../../../common/utils/helpers';
import { looksLikeId } from '../../../common/utils/idUtils';
import { DATE_FORMATS } from '../../../common/utils/constants';
import type { EventResponse } from '../../../core/events/types';
import { PostType } from '../../../core/feeds/types/feeds';
import type { FeedPostResponse } from '../../../core/feeds/types/feeds';
export const DEFAULT_AVATAR = 'https://i.pravatar.cc/150?img=1';

const sanitizeHandle = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^a-z0-9_\.]/g, '')
    .slice(0, 18);
};

/** Minimal user shape for display name (ProfileUser, UserProfileResponse, etc.) */
type UserWithDisplay = { name?: string | null; username?: string | null; email?: string | null };

/**
 * Display name for profiles: prefer real name; never show Auth0/subject ids.
 * Falls back to email prefix then "Member".
 */
export const getDisplayNameFromUser = (user?: UserWithDisplay | null, fallbackLabel = 'Member'): string => {
  if (!user) return fallbackLabel;
  if (user.name && user.name.trim() && !looksLikeId(user.name)) return user.name.trim();
  if (user.username && user.username.trim() && !looksLikeId(user.username)) return user.username.trim();
  if (user.email) {
    const prefix = user.email.split('@')[0]?.trim();
    if (prefix && !looksLikeId(prefix)) return prefix;
  }
  return fallbackLabel;
};

/**
 * Handle for @mention: prefer username/name; never show Auth0 ids.
 */
export const getHandleFromUser = (user?: UserWithDisplay | null): string => {
  if (!user) return 'member';
  if (user.username && user.username.trim() && !looksLikeId(user.username)) return sanitizeHandle(user.username);
  if (user.name && user.name.trim() && !looksLikeId(user.name)) return sanitizeHandle(user.name);
  if (user.email) return sanitizeHandle(user.email.split('@')[0] ?? user.email);
  return 'member';
};

export const formatEventDate = (dateString?: string | null): string => {
  if (!dateString) return '';
  return dateUtils.formatDate(dateString, DATE_FORMATS.DISPLAY_DATE);
};

export const formatEventLocation = (event: EventResponse, fallbackLabel: string): string => {
  const venue = event.venue;
  if (venue) {
    const parts = [venue.city, venue.state, venue.country].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(', ');
    }
    if (venue.address) {
      return venue.address;
    }
  }
  return fallbackLabel;
};

export const getEventStatus = (
  event: EventResponse,
  upcomingLabel: string,
  completedLabel: string
): string => {
  if (!event.endDateTime) return upcomingLabel;
  const endDate = new Date(event.endDateTime);
  return endDate < new Date() ? completedLabel : upcomingLabel;
};

export const getPostPreview = (post: FeedPostResponse): string => {
  if (post.content) {
    return post.content;
  }
  switch (post.type) {
    case PostType.IMAGE:
      return 'Photo post';
    case PostType.VIDEO:
      return 'Video post';
    default:
      return 'Post';
  }
};
