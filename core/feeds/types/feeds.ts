/**
 * Feed related types
 */

// Base Enums
export enum PostType {
    TEXT = 'TEXT',
    IMAGE = 'IMAGE',
    VIDEO = 'VIDEO',
  }
  
  // Feed Post Response Types
export type FeedPostResponse = {
    id: string; // UUID
    eventId: string; // UUID
    type: PostType; // Post type: TEXT, IMAGE, or VIDEO
    content?: string | null; // Text content (for TEXT posts or caption)
    mediaObjectId?: string | null; // UUID - Stored object id for media (if present)
    mediaUrl?: string | null; // Presigned download URL for media (if present)
    createdBy?: string | null; // UUID - User ID who created the post
    authorName?: string | null; // Author name
    authorAvatarUrl?: string | null; // Author avatar URL
    likeCount?: number | null; // Number of likes
    commentCount?: number | null; // Number of comments
    isLiked?: boolean | null; // Whether the current user has liked this post
    repostCount?: number | null; // Number of reposts
    repostedFromId?: string | null; // UUID - original post ID when reposted
    quoteText?: string | null; // Quote text for quote posts
    originalPost?: OriginalPost | null; // Original post details for reposts
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
  };

  export type OriginalPost = {
    id: string; // UUID
    authorId?: string | null;
    authorName?: string | null;
    authorAvatarUrl?: string | null;
    type?: string | null;
    content?: string | null;
    mediaUrl?: string | null;
    createdAt?: string | null; // ISO datetime
  };
  
  // Presigned Upload Response Types
  export type PresignedUploadResponse = {
    mediaId: string; // UUID - identifier that should be referenced once upload completes
    objectKey: string; // S3 object key that will be created
    uploadMethod: string; // HTTP method to use when uploading (e.g., "PUT")
    uploadUrl: string; // URL to upload the media/asset to
    headers: Record<string, string>; // Headers that must be included when uploading
    resourceUrl: string; // URL where the media will be accessible after processing
    expiresAt: string; // ISO datetime - expiration timestamp for the presigned request
  };
  
  // Create Feed Post Response Types
  export type CreateFeedPostResponse = {
    post: FeedPostResponse; // Created post details
    mediaUpload?: PresignedUploadResponse | null; // Presigned upload details (null for TEXT posts)
  };
  
  // Post List Response Types
  export type PostListResponse = {
    posts?: FeedPostResponse[] | null; // List of posts
    currentPage?: number | null; // Current page number (0-indexed)
    pageSize?: number | null; // Page size
    totalPosts?: number | null; // Total number of posts
    totalPages?: number | null; // Total number of pages
    hasNext?: boolean | null; // Whether there is a next page
    hasPrevious?: boolean | null; // Whether there is a previous page
  };
  
  // Comment Response Types
  export type CommentResponse = {
    id: string; // UUID
    postId: string; // UUID
    content: string; // Comment content
    userId?: string | null; // UUID - User ID who created the comment
    authorName?: string | null; // Author name
    authorAvatarUrl?: string | null; // Author avatar URL
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
  };
  
  // Feed Post Request Types
  export type FeedPostCreateRequest = {
    type: PostType; // Required, post type: TEXT, IMAGE, or VIDEO
    content?: string | null; // Text content (for TEXT posts or caption)
    mediaUpload?: FeedPostMediaUploadRequest | null; // Media upload request (required for IMAGE/VIDEO)
  };
  
  export type FeedPostMediaUploadRequest = {
    fileName: string; // Required, max 255 characters
    contentType: string; // Required, MIME type (e.g., "image/jpeg"), max 255 characters
    isPublic?: boolean | null; // Whether the underlying object should be marked public (usually false), default: false
    description?: string | null; // Optional description
  };
  
export type FeedPostMediaUploadCompleteRequest = {
    objectKey: string; // Required, S3 object key, max 512 characters
    resourceUrl?: string | null; // Non-presigned resource URL, max 2048 characters
    fileName: string; // Required, original file name, max 255 characters
    contentType: string; // Required, MIME content type, max 255 characters
    isPublic?: boolean | null; // Whether object is public (usually false), default: false
    description?: string | null; // Optional description
    tags?: string | null; // Optional tags
    metadata?: string | null; // Optional metadata JSON string
  };
  
  // Comment Request Types
  export type CommentCreateRequest = {
    content: string; // Required, comment content, max 2000 characters
  };
  
  export type CommentUpdateRequest = {
    content: string; // Required, updated comment content, max 2000 characters
  };

  // Quote Post Request Types
  export type QuotePostRequest = {
    quoteText: string; // Required, max 2000 characters
  };
  
  // Paginated Response Types
  export type PaginatedCommentResponse = {
    content: CommentResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
  };
  
  // Post List Request Types (for pagination)
  export type PostListRequest = {
    page?: number; // Page number (0-indexed)
    size?: number; // Page size (max 100)
  };
  
  // Comment List Request Types (for pagination)
  export type CommentListRequest = {
    page?: number; // Page number (0-indexed), default: 0
    size?: number; // Page size, default: 20
  };
