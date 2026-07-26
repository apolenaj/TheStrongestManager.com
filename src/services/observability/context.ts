import { AsyncLocalStorage } from "node:async_hooks";
import {
  createCorrelationId,
  type ObservabilityCategory,
  type ObservabilityLevel,
} from "@/domain/observability";

export type ObservabilityContext = {
  correlationId: string;
  route?: string;
};

const storage = new AsyncLocalStorage<ObservabilityContext>();

export function getObservabilityContext(): ObservabilityContext | undefined {
  return storage.getStore();
}

export function getCorrelationId(): string {
  return storage.getStore()?.correlationId ?? createCorrelationId();
}

export function runWithObservabilityContext<T>(
  ctx: ObservabilityContext,
  fn: () => T,
): T {
  return storage.run(ctx, fn);
}

export type ObservabilityRecord = {
  at: string;
  level: ObservabilityLevel;
  category: ObservabilityCategory;
  message: string;
  correlationId: string;
  props: Record<string, unknown>;
};

const RING_MAX = 100;
const ring: ObservabilityRecord[] = [];

export function pushObservabilityRecord(record: ObservabilityRecord): void {
  ring.push(record);
  while (ring.length > RING_MAX) ring.shift();
}

export function listRecentObservabilityRecords(): readonly ObservabilityRecord[] {
  return [...ring];
}

export function clearObservabilityRingForTests(): void {
  ring.length = 0;
}

export function observabilityRingStats(): {
  size: number;
  byCategory: Record<string, number>;
  byLevel: Record<string, number>;
} {
  const byCategory: Record<string, number> = {};
  const byLevel: Record<string, number> = {};
  for (const r of ring) {
    byCategory[r.category] = (byCategory[r.category] ?? 0) + 1;
    byLevel[r.level] = (byLevel[r.level] ?? 0) + 1;
  }
  return { size: ring.length, byCategory, byLevel };
}
