/**
 * @file sw.js
 * @description PWA Service Worker.
 * Cache-first strategy for static assets, network-first for API calls.
 * Update CACHE_NAME whenever deploying a new version to invalidate old caches.
 */

const CACHE_NAME = "HW-DATA-V9";

const STATIC_ASSETS = [
    "/",
    "/index.html",
    "/js/main.js",
    "/js/controllers/app.controller.js",
    "/js/services/api.service.js",
    "/js/utils/sanitize.utils.js",
    "/js/utils/ui.utils.js",
    "/js/utils/templates.js",
    "/manifest.json",
];

// ── Install: pre-cache all static assets ──
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting()) // Activate immediately
    );
});

// ── Activate: purge old caches ──
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
            )
            .then(() => self.clients.claim()) // Take control of all clients
    );
});

// ── Fetch: cache-first for static, network-first for API ──
self.addEventListener("fetch", (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Always go network-first for API calls — never serve stale financial data
    if (url.pathname.startsWith("/api/")) {
        event.respondWith(
            fetch(request).catch(() =>
                new Response(
                    JSON.stringify({ success: false, message: "Offline: tidak dapat terhubung ke server." }),
                    { status: 503, headers: { "Content-Type": "application/json" } }
                )
            )
        );
        return;
    }

    // Cache-first for static assets
    event.respondWith(
        caches.match(request).then((cached) => cached || fetch(request))
    );
});
