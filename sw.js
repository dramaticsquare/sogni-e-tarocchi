// ── Sidera Service Worker ─────────────────────────────────────────────────
// Versione cache: aggiorna questo numero ad ogni deploy per invalidare la cache
const CACHE_VERSION = 'sidera-v1';

// Risorse da cacheare immediatamente all'installazione (app shell)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    'https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Cinzel:wght@400;500;600&display=swap',
];

// ── Install: pre-cacha l'app shell ────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then(cache => {
            return cache.addAll(PRECACHE_ASSETS.map(url => new Request(url, { mode: 'no-cors' })));
        }).then(() => self.skipWaiting())
    );
});

// ── Activate: rimuovi cache vecchie ───────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_VERSION)
                    .map(key => caches.delete(key))
            )
        ).then(() => self.clients.claim())
    );
});

// ── Fetch: strategia Network-first con fallback cache ─────────────────────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Richieste API (Make, Supabase, PayPal, Astrologer) → sempre network, mai cache
    const networkOnly = [
        'hook.eu1.make.com',
        'supabase.co',
        'paypal.com',
        'paypalobjects.com',
        'astrologer.p.rapidapi.com',
        'nominatim.openstreetmap.org',
        'allorigins.win',
        'wikipedia.org'
    ];

    if (networkOnly.some(domain => url.hostname.includes(domain))) {
        event.respondWith(fetch(event.request));
        return;
    }

    // Richieste POST → sempre network
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    // Tutto il resto → Network first, poi cache, poi offline page
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Copia la risposta nella cache
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(CACHE_VERSION).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Offline: prova dalla cache
                return caches.match(event.request).then(cached => {
                    if (cached) return cached;
                    // Fallback: home page se disponibile
                    if (event.request.destination === 'document') {
                        return caches.match('/') || caches.match('/index.html');
                    }
                });
            })
    );
});

// ── Push notifications (future) ───────────────────────────────────────────
self.addEventListener('push', event => {
    if (!event.data) return;
    const data = event.data.json();
    const options = {
        body:    data.body    || 'L\'oracolo ha un messaggio per te ✦',
        icon:    '/icons/icon-192.png',
        badge:   '/icons/icon-192.png',
        vibrate: [100, 50, 100],
        data:    { url: data.url || '/' },
        actions: [
            { action: 'open',    title: 'Apri Sidera' },
            { action: 'dismiss', title: 'Ignora'      }
        ]
    };
    event.waitUntil(
        self.registration.showNotification(data.title || 'Sidera', options)
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    if (event.action === 'dismiss') return;
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) return client.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
