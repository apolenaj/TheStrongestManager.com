"use client";

import { useEffect, useRef } from "react";
import { trackClientAnalyticsAction } from "@/services/analytics/actions";
import type { SignupMethod } from "@/domain/analytics";

/**
 * Fires a client-allowed product event once on mount (page view / funnel start).
 * Does not render UI.
 */
export function AnalyticsBeacon({
  name,
  method,
  checkoutEnabled,
}: {
  name:
    | "homepage_viewed"
    | "signup_started"
    | "pricing_viewed"
    | "premium_coaching_landing_viewed";
  method?: SignupMethod;
  checkoutEnabled?: boolean;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    void trackClientAnalyticsAction({
      name,
      props:
        name === "signup_started"
          ? { method }
          : name === "homepage_viewed"
            ? {}
            : { checkoutEnabled: Boolean(checkoutEnabled) },
    });
  }, [name, method, checkoutEnabled]);

  return null;
}
