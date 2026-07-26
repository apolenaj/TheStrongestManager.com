import { createHmac, timingSafeEqual } from "node:crypto";
import { TECHNIQUE_SIGNED_URL_TTL_SECONDS } from "@/domain/technique/constants";

function signingSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.TECHNIQUE_MEDIA_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET (or TECHNIQUE_MEDIA_SECRET) is required for signed media URLs.");
  }
  return secret;
}

export type MediaAccessTokenPayload = {
  analysisId: string;
  userId: string;
  exp: number;
};

export function createMediaAccessToken(
  analysisId: string,
  userId: string,
  ttlSeconds = TECHNIQUE_SIGNED_URL_TTL_SECONDS,
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = Buffer.from(
    JSON.stringify({ analysisId, userId, exp } satisfies MediaAccessTokenPayload),
  ).toString("base64url");
  const sig = createHmac("sha256", signingSecret()).update(body).digest("base64url");
  return `${body}.${sig}`;
}

export function verifyMediaAccessToken(
  token: string,
): MediaAccessTokenPayload | null {
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
    ) as MediaAccessTokenPayload;
    if (
      typeof payload.analysisId !== "string" ||
      typeof payload.userId !== "string" ||
      typeof payload.exp !== "number"
    ) {
      return null;
    }
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function buildSignedMediaPath(
  analysisId: string,
  userId: string,
): string {
  const token = createMediaAccessToken(analysisId, userId);
  return `/api/technique/analyses/${analysisId}/media?token=${encodeURIComponent(token)}`;
}
