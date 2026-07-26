/**
 * Event-Driven Architecture — background domain events (Prompt 154).
 * Queue where appropriate; never block user requests; idempotent handlers.
 */

export const EVENT_DRIVEN_ENGINE_VERSION = "event_driven.v1" as const;

export const EVENT_DRIVEN_HONESTY = [
  "Domain events are not product analytics — analytics stays in trackProductEventSafe.",
  "v1 uses an in-process memory queue (deferred). Swap to Redis/SQS/outbox without changing event names.",
  "Handlers must be idempotent via stable idempotency keys — retries and duplicate emits are expected.",
] as const;

/** Canonical domain event names — suitable for background processing. */
export const DOMAIN_EVENT_NAMES = [
  "technique.analysis_completed",
  "workout.session_completed",
  "strength.pr_achieved",
  "weekly_review.ready",
  "billing.checkout_started",
  "billing.subscription_activated",
  "billing.credits_changed",
] as const;

export type DomainEventName = (typeof DOMAIN_EVENT_NAMES)[number];

export type DomainEventPayloadMap = {
  "technique.analysis_completed": {
    userId: string;
    analysisId: string;
    athleteProfileId?: string;
  };
  "workout.session_completed": {
    userId: string;
    sessionId: string;
    athleteProfileId?: string;
  };
  "strength.pr_achieved": {
    userId: string;
    liftId: string;
    metricKey: string;
  };
  "weekly_review.ready": {
    userId: string;
    weekKey: string;
    reviewId: string;
  };
  "billing.checkout_started": {
    userId: string;
    planId: string;
    interval: string;
  };
  "billing.subscription_activated": {
    userId: string;
    planId: string;
    fromPlanId?: string;
  };
  "billing.credits_changed": {
    userId: string;
    reason: string;
    delta: number;
  };
};

export type DomainHandlerId =
  | "notify.sync_smart"
  | "billing.ack"
  | "observability.log";

export type DomainEventCatalogEntry = {
  name: DomainEventName;
  label: string;
  /** Why this should not run inline on the request path. */
  whyBackground: string;
  /** Emit after successful commit in these services. */
  emitAfter: string;
  handlers: readonly DomainHandlerId[];
  /** Queue vs inline — queue for side effects that can wait. */
  delivery: "queue" | "inline_ok";
};

export const DOMAIN_EVENT_CATALOG: readonly DomainEventCatalogEntry[] = [
  {
    name: "technique.analysis_completed",
    label: "Technique analysis completed",
    whyBackground:
      "Notification sync and future moat scratch must not delay the analysis response.",
    emitAfter: "persistMovementReport (after status=completed)",
    handlers: ["notify.sync_smart", "observability.log"],
    delivery: "queue",
  },
  {
    name: "workout.session_completed",
    label: "Workout completed",
    whyBackground:
      "Achievements / notify refresh can follow; session lock must return immediately.",
    emitAfter: "completeWorkoutSession (post lockSessionPrescription)",
    handlers: ["notify.sync_smart", "observability.log"],
    delivery: "queue",
  },
  {
    name: "strength.pr_achieved",
    label: "PR achieved",
    whyBackground:
      "Inbox pr_achieved candidates assemble via sync — keep appendPersonalRecord fast.",
    emitAfter: "appendPersonalRecord when isNewBest",
    handlers: ["notify.sync_smart", "observability.log"],
    delivery: "queue",
  },
  {
    name: "weekly_review.ready",
    label: "Weekly review ready",
    whyBackground:
      "Notify weekly_review_ready without blocking the review page render path longer than needed.",
    emitAfter: "getWeeklyAthleteReview after upsert",
    handlers: ["notify.sync_smart", "observability.log"],
    delivery: "queue",
  },
  {
    name: "billing.checkout_started",
    label: "Billing checkout started",
    whyBackground:
      "Entitlement side-effects and audits belong off the checkout redirect path.",
    emitAfter: "tryCreateCheckoutSession",
    handlers: ["billing.ack", "observability.log"],
    delivery: "queue",
  },
  {
    name: "billing.subscription_activated",
    label: "Billing subscription activated",
    whyBackground:
      "Webhook / provider confirmation must acknowledge without long request work.",
    emitAfter: "emitSubscriptionActivatedEvent",
    handlers: ["billing.ack", "observability.log"],
    delivery: "queue",
  },
  {
    name: "billing.credits_changed",
    label: "Billing credits changed",
    whyBackground:
      "Ledger writes stay sync; fan-out (notify/audit) is queued with credit-tx idempotency.",
    emitAfter: "grantCreditPack / ensureMonthlyAllocation when balance changes",
    handlers: ["billing.ack", "observability.log"],
    delivery: "queue",
  },
] as const;

export type QueueArchitecturePhase = {
  id: string;
  phase: number;
  title: string;
  detail: string;
};

/** Explicit queue evolution — memory first, durable later. */
export const EVENT_QUEUE_PATH: readonly QueueArchitecturePhase[] = [
  {
    id: "phase1_memory",
    phase: 1,
    title: "In-process memory queue (now)",
    detail:
      "enqueueDomainEventSafe defers handlers via setImmediate. Lost on process restart — acceptable for notify sync retries on next page load.",
  },
  {
    id: "phase2_outbox",
    phase: 2,
    title: "Transactional outbox",
    detail:
      "Persist DomainEvent rows in the same DB transaction as the write; worker drains outbox. Same event names and idempotency keys.",
  },
  {
    id: "phase3_external",
    phase: 3,
    title: "External queue (Redis / SQS)",
    detail:
      "Swap adapter only. Handlers remain idempotent. Do not invent a second event catalog.",
  },
] as const;
