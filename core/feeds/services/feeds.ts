import { http } from '../../../common/services/httpClient';
import {
    FeedPostResponse,
    CreateFeedPostResponse,
    PostListResponse,
    CommentResponse,
    FeedPostCreateRequest,
    FeedPostMediaUploadCompleteRequest,
    CommentCreateRequest,
    CommentUpdateRequest,
    PostListRequest,
    CommentListRequest,
    PaginatedCommentResponse,
    QuotePostRequest,
} from '../types/feeds';

/**
 * Builds query parameters from a PostListRequest object
 * @param request - Optional post list request with pagination
 * @param queryParams - Optional existing URLSearchParams to append to (creates new one if not provided)
 * @returns URLSearchParams with all request parameters appended
 */
function buildPostListQueryParams(
    request?: PostListRequest,
    queryParams: URLSearchParams = new URLSearchParams()
): URLSearchParams {
    if (!request) {
        return queryParams;
    }

    if (request.page !== undefined) {
        queryParams.append('page', request.page.toString());
    }
    if (request.size !== undefined) {
        queryParams.append('size', request.size.toString());
    }

    return queryParams;
}

/**
 * Builds query parameters from a CommentListRequest object
 * @param request - Optional comment list request with pagination
 * @param queryParams - Optional existing URLSearchParams to append to (creates new one if not provided)
 * @returns URLSearchParams with all request parameters appended
 */
function buildCommentListQueryParams(
    request?: CommentListRequest,
    queryParams: URLSearchParams = new URLSearchParams()
): URLSearchParams {
    if (!request) {
        return queryParams;
    }

    if (request.page !== undefined) {
        queryParams.append('page', request.page.toString());
    }
    if (request.size !== undefined) {
        queryParams.append('size', request.size.toString());
    }

    return queryParams;
}

export const feedService = {
    // ==================== POST MANAGEMENT ====================

    /**
     * Create a feed post
     * Creates a post for an event. For IMAGE/VIDEO posts, the API returns a presigned upload;
     * upload to S3 then call the complete endpoint. Posts cannot be edited.
     * @param eventId - Event ID
     * @param request - Create post request with type, content, and optional media upload
     * @returns Created post with optional presigned upload URL
     */
    async createPost(eventId: string, request: FeedPostCreateRequest): Promise<CreateFeedPostResponse> {
        const res = await http.post<CreateFeedPostResponse>(
            `/api/v1/events/${eventId}/posts`,
            request
        );
        return res.data;
    },

    /**
     * Complete post media upload
     * Called after the client uploads to S3 using the presigned URL returned by create().
     * Persists media metadata and makes it available on the post.
     * @param eventId - Event ID
     * @param postId - Post ID
     * @param mediaId - Media ID from presigned upload response
     * @param request - Media upload complete request with S3 object details
     * @returns Updated feed post response
     */
    async completeMediaUpload(
        eventId: string,
        postId: string,
        mediaId: string,
        request: FeedPostMediaUploadCompleteRequest
    ): Promise<FeedPostResponse> {
        const res = await http.post<FeedPostResponse>(
            `/api/v1/events/${eventId}/posts/${postId}/media/${mediaId}/complete`,
            request
        );
        return res.data;
    },

    /**
     * List posts for an event
     * Lists posts for an event. Supports pagination via query parameters.
     * If pagination parameters are provided, returns paginated response.
     * Otherwise, returns all posts (backward compatibility).
     * @param eventId - Event ID
     * @param request - Optional pagination request
     * @returns Paginated post list response or array of posts
     */
    async listPosts(
        eventId: string,
        request?: PostListRequest
    ): Promise<PostListResponse | FeedPostResponse[]> {
        const queryParams = buildPostListQueryParams(request);
        const queryString = queryParams.toString();
        const url = queryString
            ? `/api/v1/events/${eventId}/posts?${queryString}`
            : `/api/v1/events/${eventId}/posts`;

        // If pagination params are provided, return paginated response
        if (request?.page !== undefined || request?.size !== undefined) {
            const res = await http.get<PostListResponse>(url);
            return res.data;
        }
        // Otherwise, return array of posts (backward compatibility)
        const res = await http.get<FeedPostResponse[]>(url);
        return res.data;
    },

    /**
     * Get a specific post
     * Gets a specific feed post by ID.
     * @param eventId - Event ID
     * @param postId - Post ID
     * @returns Feed post response
     */
    async getPost(eventId: string, postId: string): Promise<FeedPostResponse> {
        const res = await http.get<FeedPostResponse>(`/api/v1/events/${eventId}/posts/${postId}`);
        return res.data;
    },

    /**
     * Delete a post
     * Deletes a post (creator or event media-managers).
     * @param eventId - Event ID
     * @param postId - Post ID
     */
    async deletePost(eventId: string, postId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/posts/${postId}`);
    },

    // ==================== POST LIKES ====================

    /**
     * Like a post
     * Likes a feed post. Idempotent - if already liked, no error is thrown.
     * @param eventId - Event ID
     * @param postId - Post ID
     */
    async likePost(eventId: string, postId: string): Promise<void> {
        await http.post(`/api/v1/events/${eventId}/posts/${postId}/like`);
    },

    /**
     * Unlike a post
     * Removes like from a feed post.
     * @param eventId - Event ID
     * @param postId - Post ID
     */
    async unlikePost(eventId: string, postId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/posts/${postId}/like`);
    },

    // ==================== POST COMMENTS ====================

    /**
     * Create a comment on a post
     * Creates a comment on a feed post.
     * @param eventId - Event ID
     * @param postId - Post ID
     * @param request - Comment create request
     * @returns Created comment response
     */
    async createComment(
        eventId: string,
        postId: string,
        request: CommentCreateRequest
    ): Promise<CommentResponse> {
        const res = await http.post<CommentResponse>(
            `/api/v1/events/${eventId}/posts/${postId}/comments`,
            request
        );
        return res.data;
    },

    /**
     * Update a comment
     * Updates a comment (only by the comment creator).
     * @param eventId - Event ID
     * @param postId - Post ID
     * @param commentId - Comment ID
     * @param request - Comment update request
     * @returns Updated comment response
     */
    async updateComment(
        eventId: string,
        postId: string,
        commentId: string,
        request: CommentUpdateRequest
    ): Promise<CommentResponse> {
        const res = await http.put<CommentResponse>(
            `/api/v1/events/${eventId}/posts/${postId}/comments/${commentId}`,
            request
        );
        return res.data;
    },

    /**
     * Delete a comment
     * Deletes a comment (only by the comment creator).
     * @param eventId - Event ID
     * @param postId - Post ID
     * @param commentId - Comment ID
     */
    async deleteComment(eventId: string, postId: string, commentId: string): Promise<void> {
        await http.delete(`/api/v1/events/${eventId}/posts/${postId}/comments/${commentId}`);
    },

    /**
     * Get paginated list of comments for a post
     * Gets paginated list of comments for a post.
     * @param eventId - Event ID
     * @param postId - Post ID
     * @param request - Optional pagination request
     * @returns Paginated comment response
     */
    async getComments(
        eventId: string,
        postId: string,
        request?: CommentListRequest
    ): Promise<PaginatedCommentResponse> {
        const queryParams = buildCommentListQueryParams(request);
        const queryString = queryParams.toString();
        const url = queryString
            ? `/api/v1/events/${eventId}/posts/${postId}/comments?${queryString}`
            : `/api/v1/events/${eventId}/posts/${postId}/comments`;

        const res = await http.get<PaginatedCommentResponse>(url);
        return res.data;
    },

    /**
     * Repost a post
     * Reposts a post to share it with your network.
     * @param eventId - Event ID
     * @param postId - Post ID
     * @returns Reposted post response
     */
    async repost(eventId: string, postId: string): Promise<FeedPostResponse> {
        const res = await http.post<FeedPostResponse>(
            `/api/v1/events/${eventId}/posts/${postId}/repost`
        );
        return res.data;
    },

    /**
     * Quote a post
     * Repost with a comment (quote post).
     * @param eventId - Event ID
     * @param postId - Post ID
     * @param request - Quote post request
     * @returns Quote post response
     */
    async quotePost(
        eventId: string,
        postId: string,
        request: QuotePostRequest
    ): Promise<FeedPostResponse> {
        const res = await http.post<FeedPostResponse>(
            `/api/v1/events/${eventId}/posts/${postId}/quote`,
            request
        );
        return res.data;
    },
};
