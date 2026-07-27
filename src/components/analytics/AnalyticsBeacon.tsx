"use client";

import { useEffect, useRef } from "react";
import { trackClientAnalyticsAction } from "@/services/analytics/actions";
import type { SignupMethod } from "@/domain/analytics";

type BeaconName =
  | "homepage_viewed"
  | "signup_started"
  | "pricing_viewed"
  | "premium_coaching_landing_viewed"
  | "program_viewed";

/**
 * Fires a client-allowed product event once on mount (page view / funnel start).
 * Does not render UI.
 */
export function AnalyticsBeacon({
  name,
  method,
  checkoutEnabled,
  productSlug,
  isFree,
}: {
  name: BeaconName;
  method?: SignupMethod;
  checkoutEnabled?: boolean;
  productSlug?: string;
  isFree?: boolean;
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
            : name === "program_viewed"
              ? {
                  productSlug: productSlug ?? "unknown",
                  isFree: Boolean(isFree),
                }
              : { checkoutEnabled: Boolean(checkoutEnabled) },
    });
  }, [name, method, checkoutEnabled, productSlug, isFree]);

  return null;
}
