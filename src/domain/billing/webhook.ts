/**
 * Stripe webhook signature verification (Prompt 43).
 * Implements Stripe's signed-payload scheme without inventing paid events.
 * Ref: https://stripe.com/docs/webhooks/signatures
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export type StripeWebhookVerifyResult =
  | { ok: true; timestamp: number }
  | { ok: false; error: string };

const DEFAULT_TOLERANCE_SECONDS = 300;

/**
 * Verify `Stripe-Signature` header against the raw body and endpoint secret.
 * Rejects missing/invalid signatures — never process unverified payloads.
 */
export function verifyStripeWebhookSignature(input: {
  payload: string;
  signatureHeader: string | null | undefined;
  secret: string;
  /** Clock skew tolerance (seconds). */
  toleranceSeconds?: number;
  /** Injected "now" for tests (unix seconds). */
  nowSeconds?: number;
}): StripeWebhookVerifyResult {
  const secret = input.secret.trim();
  if (!secret) {
    return { ok: false, error: "Webhook signing secret is not configured." };
  }
  if (!input.signatureHeader?.trim()) {
    return { ok: false, error: "Missing Stripe-Signature header." };
  }

  const parts = input.signatureHeader.split(",").map((p) => p.trim());
  let timestamp: number | null = null;
  const v1Signatures: string[] = [];

  for (const part of parts) {
    const [key, value] = part.split("=");
    if (key === "t" && value) {
      const n = Number(value);
      if (Number.isFinite(n)) timestamp = n;
    }
    if (key === "v1" && value) {
      v1Signatures.push(value);
    }
  }

  if (timestamp == null) {
    return { ok: false, error: "Invalid Stripe-Signature timestamp." };
  }
  if (v1Signatures.length === 0) {
    return { ok: false, error: "Invalid Stripe-Signature (no v1)." };
  }

  const now = input.nowSeconds ?? Math.floor(Date.now() / 1000);
  const tolerance = input.toleranceSeconds ?? DEFAULT_TOLERANCE_SECONDS;
  if (Math.abs(now - timestamp) > tolerance) {
    return { ok: false, error: "Stripe-Signature timestamp outside tolerance." };
  }

  const signedPayload = `${timestamp}.${input.payload}`;
  const expected = createHmac("sha256", secret)
    .update(signedPayload, "utf8")
    .digest("hex");

  const matched = v1Signatures.some((sig) => safeEqualHex(expected, sig));
  if (!matched) {
    return { ok: false, error: "Stripe-Signature verification failed." };
  }

  return { ok: true, timestamp };
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Env gate for payment webhook readiness — does not invent a live Stripe app.
 */
export function isStripeWebhookConfigured(): boolean {
  return Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());
}
