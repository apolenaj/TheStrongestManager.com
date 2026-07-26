/**
 * Pure policy helpers for PWA cache decisions (testable without a browser).
 */

import { PWA_NEVER_CACHE_PATTERNS } from "@/domain/pwa-readiness/constants";

export function shouldNeverCacheUrl(urlOrPath: string): boolean {
  const lower = urlOrPath.toLowerCase();
  for (const pattern of PWA_NEVER_CACHE_PATTERNS) {
    if (lower.includes(pattern.toLowerCase())) return true;
  }
  return false;
}

/** Same-origin static assets safe for short-lived runtime cache. */
export function isSafeStaticAssetPath(pathname: string): boolean {
  if (shouldNeverCacheUrl(pathname)) return false;
  if (pathname.startsWith("/_next/static/")) return true;
  if (pathname.startsWith("/icons/")) return true;
  if (pathname === "/manifest.webmanifest") return true;
  if (pathname === "/offline") return true;
  if (/\.(?:js|css|woff2|png|svg|webp|ico)$/i.test(pathname)) {
    // Still refuse anything under technique / api / auth
    return !shouldNeverCacheUrl(pathname);
  }
  return false;
}

export type PwaCacheDecision =
  | { action: "deny"; reason: string }
  | { action: "shell"; reason: string }
  | { action: "static"; reason: string }
  | { action: "network_only"; reason: string };

export function decidePwaCachePolicy(input: {
  pathname: string;
  method: string;
  hasAuthorizationHeader: boolean;
  isNavigationRequest: boolean;
}): PwaCacheDecision {
  if (input.method.toUpperCase() !== "GET") {
    return { action: "deny", reason: "Non-GET never cached." };
  }
  if (input.hasAuthorizationHeader) {
    return { action: "deny", reason: "Authorization header present." };
  }
  if (shouldNeverCacheUrl(input.pathname)) {
    return { action: "deny", reason: "Matched never-cache pattern." };
  }
  if (input.pathname === "/offline" || input.pathname === "/manifest.webmanifest") {
    return { action: "shell", reason: "Offline shell allowlist." };
  }
  if (isSafeStaticAssetPath(input.pathname)) {
    return { action: "static", reason: "Safe static asset." };
  }
  if (input.isNavigationRequest) {
    return {
      action: "network_only",
      reason: "HTML navigations are network-first; offline fallback only.",
    };
  }
  return { action: "network_only", reason: "Default network-only." };
}
