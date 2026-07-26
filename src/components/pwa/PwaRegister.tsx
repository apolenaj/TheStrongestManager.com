"use client";

import { useEffect } from "react";
import { featureFlags } from "@/config/feature-flags";
import { PWA_SW_PATH } from "@/domain/pwa-readiness";

/**
 * Registers the service worker when PWA readiness is enabled.
 * HTTPS or localhost only (browser-enforced).
 */
export function PwaRegister() {
  useEffect(() => {
    if (!featureFlags.pwaReadiness) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const isLocal =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (window.location.protocol !== "https:" && !isLocal) return;

    let cancelled = false;

    void (async () => {
      try {
        const reg = await navigator.serviceWorker.register(PWA_SW_PATH, {
          scope: "/",
          updateViaCache: "none",
        });
        if (cancelled) return;
        reg.update().catch(() => {
          /* ignore */
        });
      } catch {
        /* Registration can fail on unsupported browsers — stay silent. */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
