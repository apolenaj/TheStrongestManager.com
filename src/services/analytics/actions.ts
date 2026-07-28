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

const CLIENT_ALLOWED: ProductEventName[] = [
  "homepage_viewed",
  "signup_started",
  "pricing_viewed",
  "premium_coaching_landing_viewed",
  "program_viewed",
  "legendary_methods_nav_click",
  "legendary_methods_homepage_click",
  "legendary_profile_opened",
  "legendary_profile_source_clicked",
  "legendary_profile_programme_clicked",
  "legendary_methods_filter_used",
];

function asSlug(value: unknown, max = 120): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) return null;
  return trimmed;
}

/**
 * Client-safe beacon for page/view and Legendary Methods funnel events.
 * Only catalogued events; props must already match the typed map.
 */
export async function trackClientAnalyticsAction(input: {
  name: string;
  props?: Record<string, unknown>;
}): Promise<ClientAnalyticsState> {
  if (!isProductEventName(input.name)) {
    return { ok: false, error: "Unknown analytics event." };
  }

  if (!CLIENT_ALLOWED.includes(input.name)) {
    return { ok: false, error: "Event is not client-emittable." };
  }

  const session = await auth();
  const userId = session?.user?.id ?? null;
  const name = input.name;
  const props = input.props ?? {};

  if (name === "homepage_viewed") {
    const result = await trackProductEvent({
      name: "homepage_viewed",
      props: {},
      userId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (name === "signup_started") {
    const method = props.method;
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
      userId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (name === "program_viewed") {
    const productSlug = asSlug(props.productSlug);
    if (!productSlug) {
      return { ok: false, error: "Invalid product slug." };
    }
    const result = await trackProductEvent({
      name: "program_viewed",
      props: {
        productSlug,
        isFree: Boolean(props.isFree),
      },
      userId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (name === "pricing_viewed" || name === "premium_coaching_landing_viewed") {
    const result = await trackProductEvent({
      name,
      props: { checkoutEnabled: Boolean(props.checkoutEnabled) },
      userId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (name === "legendary_methods_nav_click") {
    const surface = props.surface;
    if (
      surface !== "header" &&
      surface !== "footer" &&
      surface !== "learn_menu" &&
      surface !== "mobile_nav"
    ) {
      return { ok: false, error: "Invalid nav surface." };
    }
    const result = await trackProductEvent({
      name: "legendary_methods_nav_click",
      props: { surface },
      userId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (name === "legendary_methods_homepage_click") {
    const target = props.target;
    if (target !== "cta" && target !== "card") {
      return { ok: false, error: "Invalid homepage click target." };
    }
    const slug = asSlug(props.slug) ?? undefined;
    if (target === "card" && !slug) {
      return { ok: false, error: "Card click requires slug." };
    }
    const result = await trackProductEvent({
      name: "legendary_methods_homepage_click",
      props: slug ? { target, slug } : { target },
      userId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (
    name === "legendary_profile_opened" ||
    name === "legendary_profile_source_clicked"
  ) {
    const slug = asSlug(props.slug);
    if (!slug) return { ok: false, error: "Invalid profile slug." };
    const result = await trackProductEvent({
      name,
      props: { slug },
      userId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (name === "legendary_profile_programme_clicked") {
    const slug = asSlug(props.slug);
    const programmeSlug = asSlug(props.programmeSlug);
    if (!slug || !programmeSlug) {
      return { ok: false, error: "Invalid programme click props." };
    }
    const result = await trackProductEvent({
      name: "legendary_profile_programme_clicked",
      props: { slug, programmeSlug },
      userId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  if (name === "legendary_methods_filter_used") {
    const filter = asSlug(props.filter, 64);
    if (!filter) return { ok: false, error: "Invalid filter id." };
    const result = await trackProductEvent({
      name: "legendary_methods_filter_used",
      props: { filter },
      userId,
    });
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }

  return { ok: false, error: "Unhandled client analytics event." };
}
