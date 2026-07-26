import { headers } from "next/headers";

/**
 * Best-effort client IP for rate limiting.
 * Prefer platform-forwarded headers; fall back to a stable anonymous key.
 */
export async function getRequestClientKey(
  prefix: string,
): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const realIp = h.get("x-real-ip");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    "unknown";
  return `${prefix}:${ip}`;
}

export function clientKeyFromRequest(
  request: Request,
  prefix: string,
  userId?: string | null,
): string {
  if (userId) return `${prefix}:user:${userId}`;
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    realIp?.trim() ||
    "unknown";
  return `${prefix}:ip:${ip}`;
}
