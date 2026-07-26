import { NextResponse } from "next/server";
import {
  isStripeWebhookConfigured,
  verifyStripeWebhookSignature,
} from "@/domain/billing/webhook";
import { RATE_LIMITS, rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { obs, withObservedApi } from "@/services/observability";
import { applyVerifiedBillingWebhookPayload } from "@/services/billing/webhook-apply-service";

export const runtime = "nodejs";

/**
 * Stripe-compatible billing webhook (Prompt 43 + Billing 2.0 / Prompt 157).
 * Verifies signature, applies entitlements idempotently, never trusts frontend.
 */
async function postHandler(request: Request) {
  const limited = rateLimit(
    clientKeyFromRequest(request, "billing-webhook"),
    RATE_LIMITS.billingWebhook,
  );
  if (!limited.ok) {
    obs.warn({
      category: "payment_failures",
      message: "billing_webhook_rate_limited",
      props: { status: 429 },
    });
    return NextResponse.json(
      { error: "Too many requests." },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  if (!isStripeWebhookConfigured()) {
    obs.error({
      category: "payment_failures",
      message: "billing_webhook_not_configured",
      props: { status: 503 },
    });
    return NextResponse.json(
      {
        ok: false,
        error:
          "Billing webhook is not configured. Set STRIPE_WEBHOOK_SECRET before enabling payment events.",
      },
      { status: 503 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  const payload = await request.text();

  const verified = verifyStripeWebhookSignature({
    payload,
    signatureHeader: signature,
    secret: process.env.STRIPE_WEBHOOK_SECRET!,
  });

  if (!verified.ok) {
    obs.warn({
      category: "payment_failures",
      message: "billing_webhook_signature_invalid",
      props: { status: 400 },
    });
    return NextResponse.json(
      { ok: false, error: verified.error },
      { status: 400 },
    );
  }

  const applied = await applyVerifiedBillingWebhookPayload(payload);
  if (!applied.ok) {
    obs.error({
      category: "payment_failures",
      message: "billing_webhook_apply_failed",
      props: { status: applied.status },
    });
    return NextResponse.json(
      { ok: false, error: applied.error },
      { status: applied.status },
    );
  }

  obs.info({
    category: "payment_failures",
    message: applied.duplicate
      ? "billing_webhook_duplicate"
      : applied.handled
        ? "billing_webhook_applied"
        : "billing_webhook_ignored",
    props: {
      eventType: applied.eventType.slice(0, 80),
      handled: applied.handled,
      duplicate: applied.duplicate,
    },
  });

  return NextResponse.json({
    ok: true,
    received: true,
    verified: true,
    eventType: applied.eventType,
    handled: applied.handled,
    duplicate: applied.duplicate,
    providerEventId: applied.providerEventId,
  });
}

export const POST = withObservedApi(postHandler);
