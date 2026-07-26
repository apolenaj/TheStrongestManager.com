/**
 * Event-Driven Architecture service — snapshot + queue stats for admin.
 */

import {
  buildEventDrivenSnapshot,
  type EventDrivenSnapshot,
} from "@/domain/event-driven";
import { getDomainEventQueueStats } from "@/services/event-driven/queue";

export {
  enqueueDomainEvent,
  enqueueDomainEventSafe,
  getDomainEventQueueStats,
  flushDomainEventQueueForTests,
  resetDomainEventQueueForTests,
} from "@/services/event-driven/queue";

export function getEventDrivenSnapshot(): EventDrivenSnapshot & {
  queue: ReturnType<typeof getDomainEventQueueStats>;
} {
  return {
    ...buildEventDrivenSnapshot(),
    queue: getDomainEventQueueStats(),
  };
}
