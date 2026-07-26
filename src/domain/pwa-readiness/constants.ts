/**
 * PWA Readiness (Prompt 184).
 * Installable shell + offline workout cache — never cache sensitive content insecurely.
 */

export const PWA_ENGINE_VERSION = "pwa_readiness.v1" as const;

export const PWA_HONESTY = [
  "PWA install and offline shell help training continue when the network drops — they are not a full offline clone of the product.",
  "Authenticated API responses, auth cookies, technique media, and health-adjacent notes are never cached by the service worker.",
  "Cached workouts store prescription/logging snapshots in the browser for the active session only — sync to the server when online; server remains source of truth.",
  "Service worker registration is flag-gated and HTTPS/localhost only.",
] as const;

/** Paths / URL patterns the service worker must never put in Cache Storage. */
export const PWA_NEVER_CACHE_PATTERNS = [
  "/api/auth",
  "/api/auth/",
  "/api/",
  "/auth/",
  "set-cookie",
  "/technique/",
  "/app/settings",
  "/app/admin",
  "signed",
  "video",
  "media",
] as const;

/**
 * Precache allowlist for the offline shell (public static only).
 * Hashed Next assets are runtime-cached only when same-origin GET without auth headers.
 */
export const PWA_SHELL_PRECACHE = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
] as const;

export const PWA_CAPABILITIES = [
  {
    id: "installable",
    title: "Installable",
    detail:
      "Web app manifest + icons; beforeinstallprompt UI when the browser supports it.",
  },
  {
    id: "offline_shell",
    title: "Offline shell",
    detail:
      "Service worker serves /offline when navigation fails; static shell assets only.",
  },
  {
    id: "cached_workout",
    title: "Cached workout",
    detail:
      "Active session snapshot cached in IndexedDB (client) for resume offline — not SW Cache of authenticated HTML.",
  },
  {
    id: "sync_when_online",
    title: "Sync when online",
    detail:
      "Pending set logs flush on online / SW sync event; server is source of truth after sync.",
  },
  {
    id: "no_sensitive_cache",
    title: "No insecure sensitive cache",
    detail:
      "Deny-list blocks auth, APIs, technique media, admin, and Set-Cookie responses from Cache Storage.",
  },
] as const;

export const PWA_SW_PATH = "/sw.js" as const;
export const PWA_CACHE_SHELL = "tsm-pwa-shell-v1" as const;
export const PWA_CACHE_STATIC = "tsm-pwa-static-v1" as const;
export const PWA_WORKOUT_DB = "tsm-pwa-workout" as const;
export const PWA_WORKOUT_STORE = "sessions" as const;
