import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { ATHLETE_ASSESSMENT_TICKET_TTL_SECONDS } from "@/domain/athlete-assessment/constants";
import {
  isAthleteAssessmentTicketPayload,
  type AthleteAssessmentTicketPayload,
} from "@/domain/athlete-assessment/ticket";

function signingSecret(): string {
  const secret =
    process.env.AUTH_SECRET ?? process.env.TECHNIQUE_MEDIA_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET (or TECHNIQUE_MEDIA_SECRET) is required for athlete-assessment tickets.",
    );
  }
  return secret;
}

export function createAthleteAssessmentTicket(
  ttlSeconds = ATHLETE_ASSESSMENT_TICKET_TTL_SECONDS,
): { token: string; payload: AthleteAssessmentTicketPayload } {
  const payload: AthleteAssessmentTicketPayload = {
    tid: randomBytes(16).toString("hex"),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    scope: "athlete_assessment",
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", signingSecret())
    .update(body)
    .digest("base64url");
  return { token: `${body}.${sig}`, payload };
}

export function verifyAthleteAssessmentTicket(
  token: string,
): AthleteAssessmentTicketPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = createHmac("sha256", signingSecret())
    .update(body)
    .digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as unknown;
    if (!isAthleteAssessmentTicketPayload(payload)) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
