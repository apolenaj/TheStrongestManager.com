/**
 * Funnel math + drop-off identification (Prompt 162).
 */

import {
  CONVERSION_FUNNEL_MIN_TOP_FOR_RATES,
  CONVERSION_FUNNEL_STAGES,
  type ConversionFunnelStageId,
} from "@/domain/conversion-funnel/constants";

export type FunnelStageCountInput = {
  stageId: ConversionFunnelStageId;
  count: number;
  source: "live_event" | "durable_user" | "merged";
};

export type FunnelStageRow = {
  stageId: ConversionFunnelStageId;
  label: string;
  count: number;
  source: FunnelStageCountInput["source"];
  /** Share of top-of-funnel count (0–1). */
  pctOfTop: number | null;
  /** Conversion from previous stage (0–1). */
  pctOfPrevious: number | null;
  /** Absolute drop from previous stage. */
  dropOffCount: number | null;
  /** Relative drop from previous (0–1). */
  dropOffRate: number | null;
  /** Bar width 0–100 for visualization (vs top). */
  barWidthPct: number;
};

export type FunnelDropOff = {
  fromStageId: ConversionFunnelStageId;
  toStageId: ConversionFunnelStageId;
  fromLabel: string;
  toLabel: string;
  lost: number;
  dropOffRate: number | null;
  /** Rank 1 = largest absolute loss. */
  rankByAbsolute: number;
};

export type ConversionFunnelSummary = {
  stages: FunnelStageRow[];
  dropOffs: FunnelDropOff[];
  topCount: number;
  decisionReady: boolean;
  largestDropOff: FunnelDropOff | null;
  note: string;
};

export function summarizeConversionFunnel(
  counts: readonly FunnelStageCountInput[],
): ConversionFunnelSummary {
  const byId = new Map(counts.map((c) => [c.stageId, c]));
  const ordered = CONVERSION_FUNNEL_STAGES.map((stage) => {
    const row = byId.get(stage.id);
    return {
      stage,
      count: Math.max(0, row?.count ?? 0),
      source: row?.source ?? stage.evidence,
    };
  });

  const topCount = ordered[0]?.count ?? 0;
  const decisionReady = topCount >= CONVERSION_FUNNEL_MIN_TOP_FOR_RATES;

  const stages: FunnelStageRow[] = ordered.map((item, index) => {
    const prev = index > 0 ? ordered[index - 1]! : null;
    const pctOfTop =
      topCount === 0 ? null : Math.min(1, item.count / topCount);
    const pctOfPrevious =
      !prev || prev.count === 0 ? null : Math.min(1, item.count / prev.count);
    const dropOffCount =
      prev == null ? null : Math.max(0, prev.count - item.count);
    const dropOffRate =
      dropOffCount == null || !prev || prev.count === 0
        ? null
        : dropOffCount / prev.count;

    return {
      stageId: item.stage.id,
      label: item.stage.label,
      count: item.count,
      source: item.source,
      pctOfTop,
      pctOfPrevious,
      dropOffCount,
      dropOffRate,
      barWidthPct:
        topCount === 0 || item.count === 0
          ? 0
          : Math.max(2, Math.round((item.count / topCount) * 100)),
    };
  });

  const rawDropOffs: Omit<FunnelDropOff, "rankByAbsolute">[] = [];
  for (let i = 1; i < stages.length; i++) {
    const from = stages[i - 1]!;
    const to = stages[i]!;
    rawDropOffs.push({
      fromStageId: from.stageId,
      toStageId: to.stageId,
      fromLabel: from.label,
      toLabel: to.label,
      lost: to.dropOffCount ?? 0,
      dropOffRate: to.dropOffRate,
    });
  }

  const sorted = [...rawDropOffs].sort((a, b) => b.lost - a.lost);
  const dropOffs: FunnelDropOff[] = sorted.map((d, i) => ({
    ...d,
    rankByAbsolute: i + 1,
  }));

  return {
    stages,
    dropOffs,
    topCount,
    decisionReady,
    largestDropOff: dropOffs[0] ?? null,
    note: decisionReady
      ? `Top-of-funnel n=${topCount} meets the ≥${CONVERSION_FUNNEL_MIN_TOP_FOR_RATES} sample gate for rate decisions.`
      : `Top-of-funnel n=${topCount} is under the ≥${CONVERSION_FUNNEL_MIN_TOP_FOR_RATES} sample gate — treat conversion rates as directional only.`,
  };
}

/** Map a product event name to a funnel stage (if any). */
export function funnelStageForEvent(
  eventName: string,
): ConversionFunnelStageId | null {
  for (const stage of CONVERSION_FUNNEL_STAGES) {
    if ((stage.events as readonly string[]).includes(eventName)) {
      return stage.id;
    }
  }
  return null;
}
