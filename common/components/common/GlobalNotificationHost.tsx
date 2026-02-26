import React, { useEffect, useState } from 'react';
import NotificationModal, { NotificationInfo } from './NotificationModal';
import { subscribeToNotifications } from '../../utils/notificationBus';

/**
 * Listens for published notifications and renders a single modal.
 * This avoids native alerts while keeping UX consistent.
 */
export function GlobalNotificationHost() {
  const [notification, setNotification] = useState<NotificationInfo | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToNotifications(setNotification);
    return unsubscribe;
  }, []);

  return (
    <NotificationModal
      visible={!!notification}
      notification={notification}
      onClose={() => setNotification(null)}
    />
  );
}

export default GlobalNotificationHost;
