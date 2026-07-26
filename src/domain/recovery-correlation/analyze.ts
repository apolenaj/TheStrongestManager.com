/**
 * Derive recovery ↔ performance insights with sample gates.
 */

import {
  RECOVERY_CORR_NOT_CAUSAL,
  RECOVERY_CORR_OBSERVED_LABEL,
  RECOVERY_CORR_SLEEP_LOW_HOURS,
  RECOVERY_CORR_SORENESS_HIGH,
  RECOVERY_CORR_STRESS_HIGH,
  RECOVERY_CORRELATION_ENGINE_VERSION,
  RECOVERY_CORRELATION_HONESTY,
} from "@/domain/recovery-correlation/constants";
import {
  canPublishRecoveryCorrelation,
  insufficientSampleReason,
} from "@/domain/recovery-correlation/gate";
import type {
  RecoveryCorrelationAnalysis,
  RecoveryCorrelationInsight,
  RecoveryWeekBucket,
} from "@/domain/recovery-correlation/types";

function meanOf(
  weeks: RecoveryWeekBucket[],
  pick: (w: RecoveryWeekBucket) => number | null,
): number | null {
  const values = weeks
    .map(pick)
    .filter((n): n is number => n != null && Number.isFinite(n));
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function formatRpe(n: number | null): string | null {
  if (n == null) return null;
  return n.toFixed(1);
}

function buildArmInsight(input: {
  id: string;
  weeksWithBothSignals: number;
  condition: RecoveryWeekBucket[];
  comparison: RecoveryWeekBucket[];
  headlineWhenHigher: string;
  headlineWhenLower: string;
  headlineWhenSimilar: string;
  detailTemplate: (cond: string, other: string) => string;
}): RecoveryCorrelationInsight {
  const conditionWeekCount = input.condition.length;
  const comparisonWeekCount = input.comparison.length;
  const publishable = canPublishRecoveryCorrelation({
    conditionWeekCount,
    comparisonWeekCount,
    weeksWithBothSignals: input.weeksWithBothSignals,
  });

  const condRpe = meanOf(input.condition, (w) => w.sessionRpeMean);
  const otherRpe = meanOf(input.comparison, (w) => w.sessionRpeMean);

  if (!publishable) {
    return {
      id: input.id,
      associationLabel: RECOVERY_CORR_OBSERVED_LABEL,
      causalityLabel: RECOVERY_CORR_NOT_CAUSAL,
      headline: "Insufficient data for this association",
      detail: insufficientSampleReason({
        conditionWeekCount,
        comparisonWeekCount,
        weeksWithBothSignals: input.weeksWithBothSignals,
      }),
      publishable: false,
      conditionWeekCount,
      comparisonWeekCount,
      conditionMetricDisplay: null,
      comparisonMetricDisplay: null,
      suppressedReason: insufficientSampleReason({
        conditionWeekCount,
        comparisonWeekCount,
        weeksWithBothSignals: input.weeksWithBothSignals,
      }),
    };
  }

  let headline = input.headlineWhenSimilar;
  if (condRpe != null && otherRpe != null) {
    const delta = condRpe - otherRpe;
    if (delta >= 0.3) headline = input.headlineWhenHigher;
    else if (delta <= -0.3) headline = input.headlineWhenLower;
  }

  return {
    id: input.id,
    associationLabel: RECOVERY_CORR_OBSERVED_LABEL,
    causalityLabel: RECOVERY_CORR_NOT_CAUSAL,
    headline,
    detail: input.detailTemplate(
      formatRpe(condRpe) ?? "—",
      formatRpe(otherRpe) ?? "—",
    ),
    publishable: true,
    conditionWeekCount,
    comparisonWeekCount,
    conditionMetricDisplay: formatRpe(condRpe),
    comparisonMetricDisplay: formatRpe(otherRpe),
    suppressedReason: null,
  };
}

/**
 * Analyze weekly recovery vs performance associations.
 * Only publishable insights clear sample thresholds.
 */
export function analyzeRecoveryCorrelations(
  weeks: RecoveryWeekBucket[],
): RecoveryCorrelationAnalysis {
  const withBoth = weeks.filter(
    (w) =>
      w.sessionRpeMean != null &&
      (w.sleepHoursMean != null ||
        w.stressMean != null ||
        w.sorenessMean != null),
  );

  const missingNotes: string[] = [];
  if (withBoth.length < 6) {
    missingNotes.push(
      "Log recovery check-ins and session RPE across more weeks to unlock associations.",
    );
  }

  const sleepLow = withBoth.filter(
    (w) =>
      w.sleepHoursMean != null &&
      w.sleepHoursMean < RECOVERY_CORR_SLEEP_LOW_HOURS &&
      w.sessionRpeMean != null,
  );
  const sleepOk = withBoth.filter(
    (w) =>
      w.sleepHoursMean != null &&
      w.sleepHoursMean >= RECOVERY_CORR_SLEEP_LOW_HOURS &&
      w.sessionRpeMean != null,
  );

  const stressHigh = withBoth.filter(
    (w) =>
      w.stressMean != null &&
      w.stressMean >= RECOVERY_CORR_STRESS_HIGH &&
      w.sessionRpeMean != null,
  );
  const stressOk = withBoth.filter(
    (w) =>
      w.stressMean != null &&
      w.stressMean < RECOVERY_CORR_STRESS_HIGH &&
      w.sessionRpeMean != null,
  );

  const soreHigh = withBoth.filter(
    (w) =>
      w.sorenessMean != null &&
      w.sorenessMean >= RECOVERY_CORR_SORENESS_HIGH &&
      w.sessionRpeMean != null,
  );
  const soreOk = withBoth.filter(
    (w) =>
      w.sorenessMean != null &&
      w.sorenessMean < RECOVERY_CORR_SORENESS_HIGH &&
      w.sessionRpeMean != null,
  );

  const insights: RecoveryCorrelationInsight[] = [
    buildArmInsight({
      id: "sleep_low_vs_rpe",
      weeksWithBothSignals: withBoth.length,
      condition: sleepLow,
      comparison: sleepOk,
      headlineWhenHigher: `On weeks where you reported <${RECOVERY_CORR_SLEEP_LOW_HOURS} hours sleep, average session RPE was higher.`,
      headlineWhenLower: `On weeks where you reported <${RECOVERY_CORR_SLEEP_LOW_HOURS} hours sleep, average session RPE was lower.`,
      headlineWhenSimilar: `On weeks where you reported <${RECOVERY_CORR_SLEEP_LOW_HOURS} hours sleep, average session RPE was similar to better-slept weeks.`,
      detailTemplate: (cond, other) =>
        `Low-sleep weeks avg RPE ${cond} vs ${other} on other weeks (${sleepLow.length} vs ${sleepOk.length} weeks).`,
    }),
    buildArmInsight({
      id: "stress_high_vs_rpe",
      weeksWithBothSignals: withBoth.length,
      condition: stressHigh,
      comparison: stressOk,
      headlineWhenHigher:
        "On weeks with higher reported stress, average session RPE was higher.",
      headlineWhenLower:
        "On weeks with higher reported stress, average session RPE was lower.",
      headlineWhenSimilar:
        "On weeks with higher reported stress, average session RPE was similar to lower-stress weeks.",
      detailTemplate: (cond, other) =>
        `High-stress weeks avg RPE ${cond} vs ${other} on other weeks (${stressHigh.length} vs ${stressOk.length} weeks).`,
    }),
    buildArmInsight({
      id: "soreness_high_vs_rpe",
      weeksWithBothSignals: withBoth.length,
      condition: soreHigh,
      comparison: soreOk,
      headlineWhenHigher:
        "On weeks with higher reported soreness, average session RPE was higher.",
      headlineWhenLower:
        "On weeks with higher reported soreness, average session RPE was lower.",
      headlineWhenSimilar:
        "On weeks with higher reported soreness, average session RPE was similar to lower-soreness weeks.",
      detailTemplate: (cond, other) =>
        `High-soreness weeks avg RPE ${cond} vs ${other} on other weeks (${soreHigh.length} vs ${soreOk.length} weeks).`,
    }),
  ];

  return {
    engineVersion: RECOVERY_CORRELATION_ENGINE_VERSION,
    weekCount: weeks.length,
    weeksWithBothSignals: withBoth.length,
    insights,
    suppressedCount: insights.filter((i) => !i.publishable).length,
    missingNotes,
    honesty: RECOVERY_CORRELATION_HONESTY,
  };
}
