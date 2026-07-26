/**
 * Guest claim tickets for Free Technique Check (Prompt 169).
 */

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import {
  TECHNIQUE_CHECK_TICKET_TTL_SECONDS,
} from "@/domain/technique-check/constants";
import {
  isTechniqueCheckTicketPayload,
  type TechniqueCheckTicketPayload,
} from "@/domain/technique-check/ticket";

function signingSecret(): string {
  const secret =
    process.env.AUTH_SECRET ?? process.env.TECHNIQUE_MEDIA_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET (or TECHNIQUE_MEDIA_SECRET) is required for technique-check tickets.",
    );
  }
  return secret;
}

export function createTechniqueCheckTicket(
  ttlSeconds = TECHNIQUE_CHECK_TICKET_TTL_SECONDS,
): { token: string; payload: TechniqueCheckTicketPayload } {
  const payload: TechniqueCheckTicketPayload = {
    tid: randomBytes(16).toString("hex"),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    scope: "technique_check",
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", signingSecret())
    .update(body)
    .digest("base64url");
  return { token: `${body}.${sig}`, payload };
}

export function verifyTechniqueCheckTicket(
  token: string,
): TechniqueCheckTicketPayload | null {
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
    if (!isTechniqueCheckTicketPayload(payload)) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
