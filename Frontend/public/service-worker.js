// Service Worker for push notifications
// This file handles background notifications even when the user is not on the website

self.addEventListener('push', event => {
  if (!event.data) {
    console.log('Push notification received but no data');
    return;
  }

  let notificationData = {
    title: 'Duwaz needs your attention',
    body: 'You have something that needs your attention.',
    icon: '/duwaz-icon.png',
    badge: '/duwaz-badge.png',
    tag: 'duwaz-notification',
    requireInteraction: true,
    vibrate: [500, 180, 500, 180, 900],
  };

  try {
    const data = event.data.json();
    notificationData = {
      ...notificationData,
      title: data.title || notificationData.title,
      body: data.body || notificationData.body,
      tag: data.tag || notificationData.tag,
      data: data.data || {},
    };
  } catch (err) {
    // If data is not JSON, treat as plain text
    notificationData.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag,
      requireInteraction: notificationData.requireInteraction,
      vibrate: notificationData.vibrate || [500, 180, 500, 180, 900],
      data: notificationData.data,
    })
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const notificationData = event.notification.data || {};
  let urlToOpen = '/';

  // Route based on notification type
  if (notificationData.type === 'order') {
    urlToOpen = `/order/${notificationData.orderId}/track`;
  } else if (notificationData.type === 'message') {
    urlToOpen = `/admin`; // Messages page (admin/shop owner)
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Check if a window already exists
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', event => {
  console.log('Notification closed:', event.notification.tag);
});
