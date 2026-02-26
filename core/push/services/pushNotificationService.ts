import { http } from '../../../common/services/httpClient';
import {
    DeviceTokenResponse,
    RegisterDeviceTokenRequest,
    RefreshDeviceTokenRequest,
} from '../types/pushNotification';

const RETRY_DELAYS_MS = [500, 1000, 2000];

async function postWithBackoff<T>(url: string, body: unknown): Promise<T> {
    let lastError: unknown;

    for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
        try {
            const res = await http.post<T>(url, body);
            return res.data;
        } catch (error: any) {
            const status = error?.status ?? error?.response?.status;
            const isServerError = typeof status === 'number' && status >= 500;

            // For auth/validation issues (400/401), bubble up so the caller can re-auth and retry with a fresh token.
            if (!isServerError) {
                throw error;
            }

            lastError = error;
            if (attempt === RETRY_DELAYS_MS.length) {
                break;
            }

            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt]));
        }
    }

    throw lastError;
}

export const pushNotificationService = {
    // ==================== DEVICE TOKEN MANAGEMENT ====================

    /**
     * Register or update device token
     * Register a new device token or update an existing one for push notifications.
     * The caller must supply the authenticated user's ID and device token from the provider.
     * @param request - Register device token request
     * @returns Device token response
     */
    async registerDeviceToken(request: RegisterDeviceTokenRequest): Promise<DeviceTokenResponse> {
        return postWithBackoff<DeviceTokenResponse>(
            '/api/v1/push-notifications/devices/register',
            request,
        );
    },

    /**
     * Refresh device token
     * Refresh an existing device token with a new token value.
     * Useful when tokens expire or are regenerated.
     * The caller must supply the authenticated user's ID, new token, and optionally the old token.
     * @param request - Refresh device token request
     * @returns Device token response
     */
    async refreshDeviceToken(request: RefreshDeviceTokenRequest): Promise<DeviceTokenResponse> {
        return postWithBackoff<DeviceTokenResponse>(
            '/api/v1/push-notifications/refresh-device-token',
            request,
        );
    },
};
