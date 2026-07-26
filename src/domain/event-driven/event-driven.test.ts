import { describe, expect, it, beforeEach } from "vitest";
import {
  DOMAIN_EVENT_CATALOG,
  DOMAIN_EVENT_NAMES,
  EVENT_DRIVEN_HONESTY,
  EVENT_QUEUE_PATH,
  buildEventDedupeKey,
  buildHandlerIdempotencyKey,
  buildEventDrivenSnapshot,
  createIdempotencyLedger,
  handlersForEvent,
} from "@/domain/event-driven";

describe("event-driven architecture", () => {
  it("catalogues prompt example events", () => {
    expect(DOMAIN_EVENT_NAMES).toEqual(
      expect.arrayContaining([
        "technique.analysis_completed",
        "workout.session_completed",
        "strength.pr_achieved",
        "weekly_review.ready",
        "billing.checkout_started",
        "billing.subscription_activated",
        "billing.credits_changed",
      ]),
    );
    expect(DOMAIN_EVENT_CATALOG).toHaveLength(DOMAIN_EVENT_NAMES.length);
    expect(DOMAIN_EVENT_CATALOG.every((e) => e.delivery === "queue")).toBe(
      true,
    );
  });

  it("builds idempotent handler keys", () => {
    const dedupe = buildEventDedupeKey("workout.session_completed", [
      "user1",
      "sess1",
    ]);
    expect(dedupe).toBe("workout.session_completed:user1:sess1");
    expect(
      buildHandlerIdempotencyKey(dedupe, "notify.sync_smart"),
    ).toBe("workout.session_completed:user1:sess1::notify.sync_smart");
    expect(handlersForEvent("strength.pr_achieved")).toContain(
      "notify.sync_smart",
    );
  });

  it("idempotency ledger claims once", () => {
    const ledger = createIdempotencyLedger();
    expect(ledger.claim("a")).toBe(true);
    expect(ledger.claim("a")).toBe(false);
    expect(EVENT_QUEUE_PATH[0]?.phase).toBe(1);
    expect(EVENT_DRIVEN_HONESTY.join(" ")).toMatch(/idempotent/i);
    const snap = buildEventDrivenSnapshot("2026-07-22T00:00:00.000Z");
    expect(snap.catalog.length).toBe(7);
  });
});

describe("event-driven queue adapter", () => {
  beforeEach(async () => {
    const { resetDomainEventQueueForTests } = await import(
      "@/services/event-driven/queue"
    );
    resetDomainEventQueueForTests();
  });

  it("enqueues without blocking and skips duplicate handler work", async () => {
    const {
      enqueueDomainEvent,
      flushDomainEventQueueForTests,
      getDomainEventQueueStats,
    } = await import("@/services/event-driven/queue");

    const first = enqueueDomainEvent({
      name: "billing.checkout_started",
      payload: {
        userId: "u1",
        planId: "pro",
        interval: "month",
      },
      dedupeParts: ["u1", "pro", "month", "once"],
    });
    expect(first.ok).toBe(true);

    enqueueDomainEvent({
      name: "billing.checkout_started",
      payload: {
        userId: "u1",
        planId: "pro",
        interval: "month",
      },
      dedupeParts: ["u1", "pro", "month", "once"],
    });

    await flushDomainEventQueueForTests();
    const stats = getDomainEventQueueStats();
    expect(stats.enqueued).toBe(2);
    expect(stats.skippedIdempotent).toBeGreaterThanOrEqual(1);
    expect(stats.depth).toBe(0);
  });
});
