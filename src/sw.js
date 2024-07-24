// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições!
// Por favor, leia o arquivo LICENSE na raiz do projeto
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate } from 'workbox-strategies';
import { CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { getNotifications, deleteNotification } from './indexedDB'

precacheAndRoute(self.__WB_MANIFEST || []);

registerRoute(
  ({ request }) => request.destination === 'document',
  new StaleWhileRevalidate()
);

registerRoute(
  ({ request }) => request.destination === 'script',
  new StaleWhileRevalidate()
);

registerRoute(
  ({ request }) => request.destination === 'style',
  new StaleWhileRevalidate()
);

registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'images',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 90 * 24 * 60 * 60,
      }),
    ],
  })
);

self.addEventListener('push', event => {
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/assets/img/agenda-logo.png',
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim().then(scheduledNotifications));
});

self.addEventListener('message', event => {
  if (event.data) {
    if (event.data.action === 'schedule-notification') {
      const { title, body, delay } = event.data;
      if (delay < 48 * 60 * 60 * 1000) {
        setTimeout(() => {
          self.registration.showNotification(title, {
            body: body.replace(/<[^>]*>?/gm, ''),
            icon: '/assets/img/agenda-logo.png',
          });
        }, delay);
      }
    } else if (event.data.action === 'test-notification') {
      const { title, body } = event.data;
      self.registration.showNotification(title, {
        body: body.replace(/<[^>]*>?/gm, ''),
        icon: '/assets/img/agenda-logo.png',
      });
    }
  }
});

async function scheduledNotifications() {
  console.log("Try fetching scheduled notifications");
  try {
    const notifications = await getNotifications();
    const now = Date.now();
    notifications.forEach(notification => {
      const sendDate = new Date(notification.sendDate).getTime();
      const delay = sendDate - now;
      if (delay > 0 && delay < 48 * 60 * 60 * 1000) {
        setTimeout(async () => {
          self.registration.showNotification(notification.title, {
            body: notification.message.replace(/<[^>]*>?/gm, ''),
            icon: '/assets/img/agenda-logo.png',
          });
          await deleteNotification(notification.id);
        }, delay);
      } else if (delay <= 0) {
        self.registration.showNotification("Notificação atrasada😔", {
          body: notification.message.replace(/<[^>]*>?/gm, ''),
          icon: '/assets/img/agenda-logo.png',
        });
        deleteNotification(notification.id);
      }
    });
  } catch (error) {
    console.error('Erro ao agendar notificações:', error);
  }
}

self.addEventListener('load', () => {
  scheduledNotifications();
  setInterval(scheduledNotifications, 48 * 60 * 60 * 1000);
});
