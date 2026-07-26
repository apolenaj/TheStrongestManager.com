import {
  DOMAIN_EVENT_CATALOG,
  DOMAIN_EVENT_NAMES,
  EVENT_DRIVEN_ENGINE_VERSION,
  EVENT_DRIVEN_HONESTY,
  EVENT_QUEUE_PATH,
  type DomainEventName,
  type DomainEventPayloadMap,
  type DomainHandlerId,
} from "@/domain/event-driven/constants";

export type DomainEventEnvelope<N extends DomainEventName = DomainEventName> = {
  name: N;
  payload: DomainEventPayloadMap[N];
  /** ISO timestamp when the producer committed. */
  occurredAt: string;
  /** Stable key for the whole emit (before per-handler suffix). */
  dedupeKey: string;
};

/** Build a stable emit dedupe key from opaque resource ids. */
export function buildEventDedupeKey(
  name: DomainEventName,
  parts: readonly string[],
): string {
  return `${name}:${parts.filter(Boolean).join(":")}`;
}

/** Per-handler idempotency key — retries must not double-apply. */
export function buildHandlerIdempotencyKey(
  dedupeKey: string,
  handlerId: DomainHandlerId,
): string {
  return `${dedupeKey}::${handlerId}`;
}

export function handlersForEvent(
  name: DomainEventName,
): readonly DomainHandlerId[] {
  return (
    DOMAIN_EVENT_CATALOG.find((e) => e.name === name)?.handlers ?? [
      "observability.log",
    ]
  );
}

export type EventDrivenSnapshot = {
  engineVersion: typeof EVENT_DRIVEN_ENGINE_VERSION;
  catalog: typeof DOMAIN_EVENT_CATALOG;
  eventNames: typeof DOMAIN_EVENT_NAMES;
  queuePath: typeof EVENT_QUEUE_PATH;
  honesty: typeof EVENT_DRIVEN_HONESTY;
  generatedAt: string;
};

export function buildEventDrivenSnapshot(
  generatedAt: string = new Date().toISOString(),
): EventDrivenSnapshot {
  return {
    engineVersion: EVENT_DRIVEN_ENGINE_VERSION,
    catalog: DOMAIN_EVENT_CATALOG,
    eventNames: DOMAIN_EVENT_NAMES,
    queuePath: EVENT_QUEUE_PATH,
    honesty: EVENT_DRIVEN_HONESTY,
    generatedAt,
  };
}

/** In-memory idempotency ledger for tests / process lifetime. */
export function createIdempotencyLedger(maxEntries = 5000) {
  const seen = new Set<string>();
  const order: string[] = [];

  return {
    /** @returns true if this is the first claim (should run). */
    claim(key: string): boolean {
      if (seen.has(key)) return false;
      seen.add(key);
      order.push(key);
      while (order.length > maxEntries) {
        const old = order.shift();
        if (old) seen.delete(old);
      }
      return true;
    },
    has(key: string): boolean {
      return seen.has(key);
    },
    size(): number {
      return seen.size;
    },
    clear(): void {
      seen.clear();
      order.length = 0;
    },
  };
}

export type IdempotencyLedger = ReturnType<typeof createIdempotencyLedger>;
