import { createHmac } from "node:crypto";
import { describe, expect, it, beforeEach } from "vitest";
import {
  assertObjectOwner,
  isObjectOwner,
  OwnershipError,
} from "@/domain/security";
import {
  RATE_LIMITS,
  rateLimit,
  resetRateLimitBucketsForTests,
} from "@/lib/rate-limit";
import {
  isStripeWebhookConfigured,
  verifyStripeWebhookSignature,
} from "@/domain/billing/webhook";

describe("object ownership", () => {
  it("accepts matching owner", () => {
    expect(isObjectOwner("u1", "u1")).toBe(true);
    expect(() =>
      assertObjectOwner({ actorUserId: "u1", ownerUserId: "u1" }),
    ).not.toThrow();
  });

  it("rejects IDOR-style mismatches", () => {
    expect(isObjectOwner("attacker", "owner")).toBe(false);
    expect(() =>
      assertObjectOwner({
        actorUserId: "attacker",
        ownerUserId: "owner",
        label: "analysis",
      }),
    ).toThrow(OwnershipError);
  });
});

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimitBucketsForTests();
  });

  it("allows up to the limit then blocks", () => {
    const key = "test:login";
    const opts = { limit: 3, windowMs: 60_000 };
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    expect(rateLimit(key, opts).ok).toBe(true);
    const blocked = rateLimit(key, opts);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    }
  });

  it("exposes auth and technique presets", () => {
    expect(RATE_LIMITS.login.limit).toBeGreaterThan(0);
    expect(RATE_LIMITS.techniqueUpload.limit).toBeGreaterThan(0);
  });
});

describe("verifyStripeWebhookSignature", () => {
  const secret = "whsec_test_secret";
  const payload = JSON.stringify({ type: "checkout.session.completed", id: "evt_1" });
  const timestamp = 1_700_000_000;

  function sign(ts: number, body: string): string {
    const expected = createHmac("sha256", secret)
      .update(`${ts}.${body}`, "utf8")
      .digest("hex");
    return `t=${ts},v1=${expected}`;
  }

  it("accepts a valid signature within tolerance", () => {
    const result = verifyStripeWebhookSignature({
      payload,
      signatureHeader: sign(timestamp, payload),
      secret,
      nowSeconds: timestamp + 10,
    });
    expect(result).toEqual({ ok: true, timestamp });
  });

  it("rejects missing signature", () => {
    const result = verifyStripeWebhookSignature({
      payload,
      signatureHeader: null,
      secret,
      nowSeconds: timestamp,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects tampered payload", () => {
    const result = verifyStripeWebhookSignature({
      payload: payload + "x",
      signatureHeader: sign(timestamp, payload),
      secret,
      nowSeconds: timestamp,
    });
    expect(result.ok).toBe(false);
  });

  it("rejects expired timestamps", () => {
    const result = verifyStripeWebhookSignature({
      payload,
      signatureHeader: sign(timestamp, payload),
      secret,
      nowSeconds: timestamp + 10_000,
      toleranceSeconds: 300,
    });
    expect(result.ok).toBe(false);
  });

  it("reports webhook config from env presence only", () => {
    const prev = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    expect(isStripeWebhookConfigured()).toBe(false);
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    expect(isStripeWebhookConfigured()).toBe(true);
    if (prev === undefined) delete process.env.STRIPE_WEBHOOK_SECRET;
    else process.env.STRIPE_WEBHOOK_SECRET = prev;
  });
});
