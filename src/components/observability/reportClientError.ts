"use client";

/**
 * Digest-only client error reporter — no stacks, no user content.
 */
export function reportClientError(input: {
  digest?: string;
  source: "app-error" | "global-error";
  route?: string;
}): void {
  try {
    const payload = JSON.stringify({
      digest: input.digest?.slice(0, 80),
      source: input.source,
      route: input.route?.slice(0, 120),
    });
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      navigator.sendBeacon(
        "/api/observability",
        new Blob([payload], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/observability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // never throw from error boundary
  }
}
