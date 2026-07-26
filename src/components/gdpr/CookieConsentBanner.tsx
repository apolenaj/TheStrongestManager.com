"use client";

import { useEffect, useState } from "react";
import { Button, ButtonLink } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { hasDecidedCookieConsent } from "@/domain/gdpr-readiness";
import {
  acceptAllCookies,
  readClientCookieConsent,
  rejectNonEssentialCookies,
} from "@/components/gdpr/cookie-client";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!featureFlags.gdprReadiness) return;
    const state = readClientCookieConsent();
    setVisible(!hasDecidedCookieConsent(state));
  }, []);

  if (!featureFlags.gdprReadiness || !visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-[var(--z-modal)] border-t border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] sm:p-5"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-2 text-sm text-[var(--color-muted)]">
          <p className="font-medium text-[var(--color-foreground)]">
            Cookies & similar technologies
          </p>
          <p>
            We use essential cookies to keep you signed in and to store this
            choice. Optional functional and analytics cookies stay off until you
            accept them. Policy draft — for professional legal review.
          </p>
          <ButtonLink href="/cookies" variant="secondary" size="sm">
            Cookie details
          </ButtonLink>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => {
              rejectNonEssentialCookies();
              setVisible(false);
            }}
          >
            Essential only
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              acceptAllCookies();
              setVisible(false);
            }}
          >
            Accept optional
          </Button>
        </div>
      </div>
    </div>
  );
}
