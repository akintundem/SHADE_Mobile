import type {FirebaseMessagingTypes} from '@react-native-firebase/messaging';

export interface NotificationData {
  [key: string]: string;
}

export interface Notification {
  messageId?: string;
  title?: string;
  body?: string;
  data?: NotificationData;
  notification?: FirebaseMessagingTypes.Notification;
}

export interface NotificationHandler {
  onNotificationReceived?: (notification: Notification) => void;
  onNotificationOpened?: (notification: Notification) => void;
  onTokenRefresh?: (token: string) => void;
}

export enum NotificationPermissionStatus {
  AUTHORIZED = 1,
  DENIED = 0,
  NOT_DETERMINED = -1,
  PROVISIONAL = 2,
}
