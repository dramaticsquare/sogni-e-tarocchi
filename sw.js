// ── Sidera Service Worker ─────────────────────────────────────────────────
// Aggiorna CACHE_VERSION ad ogni deploy per forzare il refresh sui dispositivi
const CACHE_VERSION = 'sidera-v4';

// App shell — solo risorse locali (no URL esterni: causano crash di addAll)
const PRECACHE_ASSETS = [
    '/',
    '/index.html',
    '/sidera-oracolo-lunare.js',
    '/manifest.json',
];

// ── Install ───────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
            .catch(err => {
                // Log dell'errore ma non blocca l'installazione
                console.warn('[SW] Precache parzialmente fallita:', err);
                return self.skipWaiting();
            })
    );
});

// ── Activate: rimuovi cache vecchie ──────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys
                    .filter(key => key !== CACHE_VERSION)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// ── Fetch: Network-first con fallback cache ───────────────────────────────
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Questi domini vanno sempre in rete — mai intercettati
    const networkOnly = [
        'hook.eu1.make.com',
        'supabase.co',
        'paypal.com',
        'paypalobjects.com',
        'astrologer.p.rapidapi.com',
        'nominatim.openstreetmap.org',
        'allorigins.win',
        'wikipedia.org',
        'fonts.googleapis.com',   // ← spostato qui: non più in precache
        'fonts.gstatic.com',      // ← idem
        'cdnjs.cloudflare.com',
        'cdn.jsdelivr.net',
    ];

    if (networkOnly.some(domain => url.hostname.includes(domain))) {
        event.respondWith(fetch(event.request));
        return;
    }

    // POST e altri metodi → sempre network
    if (event.request.method !== 'GET') {
        event.respondWith(fetch(event.request));
        return;
    }

    // GET → Network-first, poi cache, poi offline fallback
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200) {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION)
                        .then(cache => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() =>
                caches.match(event.request).then(cached => {
                    if (cached) return cached;
                    if (event.request.destination === 'document') {
                        return caches.match('/') || caches.match('/index.html');
                    }
                })
            )
    );
});

// ── Push notifications ────────────────────────────────────────────────────
self.addEventListener('push', event => {
    if (!event.data) return;
    const data = event.data.json();
    event.waitUntil(
        self.registration.showNotification(data.title || 'Sidera', {
            body:    data.body    || "L'oracolo ha un messaggio per te ✦",
            icon:    '/icon-192.png',
            badge:   '/icon-192.png',
            vibrate: [100, 50, 100],
            data:    { url: data.url || '/' },
        })
    );
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const url = event.notification.data?.url || '/';
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(wins => {
            for (const w of wins) {
                if (w.url === url && 'focus' in w) return w.focus();
            }
            if (clients.openWindow) return clients.openWindow(url);
        })
    );
});
