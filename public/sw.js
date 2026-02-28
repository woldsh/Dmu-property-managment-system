const CACHE_NAME = 'property-ms-v1';
const urlsToCache = [
    '/',
    '/manifest.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Ignore internal Next.js, Firebase, and Google requests
    if (url.pathname.startsWith('/_next/') ||
        url.pathname.includes('google-') ||
        url.pathname.includes('firebase')) {
        return;
    }

    // Network-first strategy for all other requests
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Only cache successful GET responses for specific assets if needed
                // For now, we prefer fresh network data to avoid 404/caching issues
                return response;
            })
            .catch(() => {
                // Fallback to cache if network fails
                return caches.match(event.request);
            })
    );
});
