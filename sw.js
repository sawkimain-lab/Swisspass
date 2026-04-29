// sw.js - Service Worker minimal qui force la mise à jour
// Désinstalle l'ancien cache et permet aux nouvelles versions d'être chargées

self.addEventListener('install', function(e) {
  self.skipWaiting();
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    Promise.all([
      // Supprimer tous les caches existants
      caches.keys().then(function(names) {
        return Promise.all(names.map(function(n) { return caches.delete(n); }));
      }),
      // Prendre le contrôle immédiatement
      clients.claim()
    ])
  );
});

// Push notifications (gardé pour fonctionnalité future)
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
    vibrate: [200, 100, 200]
  };
  e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  var url = (e.notification.data && e.notification.data.url) || '/';
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(function(windowClients) {
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

// Pas de fetch handler — on laisse le navigateur gérer normalement
// (pas de cache, pas d'interception)
