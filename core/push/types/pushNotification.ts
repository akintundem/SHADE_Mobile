/**
 * Push notification related types
 */

// ==================== Enums ====================

export enum Platform {
    IOS = 'IOS',
    ANDROID = 'ANDROID',
}

// ==================== Device Token Response Types ====================

/**
 * Device token response.
 * Represents a registered device token for push notifications.
 */
export type DeviceTokenResponse = {
    id: string; // UUID
    userId: string; // UUID - User account ID
    deviceToken: string; // FCM token or similar push notification token
    platform: Platform; // Device platform (IOS, ANDROID)
    deviceId?: string | null;
    appVersion?: string | null;
    isActive?: boolean | null;
    lastUsedAt?: string | null; // ISO datetime
    invalidatedAt?: string | null; // ISO datetime
    failureCount?: number | null;
    lastFailureAt?: string | null; // ISO datetime
    lastFailureReason?: string | null;
    createdAt?: string | null; // ISO datetime
    updatedAt?: string | null; // ISO datetime
};

// ==================== Device Token Request Types ====================

/**
 * Request to register or update a device token for push notifications.
 */
export type RegisterDeviceTokenRequest = {
    userId?: string; // UUID - optional, server enforces authenticated user
    deviceToken: string; // Required - FCM token or similar push notification token
    platform: Platform; // Required device platform (IOS, ANDROID)
    deviceId?: string | null; // Device identifier
    appVersion?: string | null; // App version
};

/**
 * Request to refresh an existing device token with a new token value.
 * Useful when tokens expire or are regenerated.
 */
export type RefreshDeviceTokenRequest = {
    userId: string; // UUID
    deviceToken: string; // Required - New device token to refresh
    platform?: Platform | null; // Device platform (IOS, ANDROID)
    deviceId?: string | null; // Device identifier
    appVersion?: string | null; // App version
    oldDeviceToken?: string | null; // Old device token to replace (optional, if not provided, will refresh most recent active token)
};

// ==================== Notification Payload Types ====================

/**
 * Represents the data payload delivered with a push notification.
 * Use the `type` field to route in-app behavior.
 */
export type PushNotificationDataPayload = {
    eventId: string;
    eventName?: string;
    changeSummary?: string;
    type: 'event_updated' | 'event_reminder' | 'task_assignment' | string;
};
