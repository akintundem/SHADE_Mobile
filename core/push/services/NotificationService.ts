import { getApp } from '@react-native-firebase/app';
import { getMessaging, AuthorizationStatus, FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { Platform as RNPlatform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import { pushNotificationService } from './pushNotificationService';
import {
  Platform as PushPlatform,
  RegisterDeviceTokenRequest,
  RefreshDeviceTokenRequest,
  PushNotificationDataPayload,
} from '../types/pushNotification';

class NotificationService {
  private static tokenRefreshUnsubscribe: (() => void) | null = null;
  private static foregroundUnsubscribe: (() => void) | null = null;
  private static currentToken: string | null = null;
  private static currentUserId: string | null = null;
  private static channelReady = false;

  private static getMessagingInstance() {
    const app = getApp();
    return getMessaging(app);
  }

  private static resolvePlatform(platform?: PushPlatform | null): PushPlatform {
    if (platform) return platform;
    if (RNPlatform.OS === 'ios') return PushPlatform.IOS;
    if (RNPlatform.OS === 'android') return PushPlatform.ANDROID;
    return PushPlatform.ANDROID;
  }

  private static buildRegisterPayload(
    userId: string,
    deviceToken: string,
    metadata?: Partial<RegisterDeviceTokenRequest>,
  ): RegisterDeviceTokenRequest {
    return {
      userId,
      deviceToken,
      platform: this.resolvePlatform(metadata?.platform ?? null),
      deviceId: metadata?.deviceId ?? null,
      appVersion: metadata?.appVersion ?? null,
    };
  }

  private static buildRefreshPayload(
    userId: string,
    deviceToken: string,
    oldDeviceToken?: string | null,
    metadata?: Partial<RegisterDeviceTokenRequest>,
  ): RefreshDeviceTokenRequest {
    return {
      userId,
      deviceToken,
      oldDeviceToken: oldDeviceToken ?? undefined,
      platform: this.resolvePlatform(metadata?.platform ?? null),
      deviceId: metadata?.deviceId ?? null,
      appVersion: metadata?.appVersion ?? null,
    };
  }

  static async requestPermission(): Promise<boolean> {
    try {
      const messaging = this.getMessagingInstance();
      const authStatus = await messaging.requestPermission();
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      return enabled;
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  static async getFcmToken(): Promise<string | null> {
    try {
      const messaging = this.getMessagingInstance();
      const token = await messaging.getToken();
      this.currentToken = token;
      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  static async onMessageListener() {
    const messaging = this.getMessagingInstance();
    if (this.foregroundUnsubscribe) {
      this.foregroundUnsubscribe();
    }
    this.foregroundUnsubscribe = messaging.onMessage(this.handleForegroundMessage);
    return this.foregroundUnsubscribe;
  }

  private static handleForegroundMessage = async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    try {
      const dataPayload = (remoteMessage.data ?? {}) as Partial<PushNotificationDataPayload>;
      const titleFromData = dataPayload.eventName;
      const bodyFromData = dataPayload.changeSummary || dataPayload.type;

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || titleFromData || 'Update available',
        body: remoteMessage.notification?.body || bodyFromData || '',
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
        },
        data: remoteMessage.data,
      });
    } catch (error) {
      console.error('Error displaying foreground notification:', error);
    }
  };

  static async setupNotifeeChannel() {
    if (this.channelReady) {
      return;
    }

    await notifee.createChannel({
      id: 'default',
      name: 'Default Channel',
      importance: AndroidImportance.HIGH,
    });

    this.channelReady = true;
  }

  static async registerDeviceForPush(
    userId: string,
    metadata?: Partial<RegisterDeviceTokenRequest>,
  ): Promise<string | null> {
    if (this.currentUserId === userId && this.currentToken) {
      return this.currentToken;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn('Push permission not granted; skipping device registration');
      return null;
    }

    await this.setupNotifeeChannel();

    let token = await this.getFcmToken();
    if (!token) {
      return null;
    }

    let registeredToken = token;
    const payload = this.buildRegisterPayload(userId, token, metadata);

    try {
      await pushNotificationService.registerDeviceToken(payload);
    } catch (error: any) {
      const status = error?.status ?? error?.response?.status;
      if (status === 400 || status === 401) {
        await this.clearDeviceRegistration();
        token = await this.getFcmToken();
        if (!token) {
          throw error;
        }
        registeredToken = token;
        await pushNotificationService.registerDeviceToken(
          this.buildRegisterPayload(userId, registeredToken, metadata),
        );
      } else {
        throw error;
      }
    }

    this.currentToken = registeredToken;
    this.currentUserId = userId;

    const messaging = this.getMessagingInstance();
    if (this.tokenRefreshUnsubscribe) {
      this.tokenRefreshUnsubscribe();
    }
    this.tokenRefreshUnsubscribe = messaging.onTokenRefresh(async (newToken) => {
      try {
        const refreshPayload = this.buildRefreshPayload(userId, newToken, this.currentToken, metadata);
        await pushNotificationService.refreshDeviceToken(refreshPayload);
        this.currentToken = newToken;
      } catch (error) {
        console.warn('Failed to refresh device token; will retry on next refresh event', error);
      }
    });

    return registeredToken;
  }

  static async clearDeviceRegistration() {
    if (this.tokenRefreshUnsubscribe) {
      this.tokenRefreshUnsubscribe();
      this.tokenRefreshUnsubscribe = null;
    }

    this.currentToken = null;
    this.currentUserId = null;

    try {
      const messaging = this.getMessagingInstance();
      await messaging.deleteToken();
    } catch (error) {
      console.warn('Failed to delete FCM token during cleanup:', error);
    }
  }
}

export default NotificationService;
