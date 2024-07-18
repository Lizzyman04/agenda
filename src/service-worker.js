// Copyright (C) 2024 Arlindo Abdul
// Este software contém restrições.
// Por favor, leia o arquivo LICENSE na raiz do projeto.
// Para contribuições, visite https://github.com/Lizzyman04/agenda

import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

precacheAndRoute(self.__WB_MANIFEST);

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
    const options = {
      body: data.body,
      icon: '/assets/img/agenda-logo.png',
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
});
