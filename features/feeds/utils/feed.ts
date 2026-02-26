import { dateUtils } from '../../../common/utils/helpers';
import { looksLikeId } from '../../../common/utils/idUtils';
import { getImageUrl } from '../../../config/appConfig';
import type { FeedPost } from '../../../core/events/types/event';
import type { FeedPostResponse } from '../../../core/feeds/types/feeds';
import type { MediaItem, ThreadPost } from '../types';

export const FALLBACK_AVATAR = 'https://i.pravatar.cc/150?img=1';

export const formatPostTimestamp = (dateString?: string | null): string => {
  if (!dateString) return 'now';
  const postedDate = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - postedDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return dateUtils.formatDate(dateString, 'MMM d');
};

export const getHandleFromName = (name?: string | null): string => {
  if (!name) return 'anonymous';
  if (looksLikeId(name)) return 'anonymous';
  return name.toLowerCase().replace(/\s+/g, '').substring(0, 15);
};

const authorDisplayName = (authorName?: string | null): string => {
  if (!authorName || !authorName.trim()) return 'Anonymous';
  if (looksLikeId(authorName)) return 'Anonymous';
  return authorName.trim();
};

type FeedPostLike = FeedPost | FeedPostResponse;

const resolvePostType = (feedPost: FeedPostLike): string => feedPost.type ?? 'TEXT';

const resolveLikes = (feedPost: FeedPostLike): number => {
  if ('likeCount' in feedPost) {
    return feedPost.likeCount ?? 0;
  }
  return feedPost.likes ?? 0;
};

const resolveComments = (feedPost: FeedPostLike): number => {
  if ('commentCount' in feedPost) {
    return feedPost.commentCount ?? 0;
  }
  return feedPost.comments ?? 0;
};

const resolveReposts = (feedPost: FeedPostLike): number => {
  if ('repostCount' in feedPost) {
    return feedPost.repostCount ?? 0;
  }
  return 0;
};

const resolveTimestamp = (feedPost: FeedPostLike): string | null | undefined => {
  if ('createdAt' in feedPost) {
    return feedPost.createdAt ?? null;
  }
  return feedPost.postedAt ?? null;
};

export const convertFeedPostToThreadPost = (feedPost: FeedPostLike): ThreadPost => {
  const postType = resolvePostType(feedPost);
  const name = authorDisplayName(feedPost.authorName);
  const avatar = getImageUrl(feedPost.authorAvatarUrl) || FALLBACK_AVATAR;
  const photoUrl = postType === 'IMAGE' && feedPost.mediaUrl ? getImageUrl(feedPost.mediaUrl) : undefined;
  const videoUrl = postType === 'VIDEO' && feedPost.mediaUrl ? getImageUrl(feedPost.mediaUrl) : undefined;
  return {
    id: feedPost.id,
    user: {
      name,
      handle: getHandleFromName(feedPost.authorName),
      avatar,
      verified: false,
    },
    timestamp: formatPostTimestamp(resolveTimestamp(feedPost)),
    text: feedPost.content || undefined,
    photos: photoUrl ? [photoUrl] : undefined,
    video: videoUrl,
    comments: resolveComments(feedPost),
    reposts: resolveReposts(feedPost),
    likes: resolveLikes(feedPost),
  };
};

export const buildMediaItems = (posts: FeedPost[]): MediaItem[] => {
  return posts
    .map(post => {
      const rawUrl = post.mediaUrl || post.thumbnailUrl;
      const rawThumb = post.thumbnailUrl || post.mediaUrl;
      const url = rawUrl ? getImageUrl(rawUrl) ?? rawUrl : undefined;
      const thumbnailUrl = rawThumb ? getImageUrl(rawThumb) ?? rawThumb : undefined;
      return { id: post.id, type: post.type, url, thumbnailUrl };
    })
    .filter(item => item.url);
};

export const mergePostsById = (existing: FeedPost[], incoming: FeedPost[]): FeedPost[] => {
  if (existing.length === 0) return incoming;
  const seen = new Map<string, FeedPost>();
  for (const post of existing) {
    seen.set(post.id, post);
  }
  for (const post of incoming) {
    seen.set(post.id, post);
  }
  return Array.from(seen.values());
};
