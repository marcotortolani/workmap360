// public/sw.js
// self.addEventListener('push', function (event) {
//   if (event.data) {
//     const data = event.data.json()
//     const options = {
//       body: data.body,
//       icon: data.icon || '/icon.png',
//       badge: '/badge.png',
//       vibrate: [100, 50, 100],
//       data: {
//         dateOfArrival: Date.now(),
//         primaryKey: '2',
//       },
//     }
//     event.waitUntil(self.registration.showNotification(data.title, options))
//   }
// })

// self.addEventListener('notificationclick', function (event) {
//   console.log('Notification click received.')
//   event.notification.close()
//   event.waitUntil(clients.openWindow('<https://your-website.com>'))
// })

const CACHE_NAME = 'workmap360-v1'
const urlsToCache = [
  '/',
  '/dashboard',
  '/projects',
  '/repairs',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icon-192x192.png',
  '/icon-512x512.png',
]

// Install event
self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Opened cache')
      return cache.addAll(urlsToCache)
    })
  )
})

// Fetch event
self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      // Return cached version or fetch from network
      if (response) {
        return response
      }
      return fetch(event.request)
    })
  )
})

// Activate event
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Push event
self.addEventListener('push', function (event) {
  console.log('Push event received:', event)

  let data = {}
  if (event.data) {
    data = event.data.json()
  }

  const options = {
    body: data.body || 'New notification from Workmap360',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.primaryKey || 'default',
      url: data.url || '/',
    },
    actions: [
      {
        action: 'open',
        title: 'Open App',
        icon: '/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png',
      },
    ],
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Workmap360', options)
  )
})

// Notification click event
self.addEventListener('notificationclick', function (event) {
  console.log('Notification click received.')

  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll().then(function (clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i]
        if (client.url === url && 'focus' in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url)
      }
    })
  )
})
