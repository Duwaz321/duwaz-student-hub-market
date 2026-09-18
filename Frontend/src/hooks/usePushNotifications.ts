import { useEffect, useState } from 'react';

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  requireInteraction?: boolean;
}

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Check browser support and register service worker
  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsSupported(supported);

      if (supported) {
        try {
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/',
          });
          console.log('Service Worker registered:', registration);

          // Check if already subscribed
          const sub = await registration.pushManager.getSubscription();
          setSubscription(sub);
          setIsSubscribed(!!sub);
        } catch (err) {
          console.error('Failed to register service worker:', err);
        }
      }
    };

    checkSupport();
  }, []);

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (err) {
      console.error('Failed to request notification permission:', err);
      return false;
    }
  };

  // Subscribe to push notifications
  const subscribeToPushNotifications = async (): Promise<boolean> => {
    if (!isSupported) {
      console.warn('Push notifications not supported');
      return false;
    }

    try {
      const permission = await requestPermission();
      if (permission !== true) {
        console.warn('Notification permission denied');
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // Note: applicationServerKey should be set when using VAPID
        // For now, we'll skip it and handle notifications server-side
      });

      setSubscription(subscription);
      setIsSubscribed(true);
      console.log('Subscribed to push notifications:', subscription);

      // Send subscription to backend
      await sendSubscriptionToBackend(subscription);
      return true;
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      return false;
    }
  };

  // Unsubscribe from push notifications
  const unsubscribeFromPushNotifications = async (): Promise<boolean> => {
    if (!subscription) return false;

    try {
      const success = await subscription.unsubscribe();
      if (success) {
        setSubscription(null);
        setIsSubscribed(false);
        await removeSubscriptionFromBackend(subscription);
      }
      return success;
    } catch (err) {
      console.error('Failed to unsubscribe from push notifications:', err);
      return false;
    }
  };

  // Show local notification (for testing or when not using push service)
  const showNotification = async (options: PushNotificationOptions): Promise<void> => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return;
    }

    const permission = await requestPermission();
    if (permission !== true) {
      console.warn('Notification permission denied');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(options.title, {
        body: options.body,
        icon: options.icon || '/duwaz-icon.png',
        badge: options.badge || '/duwaz-badge.png',
        tag: options.tag || 'duwaz-notification',
        requireInteraction: options.requireInteraction || false,
        data: options.data || {},
      });
    } catch (err) {
      console.error('Failed to show notification:', err);
    }
  };

  // Send subscription endpoint to backend
  const sendSubscriptionToBackend = async (sub: PushSubscription): Promise<void> => {
    try {
      const token = localStorage.getItem('duwaz_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notifications/subscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: {
              p256dh: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('p256dh') || []))),
              auth: btoa(String.fromCharCode(...new Uint8Array(sub.getKey('auth') || []))),
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to send subscription: ${response.status}`);
      }

      console.log('Subscription sent to backend');
    } catch (err) {
      console.error('Failed to send subscription to backend:', err);
    }
  };

  // Remove subscription from backend
  const removeSubscriptionFromBackend = async (sub: PushSubscription): Promise<void> => {
    try {
      const token = localStorage.getItem('duwaz_token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/notifications/unsubscribe`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            endpoint: sub.endpoint,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to remove subscription: ${response.status}`);
      }

      console.log('Subscription removed from backend');
    } catch (err) {
      console.error('Failed to remove subscription from backend:', err);
    }
  };

  return {
    isSupported,
    isSubscribed,
    subscription,
    requestPermission,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    showNotification,
  };
};
