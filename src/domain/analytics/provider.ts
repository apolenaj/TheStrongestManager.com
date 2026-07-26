/**
 * Analytics provider abstraction (Prompt 42).
 * Vendor SDKs (PostHog, etc.) register here when configured — never invent delivery.
 */

import type { ProductEventName } from "@/domain/analytics/events";

export type AnalyticsProviderStatus =
  | "noop"
  | "console"
  | "memory"
  | "ready";

export type AnalyticsTrackInput = {
  name: ProductEventName;
  props: Record<string, unknown>;
  userId?: string | null;
  /** ISO timestamp set by the track service. */
  occurredAt: string;
};

export type AnalyticsProviderAdapter = {
  id: string;
  label: string;
  status: AnalyticsProviderStatus;
  track: (input: AnalyticsTrackInput) => void | Promise<void>;
};

export const noopAnalyticsAdapter: AnalyticsProviderAdapter = {
  id: "noop",
  label: "No-op",
  status: "noop",
  track() {
    /* intentional no-op until a vendor adapter is registered */
  },
};

export const consoleAnalyticsAdapter: AnalyticsProviderAdapter = {
  id: "console",
  label: "Console",
  status: "console",
  track(input) {
    // Dev / local observability only — never log forbidden props (already sanitized).
    console.info("[analytics]", input.name, {
      userId: input.userId ?? null,
      props: input.props,
      occurredAt: input.occurredAt,
    });
  },
};

/** In-memory sink for unit tests. */
export function createMemoryAnalyticsAdapter(): AnalyticsProviderAdapter & {
  events: AnalyticsTrackInput[];
  clear: () => void;
} {
  const events: AnalyticsTrackInput[] = [];
  return {
    id: "memory",
    label: "Memory",
    status: "memory",
    events,
    clear() {
      events.length = 0;
    },
    track(input) {
      events.push({ ...input, props: { ...input.props } });
    },
  };
}

const registry: AnalyticsProviderAdapter[] = [];

function defaultAdapter(): AnalyticsProviderAdapter {
  const env = process.env.ANALYTICS_ADAPTER?.trim().toLowerCase();
  if (env === "console") return consoleAnalyticsAdapter;
  if (env === "noop") return noopAnalyticsAdapter;
  // Local/dev defaults to console for visibility; production stays silent until configured.
  if (process.env.NODE_ENV === "production") return noopAnalyticsAdapter;
  return consoleAnalyticsAdapter;
}

export function listAnalyticsProviders(): AnalyticsProviderAdapter[] {
  return registry.length > 0 ? [...registry] : [defaultAdapter()];
}

export function getActiveAnalyticsProvider(): AnalyticsProviderAdapter {
  const ready = registry.find((p) => p.status === "ready");
  if (ready) return ready;
  if (registry.length > 0) return registry[registry.length - 1]!;
  return defaultAdapter();
}

export function registerAnalyticsProvider(
  adapter: AnalyticsProviderAdapter,
): void {
  if (registry.some((p) => p.id === adapter.id)) {
    throw new Error(`Analytics provider already registered: ${adapter.id}`);
  }
  registry.push(adapter);
}

export function resetAnalyticsProvidersForTests(): void {
  registry.length = 0;
}
