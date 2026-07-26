/**
 * In-process domain event queue (Prompt 154).
 * Enqueue never awaits handlers — setImmediate defers work off the request.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  buildEventDedupeKey,
  buildHandlerIdempotencyKey,
  createIdempotencyLedger,
  handlersForEvent,
  type DomainEventEnvelope,
  type DomainEventName,
  type DomainEventPayloadMap,
  type DomainHandlerId,
  type IdempotencyLedger,
} from "@/domain/event-driven";

export type HandlerResult =
  | { ok: true; skipped?: boolean }
  | { ok: false; error: string };

export type DomainEventHandler = (
  envelope: DomainEventEnvelope,
) => Promise<HandlerResult>;

type QueueStats = {
  enqueued: number;
  processed: number;
  skippedIdempotent: number;
  failed: number;
  depth: number;
};

const ledger: IdempotencyLedger = createIdempotencyLedger();
const pending: DomainEventEnvelope[] = [];
let draining = false;

const stats: QueueStats = {
  enqueued: 0,
  processed: 0,
  skippedIdempotent: 0,
  failed: 0,
  depth: 0,
};

const handlers: Record<DomainHandlerId, DomainEventHandler> = {
  "notify.sync_smart": async (envelope) => {
    const userId = (envelope.payload as { userId?: string }).userId;
    if (!userId) return { ok: false, error: "userId required" };
    if (!featureFlags.smartNotifications) {
      return { ok: true, skipped: true };
    }
    const { syncSmartNotifications } = await import(
      "@/services/notifications/notification-service"
    );
    const result = await syncSmartNotifications({ userId });
    if (!result.ok) {
      // Prefer soft-skip when flag/profile missing — not a hard failure retry storm.
      return { ok: true, skipped: true };
    }
    return { ok: true };
  },
  "billing.ack": async (envelope) => {
    // Placeholder for entitlement fan-out once Stripe webhook applies state.
    const { obs } = await import("@/services/observability/logger");
    obs.debug({
      category: "background_jobs",
      message: "billing_ack",
      props: { eventName: envelope.name },
    });
    return { ok: true };
  },
  "observability.log": async (envelope) => {
    const { obs } = await import("@/services/observability/logger");
    obs.info({
      category: "background_jobs",
      message: "domain_event_handled",
      props: {
        eventName: envelope.name,
        // Opaque dedupe only — no payload fields.
        dedupeKey: envelope.dedupeKey.slice(0, 120),
      },
    });
    return { ok: true };
  },
};

async function runHandler(
  handlerId: DomainHandlerId,
  envelope: DomainEventEnvelope,
): Promise<void> {
  const idemKey = buildHandlerIdempotencyKey(envelope.dedupeKey, handlerId);
  if (!ledger.claim(idemKey)) {
    stats.skippedIdempotent += 1;
    return;
  }
  try {
    const result = await handlers[handlerId](envelope);
    if (!result.ok) {
      stats.failed += 1;
      const { obs } = await import("@/services/observability/logger");
      obs.error({
        category: "background_jobs",
        message: "domain_handler_failed",
        props: {
          handlerId,
          eventName: envelope.name,
          dedupeKey: envelope.dedupeKey.slice(0, 120),
          error: result.error.slice(0, 80),
        },
      });
      return;
    }
    if (result.skipped) {
      stats.skippedIdempotent += 1;
    } else {
      stats.processed += 1;
    }
  } catch {
    stats.failed += 1;
    const { obs } = await import("@/services/observability/logger");
    obs.error({
      category: "background_jobs",
      message: "domain_handler_exception",
      props: {
        handlerId,
        eventName: envelope.name,
        dedupeKey: envelope.dedupeKey.slice(0, 120),
      },
    });
  }
}

async function drainQueue(): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    while (pending.length > 0) {
      const envelope = pending.shift()!;
      stats.depth = pending.length;
      const ids = handlersForEvent(envelope.name);
      for (const handlerId of ids) {
        await runHandler(handlerId, envelope);
      }
    }
  } finally {
    draining = false;
    stats.depth = pending.length;
  }
}

function scheduleDrain(): void {
  if (typeof setImmediate === "function") {
    setImmediate(() => {
      void drainQueue();
    });
  } else {
    setTimeout(() => {
      void drainQueue();
    }, 0);
  }
}

/**
 * Enqueue a domain event for background handlers.
 * Returns immediately — does not await handler execution.
 */
export function enqueueDomainEvent<N extends DomainEventName>(input: {
  name: N;
  payload: DomainEventPayloadMap[N];
  /** Opaque parts composing the emit dedupe key (resource ids). */
  dedupeParts: readonly string[];
}): { ok: true; dedupeKey: string } | { ok: false; error: string } {
  if (!featureFlags.eventDrivenArchitecture) {
    return { ok: false, error: "Event-driven architecture is not enabled." };
  }

  const dedupeKey = buildEventDedupeKey(input.name, input.dedupeParts);
  const envelope: DomainEventEnvelope<N> = {
    name: input.name,
    payload: input.payload,
    occurredAt: new Date().toISOString(),
    dedupeKey,
  };

  pending.push(envelope as DomainEventEnvelope);
  stats.enqueued += 1;
  stats.depth = pending.length;
  scheduleDrain();
  return { ok: true, dedupeKey };
}

/** Fire-and-forget — never blocks callers; ignores flag-off and enqueue errors. */
export function enqueueDomainEventSafe<N extends DomainEventName>(input: {
  name: N;
  payload: DomainEventPayloadMap[N];
  dedupeParts: readonly string[];
}): void {
  try {
    enqueueDomainEvent(input);
  } catch {
    // never throw into product flows
  }
}

export function getDomainEventQueueStats(): QueueStats & {
  idempotencySize: number;
} {
  return {
    ...stats,
    depth: pending.length,
    idempotencySize: ledger.size(),
  };
}

/** Test helper — clear ledger + stats. */
export function resetDomainEventQueueForTests(): void {
  ledger.clear();
  pending.length = 0;
  draining = false;
  stats.enqueued = 0;
  stats.processed = 0;
  stats.skippedIdempotent = 0;
  stats.failed = 0;
  stats.depth = 0;
}

/** Test helper — process pending synchronously. */
export async function flushDomainEventQueueForTests(): Promise<void> {
  await drainQueue();
}
