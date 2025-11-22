import { useEffect, useState } from 'react';
import notificationService from '../services/notificationService';
import type { NotificationPermissionStatus } from '../types/notification.types';

/**
 * Hook to manage push notifications
 */
export const useNotifications = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus | null>(null);

  useEffect(() => {
    // Get current token
    const token = notificationService.getCurrentToken();
    setFcmToken(token);

    // Check permission status
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const status = await notificationService.checkPermission();
    setPermissionStatus(status);
  };

  const requestPermission = async () => {
    const status = await notificationService.requestPermission();
    setPermissionStatus(status);
    return status;
  };

  const subscribeToTopic = async (topic: string) => {
    await notificationService.subscribeToTopic(topic);
  };

  const unsubscribeFromTopic = async (topic: string) => {
    await notificationService.unsubscribeFromTopic(topic);
  };

  const deleteToken = async () => {
    await notificationService.deleteToken();
    setFcmToken(null);
  };

  return {
    fcmToken,
    permissionStatus,
    requestPermission,
    checkPermission,
    subscribeToTopic,
    unsubscribeFromTopic,
    deleteToken,
  };
};
