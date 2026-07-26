import { describe, expect, it, beforeEach } from "vitest";
import {
  ALLOWED_ANALYTICS_PROP_KEYS,
  FORBIDDEN_ANALYTICS_PROP_KEYS,
  PRODUCT_EVENT_NAMES,
  createMemoryAnalyticsAdapter,
  getActiveAnalyticsProvider,
  isProductEventName,
  registerAnalyticsProvider,
  resetAnalyticsProvidersForTests,
  sanitizeAnalyticsProps,
} from "@/domain/analytics";
import {
  trackProductEvent,
  trackProductEventSafe,
} from "@/services/analytics/track";
import { emitSubscriptionActivatedEvent } from "@/services/billing/billing-service";

describe("product analytics catalog", () => {
  it("lists the Prompt 42 funnel events", () => {
    expect(PRODUCT_EVENT_NAMES).toEqual([
      "homepage_viewed",
      "signup_started",
      "signup_completed",
      "onboarding_completed",
      "workout_started",
      "workout_completed",
      "technique_analysis_uploaded",
      "technique_analysis_completed",
      "pricing_viewed",
      "checkout_started",
      "subscription_activated",
      "model_feedback_submitted",
      "premium_coaching_landing_viewed",
      "premium_coaching_application_submitted",
      "premium_coaching_stage_changed",
      "premium_coaching_offer_presented",
      "referral_code_issued",
      "referral_attributed",
      "referral_qualified",
      "referral_reward_granted",
      "referral_voided",
      "affiliate_partner_applied",
      "affiliate_partner_activated",
      "affiliate_link_clicked",
      "affiliate_conversion_attributed",
      "affiliate_commission_ledgered",
      "creator_program_applied",
      "creator_program_reviewed",
      "creator_program_approved",
      "program_marketplace_submitted",
      "program_marketplace_reviewed",
      "program_marketplace_published",
      "program_marketplace_purchased",
      "program_marketplace_rated",
      "program_marketplace_commission_ledgered",
      "content_moderation_reported",
      "content_moderation_reviewed",
      "content_moderation_removed",
      "content_moderation_suspended",
      "growth_experiment_exposure",
      "growth_experiment_conversion",
    ]);
  });

  it("validates event names", () => {
    expect(isProductEventName("signup_completed")).toBe(true);
    expect(isProductEventName("notes_viewed")).toBe(false);
  });
});

describe("sanitizeAnalyticsProps", () => {
  it("allows catalog-safe props", () => {
    const result = sanitizeAnalyticsProps({
      sessionId: "sess_1",
      planId: "pro",
      checkoutEnabled: true,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.props).toEqual({
        sessionId: "sess_1",
        planId: "pro",
        checkoutEnabled: true,
      });
    }
  });

  it("rejects sensitive notes, health, and video keys", () => {
    for (const key of [
      "notes",
      "bodyweight",
      "storageKey",
      "landmarks",
      "email",
      "summary",
    ] as const) {
      const result = sanitizeAnalyticsProps({ [key]: "secret" });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.rejectedKeys).toContain(key);
      }
    }
  });

  it("rejects nested objects that could hide private payloads", () => {
    const result = sanitizeAnalyticsProps({
      meta: { storageKey: "private/path.mp4" },
    });
    expect(result.ok).toBe(false);
  });

  it("documents forbidden and allowed key lists", () => {
    expect(FORBIDDEN_ANALYTICS_PROP_KEYS.length).toBeGreaterThan(10);
    expect(ALLOWED_ANALYTICS_PROP_KEYS).toContain("sessionId");
    expect(ALLOWED_ANALYTICS_PROP_KEYS).toContain("analysisId");
  });
});

describe("trackProductEvent", () => {
  beforeEach(() => {
    resetAnalyticsProvidersForTests();
  });

  it("delivers sanitized events to the active provider", async () => {
    const memory = createMemoryAnalyticsAdapter();
    registerAnalyticsProvider(memory);

    const result = await trackProductEvent({
      name: "workout_completed",
      props: { sessionId: "s1" },
      userId: "user_1",
    });

    expect(result).toEqual({ ok: true });
    expect(memory.events).toHaveLength(1);
    expect(memory.events[0]).toMatchObject({
      name: "workout_completed",
      props: { sessionId: "s1" },
      userId: "user_1",
    });
    expect(memory.events[0]!.occurredAt).toBeTruthy();
  });

  it("refuses forbidden props before delivery", async () => {
    const memory = createMemoryAnalyticsAdapter();
    registerAnalyticsProvider(memory);

    const result = await trackProductEvent({
      name: "workout_completed",
      // Cast: simulates a buggy caller smuggling notes
      props: { sessionId: "s1", notes: "pain today" } as {
        sessionId: string;
      },
      userId: "user_1",
    });

    expect(result.ok).toBe(false);
    expect(memory.events).toHaveLength(0);
  });

  it("safe helper never throws on provider failure", () => {
    registerAnalyticsProvider({
      id: "boom",
      label: "Boom",
      status: "ready",
      track() {
        throw new Error("vendor down");
      },
    });

    expect(() =>
      trackProductEventSafe({
        name: "pricing_viewed",
        props: { checkoutEnabled: false },
      }),
    ).not.toThrow();
  });

  it("emitSubscriptionActivatedEvent uses the catalog", () => {
    const memory = createMemoryAnalyticsAdapter();
    registerAnalyticsProvider(memory);

    emitSubscriptionActivatedEvent({
      userId: "u1",
      planId: "pro",
      fromPlanId: "free",
    });

    expect(memory.events[0]).toMatchObject({
      name: "subscription_activated",
      props: { planId: "pro", fromPlanId: "free" },
      userId: "u1",
    });
  });

  it("defaults to a console or noop adapter when none registered", () => {
    const provider = getActiveAnalyticsProvider();
    expect(["console", "noop"]).toContain(provider.status);
  });
});
