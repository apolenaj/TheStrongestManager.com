/* eslint-disable no-restricted-globals */
/**
 * TheStrongestManager service worker (Prompt 184).
 * Offline shell + safe static cache. Never caches auth/API/sensitive routes.
 *
 * Keep in sync with src/domain/pwa-readiness/constants.ts deny patterns.
 */

const SHELL_CACHE = "tsm-pwa-shell-v1";
const STATIC_CACHE = "tsm-pwa-static-v1";
const PRECACHE = ["/offline", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

const NEVER_SUBSTRINGS = [
  "/api/auth",
  "/api/",
  "/auth/",
  "/technique/",
  "/app/settings",
  "/app/admin",
  "signed",
  "video",
  "media",
];

function neverCache(url) {
  const lower = url.toLowerCase();
  if (lower.includes("set-cookie")) return true;
  return NEVER_SUBSTRINGS.some((p) => lower.includes(p));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(PRECACHE);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== STATIC_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (neverCache(url.pathname) || neverCache(url.href)) {
    return; // network only — do not touch Cache Storage
  }

  if (req.headers.get("authorization")) {
    return;
  }

  // Navigations: network first, offline shell fallback
  if (req.mode === "navigate") {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cached = await caches.match("/offline");
          return cached || new Response("Offline", { status: 503, statusText: "Offline" });
        }
      })(),
    );
    return;
  }

  // Safe static: cache-first for hashed Next assets + icons
  const path = url.pathname;
  const safeStatic =
    path.startsWith("/_next/static/") ||
    path.startsWith("/icons/") ||
    path === "/manifest.webmanifest" ||
    /\.(?:js|css|woff2|png|svg|webp|ico)$/i.test(path);

  if (!safeStatic) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      const hit = await cache.match(req);
      if (hit) return hit;
      try {
        const res = await fetch(req);
        if (
          res.ok &&
          !res.headers.has("set-cookie") &&
          res.type === "basic"
        ) {
          cache.put(req, res.clone());
        }
        return res;
      } catch {
        const shell = await caches.match(req);
        if (shell) return shell;
        throw new Error("offline");
      }
    })(),
  );
});

/** Background Sync: notify clients to flush workout set queue. */
self.addEventListener("sync", (event) => {
  if (event.tag === "tsm-workout-sync") {
    event.waitUntil(
      self.clients.matchAll({ type: "window" }).then((clients) => {
        for (const client of clients) {
          client.postMessage({ type: "tsm-workout-sync" });
        }
      }),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "tsm-skip-waiting") {
    self.skipWaiting();
  }
});
