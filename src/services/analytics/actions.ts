"use server";

import {
  isProductEventName,
  type ProductEventName,
  type ProductEventPropsMap,
} from "@/domain/analytics";
import { trackProductEvent } from "@/services/analytics/track";
import { auth } from "@/auth";

export type ClientAnalyticsState = {
  ok: boolean;
  error?: string;
};

/**
 * Client-safe beacon for page/view events (homepage, signup, pricing).
 * Only catalogued events; props must already match the typed map.
 */
export async function trackClientAnalyticsAction(input: {
  name: string;
  props?: Record<string, unknown>;
}): Promise<ClientAnalyticsState> {
  if (!isProductEventName(input.name)) {
    return { ok: false, error: "Unknown analytics event." };
  }

  // Client may only emit a subset — prevent arbitrary server-side events from the browser.
  const clientAllowed: ProductEventName[] = [
    "homepage_viewed",
    "signup_started",
    "pricing_viewed",
    "premium_coaching_landing_viewed",
  ];
  if (!clientAllowed.includes(input.name)) {
    return { ok: false, error: "Event is not client-emittable." };
  }

  const session = await auth();
  const name = input.name as
    | "homepage_viewed"
    | "signup_started"
    | "pricing_viewed"
    | "premium_coaching_landing_viewed";

  if (name === "homepage_viewed") {
    const result = await trackProductEvent({
      name: "homepage_viewed",
      props: {},
      userId: session?.user?.id ?? null,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (name === "signup_started") {
    const method = input.props?.method;
    if (
      method !== undefined &&
      method !== "email" &&
      method !== "google" &&
      method !== "apple"
    ) {
      return { ok: false, error: "Invalid signup method." };
    }
    const result = await trackProductEvent({
      name: "signup_started",
      props: {
        method: method as ProductEventPropsMap["signup_started"]["method"],
      },
      userId: session?.user?.id ?? null,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  const checkoutEnabled = Boolean(input.props?.checkoutEnabled);
  if (name === "premium_coaching_landing_viewed") {
    const result = await trackProductEvent({
      name: "premium_coaching_landing_viewed",
      props: { checkoutEnabled },
      userId: session?.user?.id ?? null,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  const result = await trackProductEvent({
    name: "pricing_viewed",
    props: { checkoutEnabled },
    userId: session?.user?.id ?? null,
  });
  return result.ok ? { ok: true } : { ok: false, error: result.error };
}
