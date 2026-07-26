import { describe, expect, it } from "vitest";
import {
  PWA_CAPABILITIES,
  PWA_HONESTY,
  PWA_NEVER_CACHE_PATTERNS,
  buildPwaReadinessSnapshot,
  decidePwaCachePolicy,
  shouldNeverCacheUrl,
} from "@/domain/pwa-readiness";

describe("PWA readiness", () => {
  it("covers install / shell / workout / sync / sensitive-cache capabilities", () => {
    const ids = PWA_CAPABILITIES.map((c) => c.id);
    expect(ids).toEqual([
      "installable",
      "offline_shell",
      "cached_workout",
      "sync_when_online",
      "no_sensitive_cache",
    ]);
  });

  it("never caches auth, API, technique, or settings paths", () => {
    expect(shouldNeverCacheUrl("/api/auth/session")).toBe(true);
    expect(shouldNeverCacheUrl("/api/technique/upload")).toBe(true);
    expect(shouldNeverCacheUrl("/technique/abc")).toBe(true);
    expect(shouldNeverCacheUrl("/app/settings")).toBe(true);
    expect(shouldNeverCacheUrl("/app/admin/flags")).toBe(true);
    expect(shouldNeverCacheUrl("/offline")).toBe(false);
    expect(shouldNeverCacheUrl("/icons/icon-192.png")).toBe(false);
  });

  it("decides network-only for HTML and deny for authorized requests", () => {
    expect(
      decidePwaCachePolicy({
        pathname: "/app/today",
        method: "GET",
        hasAuthorizationHeader: false,
        isNavigationRequest: true,
      }).action,
    ).toBe("network_only");

    expect(
      decidePwaCachePolicy({
        pathname: "/_next/static/chunks/app.js",
        method: "GET",
        hasAuthorizationHeader: false,
        isNavigationRequest: false,
      }).action,
    ).toBe("static");

    expect(
      decidePwaCachePolicy({
        pathname: "/api/auth/session",
        method: "GET",
        hasAuthorizationHeader: false,
        isNavigationRequest: false,
      }).action,
    ).toBe("deny");

    expect(
      decidePwaCachePolicy({
        pathname: "/_next/static/chunks/app.js",
        method: "GET",
        hasAuthorizationHeader: true,
        isNavigationRequest: false,
      }).action,
    ).toBe("deny");
  });

  it("documents sensitive-cache honesty", () => {
    expect(PWA_NEVER_CACHE_PATTERNS.length).toBeGreaterThan(5);
    expect(PWA_HONESTY.join(" ")).toMatch(/never cached/i);
    const snap = buildPwaReadinessSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.docPath).toBe("docs/PWA_READINESS.md");
    expect(snap.swPath).toBe("/sw.js");
  });
});
