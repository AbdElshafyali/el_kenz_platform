const CACHE_NAME = 'ax-elkenz-v1';
const STATIC_ASSETS = ['/', '/store', '/manifest.json', '/logo.png', '/icon.png'];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    if (e.request.url.includes('/api/') || e.request.url.includes('supabase')) return;
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                const clone = res.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
                return res;
            })
            .catch(() => caches.match(e.request))
    );
});

self.addEventListener('push', (e) => {
    if (!e.data) return;
    const data = e.data.json().catch(() => ({ title: 'الكنز', body: e.data.text() }));
    e.waitUntil(
        data.then((d) =>
            self.registration.showNotification(d.title || 'الكنز', {
                body: d.body,
                icon: '/icon.png',
                badge: '/icon.png',
            })
        )
    );
});
