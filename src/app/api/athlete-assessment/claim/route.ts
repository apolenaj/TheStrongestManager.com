import { NextResponse } from "next/server";
import { featureFlags } from "@/config/feature-flags";
import {
  ATHLETE_ASSESSMENT_CLAIM_LIMIT,
  ATHLETE_ASSESSMENT_CLAIM_WINDOW_MS,
  ATHLETE_ASSESSMENT_TICKET_TTL_SECONDS,
} from "@/domain/athlete-assessment";
import { rateLimit } from "@/lib/rate-limit";
import { clientKeyFromRequest } from "@/lib/request-client-key";
import { claimAthleteAssessmentTicket } from "@/services/athlete-assessment";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!featureFlags.athleteAssessment) {
    return NextResponse.json(
      { ok: false, error: "Athlete assessment is not enabled." },
      { status: 404 },
    );
  }

  const limited = rateLimit(
    clientKeyFromRequest(request, "athlete-assessment-claim"),
    {
      limit: ATHLETE_ASSESSMENT_CLAIM_LIMIT,
      windowMs: ATHLETE_ASSESSMENT_CLAIM_WINDOW_MS,
    },
  );

  if (!limited.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: `Free assessment rate limit reached. Try again in ${limited.retryAfterSeconds}s, or create an account for a real data-driven Athlete Score.`,
        retryAfterSeconds: limited.retryAfterSeconds,
      },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  try {
    const { token, payload } = claimAthleteAssessmentTicket();
    return NextResponse.json({
      ok: true,
      token,
      expiresAt: payload.exp,
      ttlSeconds: ATHLETE_ASSESSMENT_TICKET_TTL_SECONDS,
      remaining: limited.remaining,
      privacy:
        "Answers are not uploaded with this claim. Partial profile builds in your browser.",
      labels: {
        selfAssessment: "Self-assessment estimate",
        notFullScore: "Not full Athlete Score",
      },
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not issue an assessment ticket. Server signing secret may be missing.",
      },
      { status: 503 },
    );
  }
}
