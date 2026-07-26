"use client";

import { useEffect, useState } from "react";
import { Alert, Button } from "@/design-system";
import { COOKIE_CATEGORIES } from "@/domain/gdpr-readiness";
import {
  readClientCookieConsent,
  saveCookiePreferences,
} from "@/components/gdpr/cookie-client";

export function CookiePreferencesPanel() {
  const [functional, setFunctional] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const state = readClientCookieConsent();
    setFunctional(state.functional);
    setAnalytics(state.analytics);
  }, []);

  return (
    <div className="space-y-6">
      <Alert tone="info" title="Essential cookies">
        Sign-in and security cookies stay on. Optional categories default off
        until you choose.
      </Alert>
      <ul className="space-y-4">
        {COOKIE_CATEGORIES.map((cat) => (
          <li
            key={cat.id}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium text-[var(--color-foreground)]">
                  {cat.title}
                </p>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {cat.description}
                </p>
                <p className="mt-2 font-mono text-[10px] text-[var(--color-muted)]">
                  {cat.examples}
                </p>
              </div>
              {cat.required ? (
                <span className="text-xs text-[var(--color-muted)]">Always on</span>
              ) : (
                <label className="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                  <input
                    type="checkbox"
                    checked={cat.id === "functional" ? functional : analytics}
                    onChange={(e) => {
                      setSaved(false);
                      if (cat.id === "functional") {
                        setFunctional(e.target.checked);
                      } else {
                        setAnalytics(e.target.checked);
                      }
                    }}
                  />
                  Allow
                </label>
              )}
            </div>
          </li>
        ))}
      </ul>
      {saved ? (
        <Alert tone="success" title="Preferences saved">
          Your cookie choices were stored in this browser.
        </Alert>
      ) : null}
      <Button
        type="button"
        onClick={() => {
          saveCookiePreferences({ functional, analytics });
          setSaved(true);
        }}
      >
        Save cookie preferences
      </Button>
    </div>
  );
}
