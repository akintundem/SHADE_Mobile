import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import type {
  Notification,
  NotificationHandler,
  NotificationPermissionStatus,
} from '../types/notification.types';

class NotificationService {
  private handlers: NotificationHandler = {};
  private fcmToken: string | null = null;

  /**
   * Initialize the notification service
   */
  async initialize(handlers?: NotificationHandler): Promise<void> {
    if (handlers) {
      this.handlers = handlers;
    }

    // Request permission
    await this.requestPermission();

    // Get FCM token
    await this.getFCMToken();

    // Set up message handlers
    this.setupMessageHandlers();

    // Handle notification that opened the app from quit state
    this.checkInitialNotification();
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<NotificationPermissionStatus> {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Notification permission granted');
          return 1; // AUTHORIZED
        } else {
          console.log('Notification permission denied');
          return 0; // DENIED
        }
      }

      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        return authStatus;
      }

      return 0; // DENIED
    } catch (error) {
      console.error('Permission request error:', error);
      return 0;
    }
  }

  /**
   * Get the FCM token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      this.fcmToken = token;
      console.log('FCM Token:', token);

      if (this.handlers.onTokenRefresh) {
        this.handlers.onTokenRefresh(token);
      }

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  /**
   * Get the current FCM token
   */
  getCurrentToken(): string | null {
    return this.fcmToken;
  }

  /**
   * Set up message handlers for foreground and background
   */
  private setupMessageHandlers(): void {
    // Handle foreground messages
    messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Foreground notification received:', remoteMessage);

      const notification: Notification = {
        messageId: remoteMessage.messageId,
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
        notification: remoteMessage.notification,
      };

      if (this.handlers.onNotificationReceived) {
        this.handlers.onNotificationReceived(notification);
      }
    });

    // Handle background messages
    messaging().setBackgroundMessageHandler(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Background notification received:', remoteMessage);

      const notification: Notification = {
        messageId: remoteMessage.messageId,
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
        notification: remoteMessage.notification,
      };

      if (this.handlers.onNotificationReceived) {
        this.handlers.onNotificationReceived(notification);
      }
    });

    // Handle notification opened (app opened from notification)
    messaging().onNotificationOpenedApp((remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Notification opened app from background:', remoteMessage);

      const notification: Notification = {
        messageId: remoteMessage.messageId,
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
        notification: remoteMessage.notification,
      };

      if (this.handlers.onNotificationOpened) {
        this.handlers.onNotificationOpened(notification);
      }
    });

    // Handle token refresh
    messaging().onTokenRefresh((token: string) => {
      console.log('FCM Token refreshed:', token);
      this.fcmToken = token;

      if (this.handlers.onTokenRefresh) {
        this.handlers.onTokenRefresh(token);
      }
    });
  }

  /**
   * Check if app was opened from a notification while app was quit
   */
  private async checkInitialNotification(): Promise<void> {
    const remoteMessage = await messaging().getInitialNotification();

    if (remoteMessage) {
      console.log('App opened from quit state by notification:', remoteMessage);

      const notification: Notification = {
        messageId: remoteMessage.messageId,
        title: remoteMessage.notification?.title,
        body: remoteMessage.notification?.body,
        data: remoteMessage.data,
        notification: remoteMessage.notification,
      };

      if (this.handlers.onNotificationOpened) {
        this.handlers.onNotificationOpened(notification);
      }
    }
  }

  /**
   * Subscribe to a topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Error subscribing to topic ${topic}:`, error);
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Error unsubscribing from topic ${topic}:`, error);
    }
  }

  /**
   * Delete the FCM token
   */
  async deleteToken(): Promise<void> {
    try {
      await messaging().deleteToken();
      this.fcmToken = null;
      console.log('FCM token deleted');
    } catch (error) {
      console.error('Error deleting FCM token:', error);
    }
  }

  /**
   * Check notification permission status
   */
  async checkPermission(): Promise<NotificationPermissionStatus> {
    try {
      const authStatus = await messaging().hasPermission();
      return authStatus;
    } catch (error) {
      console.error('Error checking permission:', error);
      return 0;
    }
  }

  /**
   * Get badge count (iOS only)
   */
  async getBadgeCount(): Promise<number> {
    if (Platform.OS === 'ios') {
      try {
        const count = await messaging().getAPNSToken();
        return count ? 0 : 0; // Placeholder - implement actual badge logic
      } catch (error) {
        console.error('Error getting badge count:', error);
        return 0;
      }
    }
    return 0;
  }

  /**
   * Set badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS === 'ios') {
      try {
        // Note: You might need a native module for this
        console.log(`Setting badge count to: ${count}`);
      } catch (error) {
        console.error('Error setting badge count:', error);
      }
    }
  }
}

// Export singleton instance
export default new NotificationService();
