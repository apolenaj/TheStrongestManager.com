import { NextResponse } from "next/server";
import { featureFlags } from "@/config/feature-flags";
import {
  TECHNIQUE_CHECK_CLAIM_LIMIT,
  TECHNIQUE_CHECK_CLAIM_WINDOW_MS,
  TECHNIQUE_CHECK_TICKET_TTL_SECONDS,
} from "@/domain/technique-check";
import { rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { claimTechniqueCheckTicket } from "@/services/technique-check";

export const runtime = "nodejs";

/**
 * Claim a short-lived guest ticket for the free technique check.
 * Rate-limited by IP. Does not accept video — analysis stays in-browser.
 */
export async function POST(request: Request) {
  if (!featureFlags.techniqueCheck) {
    return NextResponse.json(
      { ok: false, error: "Technique check is not enabled." },
      { status: 404 },
    );
  }

  const limited = rateLimit(
    clientKeyFromRequest(request, "technique-check-claim"),
    {
      limit: TECHNIQUE_CHECK_CLAIM_LIMIT,
      windowMs: TECHNIQUE_CHECK_CLAIM_WINDOW_MS,
    },
  );

  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Free check rate limit reached. Try again in ${limited.retryAfterSeconds}s, or create an account to analyze privately in the app.`,
        retryAfterSeconds: limited.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  try {
    const { token, payload } = claimTechniqueCheckTicket();
    return NextResponse.json({
      ok: true,
      token,
      expiresAt: payload.exp,
      ttlSeconds: TECHNIQUE_CHECK_TICKET_TTL_SECONDS,
      remaining: limited.remaining,
      privacy:
        "Video is not uploaded with this claim. Analysis runs in your browser only.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not issue a check ticket. Server signing secret may be missing.",
      },
      { status: 503 },
    );
  }
}
