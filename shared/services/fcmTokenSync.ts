import AsyncStorage from '@react-native-async-storage/async-storage';
import notificationService from './notificationService';
import {Platform} from 'react-native';
import config from '../../dev-config.json';

const FCM_TOKEN_KEY = '@fcm_token';
const TOKEN_SYNCED_KEY = '@fcm_token_synced';

class FCMTokenSync {
  private syncInProgress = false;

  async syncTokenWithBackend(authToken: string): Promise<void> {
    if (this.syncInProgress) return;

    try {
      this.syncInProgress = true;

      const fcmToken = await notificationService.getFCMToken();
      if (!fcmToken) {
        console.log('No FCM token available yet');
        return;
      }

      // Clean token (remove fcm: prefix if present)
      const cleanToken = fcmToken.startsWith('fcm:')
        ? fcmToken.substring(4)
        : fcmToken;

      const lastSyncedToken = await AsyncStorage.getItem(TOKEN_SYNCED_KEY);

      if (lastSyncedToken === cleanToken) {
        return;
      }

      const response = await fetch(
        `${config.apiBaseUrl}/api/notifications/register-token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            token: cleanToken,
            platform: Platform.OS,
            deviceInfo: {
              os: Platform.OS,
              version: Platform.Version,
            },
          }),
        },
      );

      if (response.ok) {
        await AsyncStorage.setItem(TOKEN_SYNCED_KEY, cleanToken);
        await AsyncStorage.setItem(FCM_TOKEN_KEY, cleanToken);
        console.log('FCM token synced with backend');
      } else {
        const error = await response.text();
        console.error('Failed to sync FCM token:', error);
      }
    } catch (error) {
      console.error('Error syncing FCM token:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(FCM_TOKEN_KEY);
    await AsyncStorage.removeItem(TOKEN_SYNCED_KEY);
  }

  async getStoredToken(): Promise<string | null> {
    return AsyncStorage.getItem(FCM_TOKEN_KEY);
  }
}

export default new FCMTokenSync();
