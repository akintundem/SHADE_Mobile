/**
 * User Following types
 *
 * For following/unfollowing users and getting follower/following lists.
 */

// ==================== Response Types ====================

export type FollowStatusResponse = {
    userId: string; // UUID
    isFollowing?: boolean | null;
    isFollowedBy?: boolean | null; // Whether the other user follows the current user
    isMutual?: boolean | null; // Whether both users follow each other
};

export type FollowStatsResponse = {
    userId: string; // UUID
    followingCount: number; // Number of users this user follows
    followersCount: number; // Number of users following this user
};

// ==================== User Profile Response ====================

export type UserProfileResponse = {
    id: string; // UUID
    name?: string | null;
    email?: string | null;
    profilePictureUrl?: string | null;
    isFollowing?: boolean | null; // Whether current user follows this user
    isFollowedBy?: boolean | null; // Whether this user follows current user
    isMutual?: boolean | null;
};

// ==================== Paginated Response ====================

export type PaginatedUserProfileResponse = {
    content: UserProfileResponse[];
    pageable?: Record<string, unknown>;
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
};

// ==================== List Request ====================

export type ListFollowersRequest = {
    page?: number; // Default: 0
    size?: number; // Default: 20, max: 100
};

export type ListFollowingRequest = {
    page?: number; // Default: 0
    size?: number; // Default: 20, max: 100
};
