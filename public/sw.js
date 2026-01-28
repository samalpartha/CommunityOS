const CACHE_NAME = 'community-os-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

self.addEventListener('fetch', (event) => {
    // Skip caching for API calls (Gemini, Maps, etc.)
    if (event.request.url.includes('googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request).catch((err) => {
                console.error('[SW] Fetch failed:', event.request.url, err);
                if (event.request.mode === 'navigate') {
                    return caches.match('/');
                }
                return Promise.reject(err);
            }))
    );
});
