/**
 * Order status machine + athlete timeline.
 */

import {
  HUMAN_ANALYSIS_ORDER_STATUS_LABELS,
  type HumanAnalysisOrderStatus,
} from "@/domain/human-analysis/constants";

const ALLOWED_TRANSITIONS: Record<
  HumanAnalysisOrderStatus,
  readonly HumanAnalysisOrderStatus[]
> = {
  awaiting_purchase: ["purchased", "awaiting_upload", "queued", "canceled"],
  purchased: ["awaiting_upload", "queued", "canceled", "refunded"],
  awaiting_upload: ["queued", "canceled", "refunded"],
  queued: ["in_review", "canceled", "refunded"],
  in_review: ["report_ready", "queued", "refunded"],
  report_ready: ["refunded"],
  canceled: [],
  refunded: [],
};

export function canTransitionHumanAnalysisStatus(
  from: HumanAnalysisOrderStatus,
  to: HumanAnalysisOrderStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export type HumanAnalysisTimelineStep = {
  status: HumanAnalysisOrderStatus;
  label: string;
  state: "done" | "current" | "upcoming" | "skipped";
};

const FLOW_STEPS: HumanAnalysisOrderStatus[] = [
  "awaiting_purchase",
  "purchased",
  "awaiting_upload",
  "queued",
  "in_review",
  "report_ready",
];

/**
 * Athlete-facing progress for Purchase → Upload → Queue → Review → Report.
 */
export function buildHumanAnalysisTimeline(
  status: HumanAnalysisOrderStatus,
): HumanAnalysisTimelineStep[] {
  if (status === "canceled" || status === "refunded") {
    const skipped: HumanAnalysisTimelineStep[] = FLOW_STEPS.map((s) => ({
      status: s,
      label: HUMAN_ANALYSIS_ORDER_STATUS_LABELS[s],
      state: "skipped" as const,
    }));
    return [
      ...skipped,
      {
        status,
        label: HUMAN_ANALYSIS_ORDER_STATUS_LABELS[status],
        state: "current" as const,
      },
    ];
  }

  // purchased may skip awaiting_upload when artifacts already attached → queued
  const currentIndex = FLOW_STEPS.indexOf(status);

  return FLOW_STEPS.map((s, i) => {
    let state: HumanAnalysisTimelineStep["state"] = "upcoming";
    if (i < currentIndex) state = "done";
    else if (i === currentIndex) state = "current";
    // If already queued without lingering on upload, mark upload done
    if (
      status !== "awaiting_upload" &&
      status !== "awaiting_purchase" &&
      status !== "purchased" &&
      s === "awaiting_upload" &&
      currentIndex > FLOW_STEPS.indexOf("awaiting_upload")
    ) {
      state = "done";
    }
    return {
      status: s,
      label: HUMAN_ANALYSIS_ORDER_STATUS_LABELS[s],
      state,
    };
  });
}

/** After payment, land on upload unless artifacts already linked. */
export function nextStatusAfterPurchase(hasArtifacts: boolean): Extract<
  HumanAnalysisOrderStatus,
  "awaiting_upload" | "queued"
> {
  return hasArtifacts ? "queued" : "awaiting_upload";
}
