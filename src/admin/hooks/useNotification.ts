import { useState, useCallback } from 'react';

interface NotificationState {
  type: 'success' | 'error';
  message: string;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification
  };
};