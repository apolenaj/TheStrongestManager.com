import {
  INSIGHTS_ENGINE_VERSION,
  RAPID_BW_LOSS_KG_PER_WEEK,
  RECOVERY_WORSENING_DELTA,
  TRAINING_VOLUME_DECLINE_PCT,
  type InsightConfidence,
} from "@/domain/insights/constants";
import type {
  CrossDomainSignals,
  InsightProposal,
  InsightsEngineResult,
} from "@/domain/insights/types";

function confidenceFromDomains(
  signals: CrossDomainSignals,
  required: {
    body?: boolean;
    training?: boolean;
    recovery?: boolean;
    nutritionSynced?: boolean;
  },
): InsightConfidence {
  let score = 0;
  if (required.body) {
    if (signals.bodyweightSampleCount >= 5) score += 2;
    else if (signals.bodyweightSampleCount >= 3) score += 1;
  }
  if (required.training) {
    if (
      signals.trainingVolumeTrendPct != null &&
      signals.completedSessionsRecent >= 2
    ) {
      score += 2;
    } else if (signals.completedSessionsRecent >= 1) {
      score += 1;
    }
  }
  if (required.recovery) {
    if (signals.recoverySampleCount >= 4) score += 2;
    else if (signals.recoverySampleCount >= 2) score += 1;
  }
  if (required.nutritionSynced) {
    if (signals.nutritionHasTargets && signals.nutritionHasSummary) score += 2;
    else if (signals.nutritionHasTargets || signals.nutritionHasSummary) {
      score += 1;
    }
  }
  if (score >= 5) return "high";
  if (score >= 3) return "medium";
  return "low";
}

function formatPct(pct: number): string {
  const sign = pct > 0 ? "+" : "";
  return `${sign}${pct}%`;
}

function formatKgWeek(kg: number): string {
  const sign = kg > 0 ? "+" : "";
  return `${sign}${kg} kg/week`;
}

const NO_CALORIE_PRESCRIPTION =
  "Exact calorie changes are not prescribed — synced nutrition targets/intake are not available.";

/**
 * Pure cross-domain insights engine.
 * Deterministic; never mutates programs or invents nutrition numbers.
 */
export function proposeCrossDomainInsights(
  signals: CrossDomainSignals,
): InsightsEngineResult {
  const insights: InsightProposal[] = [];

  const rapidBwLoss =
    signals.bodyweightTrendKgPerWeek != null &&
    signals.bodyweightTrendKgPerWeek <= RAPID_BW_LOSS_KG_PER_WEEK;
  const trainingDeclining =
    (signals.trainingVolumeTrendPct != null &&
      signals.trainingVolumeTrendPct <= TRAINING_VOLUME_DECLINE_PCT) ||
    signals.trainingPerformanceTrend === "down";
  const recoveryWorsening =
    (signals.recoveryReadinessDelta != null &&
      signals.recoveryReadinessDelta <= RECOVERY_WORSENING_DELTA) ||
    (signals.recoveryReadinessRecent != null &&
      signals.recoveryReadinessRecent < 45);

  // Primary example: BW ↓ + training ↓ + recovery ↓
  if (rapidBwLoss && trainingDeclining && recoveryWorsening) {
    const evidence = [
      {
        domain: "body_metrics" as const,
        statement: `Bodyweight trend ≈ ${formatKgWeek(signals.bodyweightTrendKgPerWeek!)} from ${signals.bodyweightSampleCount} logs (rapid decline heuristic).`,
      },
      {
        domain: "training" as const,
        statement:
          signals.trainingVolumeTrendPct != null
            ? `Estimated training volume changed ${formatPct(signals.trainingVolumeTrendPct)} vs the prior window.`
            : `Training performance trend is ${signals.trainingPerformanceTrend}.`,
      },
      {
        domain: "recovery" as const,
        statement:
          signals.recoveryReadinessDelta != null
            ? `Recovery Readiness recent mean shifted ${signals.recoveryReadinessDelta} points vs prior check-ins.`
            : `Recent Recovery Readiness is ${signals.recoveryReadinessRecent}/100.`,
      },
    ];

    const hasNutritionData =
      signals.nutritionHasTargets || signals.nutritionHasSummary;

    insights.push({
      id: "multi_domain_decline_review_recovery_nutrition",
      title: "Review recovery and nutrition intake",
      summary:
        "Your recent trends suggest reviewing recovery and nutrition intake. Multiple domains are moving in a concerning direction together.",
      domains: ["body_metrics", "training", "recovery", "nutrition"],
      evidence,
      confidence: confidenceFromDomains(signals, {
        body: true,
        training: true,
        recovery: true,
        nutritionSynced: hasNutritionData,
      }),
      action: {
        label: hasNutritionData
          ? "Review recovery and nutrition"
          : "Review recovery — check nutrition status",
        href: hasNutritionData ? "/app/nutrition" : "/app/recovery",
        kind: "review",
      },
      nutritionPrescriptionNote: hasNutritionData
        ? "Nutrition sync data is present — still avoid automatic calorie prescriptions; review targets in Mealnexio/context with a coach if needed."
        : NO_CALORIE_PRESCRIPTION,
    });
  }

  // Bodyweight declining without nutrition sync — never invent calories
  if (
    rapidBwLoss &&
    !signals.nutritionHasTargets &&
    !signals.nutritionHasSummary
  ) {
    insights.push({
      id: "bodyweight_decline_insufficient_nutrition_data",
      title: "Bodyweight trend needs nutrition context",
      summary:
        "Bodyweight is trending down quickly, but there is not enough synced nutrition data to recommend exact calorie changes.",
      domains: ["body_metrics", "nutrition"],
      evidence: [
        {
          domain: "body_metrics",
          statement: `Bodyweight trend ≈ ${formatKgWeek(signals.bodyweightTrendKgPerWeek!)} (${signals.bodyweightSampleCount} logs).`,
        },
        {
          domain: "nutrition",
          statement: signals.nutritionSyncFeatureEnabled
            ? "Nutrition sync is enabled but no daily targets/summary were returned."
            : "Mealnexio sync is not live — local bodyweight is not nutrition intake data.",
        },
      ],
      confidence: confidenceFromDomains(signals, { body: true }),
      action: {
        label: "Open nutrition status",
        href: "/app/nutrition",
        kind: "connect",
      },
      nutritionPrescriptionNote: NO_CALORIE_PRESCRIPTION,
    });
  }

  // Recovery worsening under training load
  if (
    recoveryWorsening &&
    signals.completedSessionsRecent >= 2 &&
    !insights.some((i) => i.id === "multi_domain_decline_review_recovery_nutrition")
  ) {
    insights.push({
      id: "recovery_worsening_with_training",
      title: "Recovery signals deserve attention",
      summary:
        "Recovery indicators look weaker while training is still happening. Consider reviewing recovery practices before pushing harder.",
      domains: ["recovery", "training"],
      evidence: [
        {
          domain: "recovery",
          statement:
            signals.recoveryReadinessRecent != null
              ? `Recent Recovery Readiness ≈ ${signals.recoveryReadinessRecent}/100.`
              : "Recovery check-ins suggest a downward trend.",
        },
        {
          domain: "training",
          statement: `${signals.completedSessionsRecent} completed sessions in the recent window.`,
        },
      ],
      confidence: confidenceFromDomains(signals, {
        recovery: true,
        training: true,
      }),
      action: {
        label: "Open recovery",
        href: "/app/recovery",
        kind: "review",
      },
      nutritionPrescriptionNote: null,
    });
  }

  // Training declining while recovery is okay — training review
  if (
    trainingDeclining &&
    !recoveryWorsening &&
    signals.completedSessionsRecent >= 2
  ) {
    insights.push({
      id: "training_decline_review_programming",
      title: "Training trend suggests a programming review",
      summary:
        "Estimated training output looks softer recently while recovery is not clearly the limiting story. Review session quality and plan.",
      domains: ["training"],
      evidence: [
        {
          domain: "training",
          statement:
            signals.trainingVolumeTrendPct != null
              ? `Volume trend ${formatPct(signals.trainingVolumeTrendPct)} vs prior window.`
              : `Performance trend: ${signals.trainingPerformanceTrend}.`,
        },
      ],
      confidence: confidenceFromDomains(signals, { training: true }),
      action: {
        label: "Review today’s training",
        href: "/app/today",
        kind: "review",
      },
      nutritionPrescriptionNote: null,
    });
  }

  // Insufficient multi-domain data — honest empty guidance
  if (insights.length === 0) {
    const thin =
      signals.bodyweightSampleCount < 3 &&
      signals.recoverySampleCount < 2 &&
      signals.completedSessionsRecent < 2;
    if (thin) {
      insights.push({
        id: "insufficient_cross_domain_data",
        title: "Not enough cross-domain data yet",
        summary:
          "Log training, recovery check-ins, and bodyweight to unlock combined insights. Missing domains stay empty — we do not invent them.",
        domains: ["training", "recovery", "body_metrics"],
        evidence: [
          {
            domain: "training",
            statement: `${signals.completedSessionsRecent} recent completed sessions.`,
          },
          {
            domain: "recovery",
            statement: `${signals.recoverySampleCount} recovery check-ins in lookback.`,
          },
          {
            domain: "body_metrics",
            statement: `${signals.bodyweightSampleCount} bodyweight logs in lookback.`,
          },
        ],
        confidence: "low",
        action: {
          label: "Log today’s session or check-in",
          href: "/app/today",
          kind: "log",
        },
        nutritionPrescriptionNote: null,
      });
    }
  }

  return {
    insights,
    signals,
    engineVersion: INSIGHTS_ENGINE_VERSION,
  };
}
