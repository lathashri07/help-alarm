/* eslint-disable no-restricted-globals */

self.addEventListener('push', function (event) {
  console.log('[Service Worker] Push Received.');
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      console.warn('[Service Worker] Push data was not JSON: ', event.data.text());
      data = {
        title: '🆘 Emergency Alert!',
        body: event.data.text()
      };
    }
  }

  const title = data.title || '🆘 Emergency Alert!';
  const options = {
    body: data.body || 'Your emergency contact is in danger!',
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    tag: 'emergency-alert',
    requireInteraction: true, // Keep notification open until user clicks it
    vibrate: [200, 100, 200, 100, 200, 100, 400],
    data: data.data || {},
    actions: [
      {
        action: 'open_map',
        title: '🗺️ View Location'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  console.log('[Service Worker] Notification click received.');
  
  event.notification.close();

  // If maps link exists in custom data, open it in a new window/tab
  const mapsLink = event.notification.data?.mapsLink;
  
  if (mapsLink) {
    event.waitUntil(
      // eslint-disable-next-line no-undef
      clients.openWindow(mapsLink)
    );
  }
});
