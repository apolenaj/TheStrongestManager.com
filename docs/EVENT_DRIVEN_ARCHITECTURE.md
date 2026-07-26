# Event-Driven Architecture

**Date:** 2026-07-22  
**Prompt:** 154 — Event-Driven Architecture  
**Domain:** `src/domain/event-driven/`  
**Service:** `src/services/event-driven/`  
**Dashboard:** `/app/admin/event-driven` (admin)  
**Flag:** `eventDrivenArchitecture` (`NEXT_PUBLIC_FF_EVENT_DRIVEN_ARCHITECTURE`, default **on**)

---

## Intent

Identify actions that should run as **background domain events** so user requests stay fast:

| Event | Emit after |
| --- | --- |
| `technique.analysis_completed` | `persistMovementReport` |
| `workout.session_completed` | `completeWorkoutSession` |
| `strength.pr_achieved` | `appendPersonalRecord` when `isNewBest` |
| `weekly_review.ready` | `getWeeklyAthleteReview` after upsert |
| `billing.checkout_started` | `tryCreateCheckoutSession` |
| `billing.subscription_activated` | `emitSubscriptionActivatedEvent` |
| `billing.credits_changed` | monthly allocation / credit pack grant |

## Queue architecture

1. **In-process memory queue (now)** — `enqueueDomainEventSafe` → `setImmediate` drain  
2. **Transactional outbox** — same event names, durable across restarts  
3. **External queue (Redis / SQS)** — adapter swap only  

Product analytics (`trackProductEventSafe`) stays separate and already fire-and-forget.

## Idempotent handlers

| Handler | Role |
| --- | --- |
| `notify.sync_smart` | Calls `syncSmartNotifications` (inbox dedupeKey) |
| `billing.ack` | Placeholder for entitlement fan-out |
| `observability.log` | Dev console ack |

Per-handler key: `{event}:{resourceIds}::{handlerId}` via in-memory ledger.

## Related

- Smart notifications: pull-assemble + event-triggered sync  
- Database scale: OLTP stays the source of truth  

## Tests

`src/domain/event-driven/event-driven.test.ts`
