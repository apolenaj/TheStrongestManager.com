import { describe, expect, it } from "vitest";
import {
  HOMEPAGE_TRAFFIC_INTENTS,
  PERSONALIZED_HOMEPAGE_HONESTY,
  buildPersonalizedHomepageSnapshot,
  parseHomepageTrafficIntent,
  resolveHomepageIntentVariant,
  resolveHomepageVariantFromSearchParams,
} from "@/domain/personalized-homepage";
import { homeCopy } from "@/lib/content/home";

describe("personalized homepage", () => {
  it("allowlists prompt intents and refuses cloaking language gaps", () => {
    expect(HOMEPAGE_TRAFFIC_INTENTS.map((i) => i.id)).toEqual([
      "default",
      "powerlifting",
      "technique",
      "coach",
      "seo",
    ]);
    expect(PERSONALIZED_HOMEPAGE_HONESTY.join(" ")).toMatch(/[Cc]loaking/);
    expect(PERSONALIZED_HOMEPAGE_HONESTY.join(" ")).toMatch(/[Bb]rand/);
  });

  it("parses aliases and falls back safely", () => {
    expect(parseHomepageTrafficIntent("powerlifter")).toBe("powerlifting");
    expect(parseHomepageTrafficIntent("technique_analysis")).toBe("technique");
    expect(parseHomepageTrafficIntent("coaching")).toBe("coach");
    expect(parseHomepageTrafficIntent("organic")).toBe("seo");
    expect(parseHomepageTrafficIntent("unknown_campaign")).toBe("default");
    expect(parseHomepageTrafficIntent(undefined)).toBe("default");
  });

  it("keeps brand and hero lines identical across intents", () => {
    for (const intent of HOMEPAGE_TRAFFIC_INTENTS) {
      const variant = resolveHomepageIntentVariant(intent.id);
      expect(variant.brand).toBe(homeCopy.brand);
      expect(variant.heroLines).toEqual(homeCopy.heroLines);
      expect(variant.metadataLocked).toBe(true);
    }
    const power = resolveHomepageIntentVariant("powerlifting");
    expect(power.heroSupport).not.toBe(homeCopy.heroSupport);
    expect(power.heroSupport.toLowerCase()).toContain("powerlifting");

    const seo = resolveHomepageIntentVariant("seo");
    expect(seo.heroSupport).toBe(homeCopy.heroSupport);
  });

  it("prefers intent over utm_campaign and builds admin snapshot", () => {
    const fromUtm = resolveHomepageVariantFromSearchParams({
      utm_campaign: "coach_search",
    });
    expect(fromUtm.intentId).toBe("coach");

    const preferIntent = resolveHomepageVariantFromSearchParams({
      intent: "technique",
      utm_campaign: "powerlifting",
    });
    expect(preferIntent.intentId).toBe("technique");

    const snap = buildPersonalizedHomepageSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.lockedMetadata.canonical).toBe("/");
    expect(snap.variants).toHaveLength(5);
    expect(
      snap.variants.every((v) => v.brand === snap.brandIdentity.brand),
    ).toBe(true);
  });
});
