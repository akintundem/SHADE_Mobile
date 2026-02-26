import type { EventFeedResponse, FeedPost, UserEventContext } from '../../../core/events/types/event';

export type FeedPostType = 'VIDEO' | 'IMAGE' | 'TEXT';
export type FeedFilter = FeedPostType | 'ALL';

export type FeedOverlay = 'COMPOSE' | 'THREAD';

export type EventFeedMeta = Pick<
  EventFeedResponse,
  | 'eventId'
  | 'eventName'
  | 'description'
  | 'coverImageUrl'
  | 'startDateTime'
  | 'endDateTime'
  | 'hashtag'
  | 'eventWebsiteUrl'
  | 'accessType'
  | 'userContext'
  | 'feedsPublicAfterEvent'
>;

export type FeedPermissions = {
  canView: boolean;
  canUpload: boolean;
  userContext?: UserEventContext | null;
};

export type ThreadPost = {
  id: string;
  user: { name: string; handle: string; avatar: string; verified?: boolean };
  timestamp: string;
  text?: string;
  photos?: string[];
  video?: string;
  comments?: number;
  reposts?: number;
  likes?: number;
};

export type MediaItem = {
  id: string;
  type?: string | null;
  url?: string | null;
  thumbnailUrl?: string | null;
};

export type FeedPostModel = FeedPost;
