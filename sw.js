// sw.js — Service Worker Votum Push Notifications
const CACHE_NAME = 'votum-sw-v1';
 
self.addEventListener('install', function(e) {
  self.skipWaiting();
});
 
self.addEventListener('activate', function(e) {
  e.waitUntil(clients.claim());
});
 
// Réception d'une notification push
self.addEventListener('push', function(e) {
  if (!e.data) return;
 
  var data;
  try { data = e.data.json(); }
  catch(err) { data = { title: 'Votum', body: e.data.text(), url: '/' }; }
 
  var title = data.title || 'Votum';
  var options = {
    body: data.body || '',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-72.png',
    tag: data.tag || 'votum-notif',
    data: { url: data.url || '/' },
    vibrate: [200, 100, 200],
    requireInteraction: false
  };
 
  e.waitUntil(self.registration.showNotification(title, options));
});
 
// Clic sur la notification → ouvrir l'app
self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windowClients) {
      for (var i = 0; i < windowClients.length; i++) {
        var client = windowClients[i];
        if (client.url.includes('votum') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
