"use client";

import { useEffect, useState } from "react";
import { Button } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * Installable PWA prompt — only when the browser fires beforeinstallprompt.
 */
export function PwaInstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!featureFlags.pwaReadiness) return;

    try {
      if (window.localStorage.getItem("tsm-pwa-install-dismissed") === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }

    function onBip(e: Event) {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (!featureFlags.pwaReadiness || dismissed || !deferred) return null;

  return (
    <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-[var(--z-sticky)] mx-auto max-w-lg px-3 md:bottom-4">
      <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-3 shadow-lg">
        <p className="text-sm font-medium text-[var(--color-foreground)]">
          Install The Strongest
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted)]">
          Add to your home screen for faster workouts and an offline shell.
          Sensitive data is never cached insecurely.
        </p>
        <div className="mt-3 flex gap-2">
          <Button
            type="button"
            size="lg"
            className="min-h-11 flex-1"
            onClick={async () => {
              await deferred.prompt();
              setDeferred(null);
            }}
          >
            Install
          </Button>
          <Button
            type="button"
            size="lg"
            variant="ghost"
            className="min-h-11"
            onClick={() => {
              setDismissed(true);
              try {
                window.localStorage.setItem("tsm-pwa-install-dismissed", "1");
              } catch {
                /* ignore */
              }
              setDeferred(null);
            }}
          >
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
