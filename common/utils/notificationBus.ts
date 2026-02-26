import { NotificationInfo } from '../components/common/NotificationModal';

export type NotificationListener = (notification: NotificationInfo) => void;

const listeners = new Set<NotificationListener>();

export function subscribeToNotifications(listener: NotificationListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publishNotification(notification: NotificationInfo) {
  listeners.forEach(listener => {
    try {
      listener(notification);
    } catch (error) {
      if (__DEV__) console.warn('Notification listener failed', error);
    }
  });
}
