"use client";

import { useEffect, useState } from "react";
import { featureFlags } from "@/config/feature-flags";
import { isBrowserOnline } from "@/lib/workout/offline-queue";

/** Compact online/offline chip for workout / app chrome. */
export function PwaOnlineStatus() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    if (!featureFlags.pwaReadiness) return;
    function sync() {
      setOnline(isBrowserOnline());
    }
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!featureFlags.pwaReadiness) return null;

  return (
    <span
      className={
        online
          ? "text-xs text-[var(--color-muted)]"
          : "text-xs font-medium text-[var(--color-accent)]"
      }
      aria-live="polite"
    >
      {online ? "Online" : "Offline — sets queue until sync"}
    </span>
  );
}
