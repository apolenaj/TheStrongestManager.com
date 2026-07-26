import { NextResponse } from "next/server";
import { featureFlags } from "@/config/feature-flags";
import {
  PROGRAM_AUDIT_CLAIM_LIMIT,
  PROGRAM_AUDIT_CLAIM_WINDOW_MS,
  PROGRAM_AUDIT_TICKET_TTL_SECONDS,
} from "@/domain/program-audit";
import { rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { claimProgramAuditTicket } from "@/services/program-audit";

export const runtime = "nodejs";

/**
 * Claim a short-lived guest ticket for the free program audit.
 * Rate-limited by IP. Does not accept program text — analysis stays in-browser.
 */
export async function POST(request: Request) {
  if (!featureFlags.programAudit) {
    return NextResponse.json(
      { ok: false, error: "Program audit is not enabled." },
      { status: 404 },
    );
  }

  const limited = rateLimit(
    clientKeyFromRequest(request, "program-audit-claim"),
    {
      limit: PROGRAM_AUDIT_CLAIM_LIMIT,
      windowMs: PROGRAM_AUDIT_CLAIM_WINDOW_MS,
    },
  );

  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Free audit rate limit reached. Try again in ${limited.retryAfterSeconds}s, or create an account for Training Audit in the app.`,
        retryAfterSeconds: limited.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  try {
    const { token, payload } = claimProgramAuditTicket();
    return NextResponse.json({
      ok: true,
      token,
      expiresAt: payload.exp,
      ttlSeconds: PROGRAM_AUDIT_TICKET_TTL_SECONDS,
      remaining: limited.remaining,
      privacy:
        "Program text is not uploaded with this claim. Basic audit runs in your browser.",
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not issue an audit ticket. Server signing secret may be missing.",
      },
      { status: 503 },
    );
  }
}
