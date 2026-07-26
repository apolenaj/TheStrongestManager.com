import { CORRELATION_HEADER } from "@/domain/observability/constants";

/** Generate a correlation id (cuid-like compact random). */
export function createCorrelationId(): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 20)
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return `corr_${rand}`;
}

/**
 * Accept inbound x-correlation-id when well-formed; otherwise mint a new one.
 */
export function resolveCorrelationId(
  headerValue: string | null | undefined,
): string {
  if (
    headerValue &&
    /^[\w.-]{8,64}$/.test(headerValue) &&
    !headerValue.includes("@")
  ) {
    return headerValue;
  }
  return createCorrelationId();
}

export function correlationHeaderName(): typeof CORRELATION_HEADER {
  return CORRELATION_HEADER;
}
