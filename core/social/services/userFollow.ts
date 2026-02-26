import { http } from '../../../common/services/httpClient';
import {
    FollowStatusResponse,
    FollowStatsResponse,
    PaginatedUserProfileResponse,
    ListFollowersRequest,
    ListFollowingRequest,
} from '../types/userFollow';

export const userFollowService = {
    /**
     * Follow a user
     * Start following another user to see their events in your following feed.
     * @param userId - User ID to follow
     */
    async followUser(userId: string): Promise<void> {
        await http.post(`/api/v1/users/${userId}/follow`);
    },

    /**
     * Unfollow a user
     * Stop following a user.
     * @param userId - User ID to unfollow
     */
    async unfollowUser(userId: string): Promise<void> {
        await http.delete(`/api/v1/users/${userId}/follow`);
    },

    /**
     * Get follow status between current user and another user
     * Check if you are following a user and if they follow you.
     * @param userId - User ID to check status with
     * @returns Follow status response
     */
    async getFollowStatus(userId: string): Promise<FollowStatusResponse> {
        const res = await http.get<FollowStatusResponse>(
            `/api/v1/users/${userId}/follow-status`
        );
        return res.data;
    },

    /**
     * Get user's following list
     * Get the list of users that a user follows.
     * @param userId - User ID
     * @param request - Optional pagination and filters
     * @returns Paginated list of user profiles
     */
    async getFollowing(
        userId: string,
        request?: ListFollowingRequest
    ): Promise<PaginatedUserProfileResponse> {
        const params = new URLSearchParams();

        if (request?.page !== undefined && request?.page !== null) {
            params.append('page', String(request.page));
        }
        if (request?.size !== undefined && request?.size !== null) {
            params.append('size', String(request.size));
        }

        const queryString = params.toString();
        const url = queryString
            ? `/api/v1/users/${userId}/following?${queryString}`
            : `/api/v1/users/${userId}/following`;

        const res = await http.get<PaginatedUserProfileResponse>(url);
        return res.data;
    },

    /**
     * Get user's followers list
     * Get the list of users that follow a user.
     * @param userId - User ID
     * @param request - Optional pagination and filters
     * @returns Paginated list of user profiles
     */
    async getFollowers(
        userId: string,
        request?: ListFollowersRequest
    ): Promise<PaginatedUserProfileResponse> {
        const params = new URLSearchParams();

        if (request?.page !== undefined && request?.page !== null) {
            params.append('page', String(request.page));
        }
        if (request?.size !== undefined && request?.size !== null) {
            params.append('size', String(request.size));
        }

        const queryString = params.toString();
        const url = queryString
            ? `/api/v1/users/${userId}/followers?${queryString}`
            : `/api/v1/users/${userId}/followers`;

        const res = await http.get<PaginatedUserProfileResponse>(url);
        return res.data;
    },

    /**
     * Get follow statistics for a user
     * Get follower and following counts.
     * @param userId - User ID
     * @returns Follow stats response
     */
    async getFollowStats(userId: string): Promise<FollowStatsResponse> {
        const res = await http.get<FollowStatsResponse>(
            `/api/v1/users/${userId}/follow-stats`
        );
        return res.data;
    },
};
