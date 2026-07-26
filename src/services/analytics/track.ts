/**
 * Product analytics track service (Prompt 42).
 * All product events flow through trackProductEvent — never call vendors directly.
 */

import {
  getActiveAnalyticsProvider,
  sanitizeAnalyticsProps,
  type ProductEventName,
  type ProductEventPropsMap,
} from "@/domain/analytics";
import { recordConversionFunnelEvent } from "@/services/conversion-funnel";

export type TrackProductEventResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Emit a catalogued product event after privacy sanitization.
 * Failures are swallowed for callers that use trackProductEventSafe —
 * use this when you need the privacy rejection result (tests / strict paths).
 */
export async function trackProductEvent<N extends ProductEventName>(input: {
  name: N;
  props: ProductEventPropsMap[N];
  userId?: string | null;
}): Promise<TrackProductEventResult> {
  const sanitized = sanitizeAnalyticsProps(
    input.props as unknown as Record<string, unknown>,
  );
  if (!sanitized.ok) {
    return { ok: false, error: sanitized.error };
  }

  const provider = getActiveAnalyticsProvider();
  try {
    await provider.track({
      name: input.name,
      props: sanitized.props,
      userId: input.userId ?? null,
      occurredAt: new Date().toISOString(),
    });
  } catch {
    return { ok: false, error: "Analytics provider failed." };
  }

  recordConversionFunnelEvent(input.name);
  return { ok: true };
}

/**
 * Fire-and-forget for product flows — never blocks signup/workout/etc.
 * Privacy rejections and provider errors are ignored at the call site.
 */
export function trackProductEventSafe<N extends ProductEventName>(input: {
  name: N;
  props: ProductEventPropsMap[N];
  userId?: string | null;
}): void {
  void trackProductEvent(input).catch(() => undefined);
}
