const CACHE_NAME = 'gpu-database-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/about/',
    '/contact/',
    '/blog/',
    '/manifest.json',
    '/img/favicon-32x32.png',
    '/img/favicon-16x16.png',
    '/img/apple-touch-icon.png',
    // Blog posts
    '/blog/amd-rx-7900-xtx-vs-nvidia-rtx-4080-ultimate-battle-2025.html',
    '/blog/rtx-4060-ti-vs-rtx-4070-complete-comparison-2025.html',
    '/blog/nvidia-geforce-rtx-60-series-rumors-leaks-2025.html',
    '/blog/rtx-5090-vs-4090-comparison.html',
    '/blog/rtx-3090-vs-4090-comparison.html',
    // External resources
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event - cache resources
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.log('Cache install failed:', error);
            })
    );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Return cached version or fetch from network
                if (response) {
                    return response;
                }
                return fetch(event.request).then(response => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Background sync for offline functionality
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(() => {
            console.log('Background sync triggered');
            // Perform background sync operations
        });
    }
});

// Push notification support
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'New GPU content available!',
        icon: '/img/icon-192.png',
        badge: '/img/favicon-32x32.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'View Latest GPUs',
                icon: '/img/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/img/favicon-32x32.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('GPU Database', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});
