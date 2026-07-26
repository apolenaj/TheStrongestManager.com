/**
 * Conversion Funnel service — live counters + durable cohort (Prompt 162).
 */

import {
  CONVERSION_FUNNEL_DEFAULT_COHORT_DAYS,
  CONVERSION_FUNNEL_STAGES,
  buildConversionFunnelSnapshot,
  funnelStageForEvent,
  type ConversionFunnelSnapshot,
  type ConversionFunnelStageId,
  type FunnelStageCountInput,
} from "@/domain/conversion-funnel";
import { prisma } from "@/lib/db";

const liveCounts = new Map<ConversionFunnelStageId, number>();

function bumpLive(stageId: ConversionFunnelStageId): void {
  liveCounts.set(stageId, (liveCounts.get(stageId) ?? 0) + 1);
}

/** Called from trackProductEvent after a successful funnel-mapped emit. */
export function recordConversionFunnelEvent(eventName: string): void {
  const stage = funnelStageForEvent(eventName);
  if (stage) bumpLive(stage);
}

export function getLiveConversionFunnelCounts(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const stage of CONVERSION_FUNNEL_STAGES) {
    out[stage.id] = liveCounts.get(stage.id) ?? 0;
  }
  return out;
}

export function resetConversionFunnelCountersForTests(): void {
  liveCounts.clear();
}

const PAID_PLANS = ["pro", "performance", "elite_coaching"] as const;

/**
 * Unique-user durable counts for signup → paid (cohort window).
 */
export async function loadDurableFunnelCounts(
  cohortDays: number = CONVERSION_FUNNEL_DEFAULT_COHORT_DAYS,
): Promise<Record<ConversionFunnelStageId, number>> {
  const since = new Date(Date.now() - cohortDays * 24 * 60 * 60 * 1000);

  const [signup, onboarding, firstValue, paid] = await Promise.all([
    prisma.user.count({
      where: {
        isDemoAccount: false,
        isAthlete: true,
        createdAt: { gte: since },
        athleteProfile: { isNot: null },
      },
    }),
    prisma.user.count({
      where: {
        isDemoAccount: false,
        isAthlete: true,
        createdAt: { gte: since },
        athleteProfile: { onboardingCompletedAt: { not: null } },
      },
    }),
    prisma.user.count({
      where: {
        isDemoAccount: false,
        isAthlete: true,
        createdAt: { gte: since },
        athleteProfile: {
          OR: [
            {
              trainingSessions: {
                some: { status: "completed", completedAt: { not: null } },
              },
            },
            {
              techniqueAnalyses: {
                some: { deletedAt: null },
              },
            },
          ],
        },
      },
    }),
    prisma.user.count({
      where: {
        isDemoAccount: false,
        isAthlete: true,
        createdAt: { gte: since },
        subscription: {
          plan: { in: [...PAID_PLANS] },
          status: { in: ["active", "trialing", "past_due"] },
        },
      },
    }),
  ]);

  return {
    homepage: 0,
    signup,
    onboarding,
    first_value: firstValue,
    pricing: 0,
    checkout: 0,
    paid,
  };
}

function mergeStageCounts(
  live: Record<string, number>,
  durable: Record<ConversionFunnelStageId, number>,
): FunnelStageCountInput[] {
  return CONVERSION_FUNNEL_STAGES.map((stage) => {
    if (stage.evidence === "live_event") {
      return {
        stageId: stage.id,
        count: live[stage.id] ?? 0,
        source: "live_event" as const,
      };
    }
    const durableCount = durable[stage.id] ?? 0;
    const liveCount = live[stage.id] ?? 0;
    // Prefer durable unique users; fall back to live if DB empty.
    if (durableCount > 0) {
      return {
        stageId: stage.id,
        count: durableCount,
        source: "durable_user" as const,
      };
    }
    return {
      stageId: stage.id,
      count: liveCount,
      source: liveCount > 0 ? ("merged" as const) : ("durable_user" as const),
    };
  });
}

export async function getConversionFunnelSnapshot(
  cohortDays: number = CONVERSION_FUNNEL_DEFAULT_COHORT_DAYS,
): Promise<ConversionFunnelSnapshot> {
  const live = getLiveConversionFunnelCounts();
  const durable = await loadDurableFunnelCounts(cohortDays);
  return buildConversionFunnelSnapshot({
    cohortDays,
    stageCounts: mergeStageCounts(live, durable),
    liveCounts: live,
    durableCounts: durable,
  });
}
