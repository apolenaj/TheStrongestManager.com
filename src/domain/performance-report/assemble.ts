/**
 * Pure assembly of a Performance Report — no DB, no invented scores.
 */

import {
  DEFAULT_PERFORMANCE_REPORT_DAYS,
  PERFORMANCE_REPORT_ENGINE_VERSION,
  PERFORMANCE_REPORT_HONESTY,
  PERFORMANCE_REPORT_SECTION_LABELS,
} from "@/domain/performance-report/constants";
import type {
  PerformanceReportMetric,
  PerformanceReportPayload,
  PerformanceReportPeriod,
  PerformanceReportSection,
  PerformanceReportSignals,
} from "@/domain/performance-report/types";

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function massDisplay(kg: number, units: "kg" | "lb"): string {
  if (units === "lb") {
    return `${Math.round(kg * 2.2046226218)} lb`;
  }
  return `${round1(kg)} kg`;
}

function formatDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function buildPerformanceReportPeriod(input: {
  from: Date;
  to: Date;
}): PerformanceReportPeriod {
  const from = new Date(input.from);
  const to = new Date(input.to);
  const ms = Math.max(0, to.getTime() - from.getTime());
  const dayCount = Math.max(1, Math.round(ms / (24 * 60 * 60 * 1000)));
  return {
    fromIso: formatDay(from),
    toIso: formatDay(to),
    label: `${formatDay(from)} → ${formatDay(to)} (${dayCount} day${dayCount === 1 ? "" : "s"})`,
    dayCount,
  };
}

export function defaultPerformanceReportWindow(now = new Date()): {
  from: Date;
  to: Date;
} {
  const to = new Date(now);
  const from = new Date(now);
  from.setUTCDate(from.getUTCDate() - DEFAULT_PERFORMANCE_REPORT_DAYS);
  return { from, to };
}

function section(
  id: PerformanceReportSection["id"],
  summary: string,
  metrics: PerformanceReportMetric[],
  missingData: string | null,
  bullets: string[] = [],
): PerformanceReportSection {
  return {
    id,
    title: PERFORMANCE_REPORT_SECTION_LABELS[id],
    summary,
    metrics,
    missingData,
    bullets,
  };
}

export function assemblePerformanceReport(
  signals: PerformanceReportSignals,
): PerformanceReportPayload {
  const { unitsLabel: units } = signals;

  const overviewMetrics: PerformanceReportMetric[] = [
    {
      label: "Primary discipline",
      value: signals.overview.primaryDiscipline,
      kind: signals.overview.primaryDiscipline ? "reported" : "missing",
      note: signals.overview.primaryDiscipline
        ? null
        : "Not set on athlete profile",
    },
    {
      label: "Experience level",
      value: signals.overview.experienceLevel,
      kind: signals.overview.experienceLevel ? "reported" : "missing",
    },
    {
      label: "Active goals",
      value:
        signals.overview.activeGoals.length > 0
          ? signals.overview.activeGoals.slice(0, 3).join("; ")
          : null,
      kind: signals.overview.activeGoals.length > 0 ? "reported" : "missing",
      note:
        signals.overview.activeGoals.length === 0
          ? "No active goals in profile"
          : null,
    },
  ];

  const e1rmEntries = Object.entries(signals.strength.bestE1rmByLiftKg);
  const strengthMetrics: PerformanceReportMetric[] = e1rmEntries
    .slice(0, 6)
    .map(([lift, kg]) => ({
      label: `${lift} estimated 1RM`,
      value: massDisplay(kg, units),
      kind: "estimated" as const,
      note: "From logged load × reps — not a tested max",
    }));
  if (strengthMetrics.length === 0) {
    strengthMetrics.push({
      label: "Estimated 1RM samples",
      value: null,
      kind: "missing",
      note: "Need completed sets with load and reps",
    });
  }
  strengthMetrics.push({
    label: "Sets with load logged",
    value: String(signals.strength.setCountWithLoad),
    kind: signals.strength.setCountWithLoad > 0 ? "observed" : "missing",
  });

  const techAvg = avg(signals.technique.scoredAnalyses);
  const techniqueMetrics: PerformanceReportMetric[] = [
    {
      label: "Technique analyses in period",
      value: String(signals.technique.analysisCount),
      kind: signals.technique.analysisCount > 0 ? "observed" : "missing",
    },
    {
      label: "Mean Technique Score",
      value: techAvg != null ? String(Math.round(techAvg)) : null,
      kind: techAvg != null ? "observed" : "missing",
      note:
        techAvg == null
          ? "No scored analyses in this period"
          : "Mean of scored analyses only — unscored uploads excluded",
    },
  ];

  const trainingMetrics: PerformanceReportMetric[] = [
    {
      label: "Completed sessions",
      value: String(signals.training.completedSessions),
      kind: signals.training.completedSessions > 0 ? "observed" : "missing",
    },
    {
      label: "Skipped sessions",
      value: String(signals.training.skippedSessions),
      kind: "observed",
    },
    {
      label: "Logged training volume",
      value:
        signals.training.volumeSetCount > 0
          ? `${massDisplay(signals.training.volumeKg, units)} · ${signals.training.volumeSetCount} sets`
          : null,
      kind: signals.training.volumeSetCount > 0 ? "observed" : "missing",
      note:
        signals.training.volumeSetCount === 0
          ? "Volume requires load and reps on sets"
          : null,
    },
  ];

  const readyAvg = avg(signals.recovery.readinessScores);
  const recoveryMetrics: PerformanceReportMetric[] = [
    {
      label: "Recovery check-ins",
      value: String(signals.recovery.checkInCount),
      kind: signals.recovery.checkInCount > 0 ? "observed" : "missing",
    },
    {
      label: "Mean readiness",
      value: readyAvg != null ? round1(readyAvg).toFixed(1) : null,
      kind: readyAvg != null ? "reported" : "missing",
      note:
        readyAvg == null
          ? "No readiness scores logged in period"
          : "Athlete-reported readiness — not a clinical measure",
    },
  ];

  const bwAvg = avg(signals.progress.bodyweightKgSamples);
  const progressMetrics: PerformanceReportMetric[] = [
    {
      label: "Progress metrics logged",
      value:
        signals.progress.metricLabels.length > 0
          ? signals.progress.metricLabels.slice(0, 5).join(", ")
          : null,
      kind: signals.progress.metricLabels.length > 0 ? "observed" : "missing",
    },
    {
      label: "Mean bodyweight (period)",
      value: bwAvg != null ? massDisplay(bwAvg, units) : null,
      kind: bwAvg != null ? "observed" : "missing",
    },
  ];

  const recMetrics: PerformanceReportMetric[] = [
    {
      label: "Stored recommendations",
      value:
        signals.recommendations.titles.length > 0
          ? String(signals.recommendations.titles.length)
          : null,
      kind: signals.recommendations.titles.length > 0 ? "observed" : "missing",
      note:
        signals.recommendations.titles.length === 0
          ? "No pending recommendations in this period"
          : null,
    },
  ];

  const sections: PerformanceReportSection[] = [
    section(
      "athlete_overview",
      signals.overview.primaryDiscipline
        ? `Profile snapshot for ${signals.athleteDisplayName}.`
        : `Profile snapshot for ${signals.athleteDisplayName}. Some profile fields are unset.`,
      overviewMetrics,
      overviewMetrics.some((m) => m.kind === "missing")
        ? "Complete discipline, experience, and goals for a fuller overview."
        : null,
    ),
    section(
      "strength",
      e1rmEntries.length > 0
        ? "Best estimated 1RMs from logged sets in the data period."
        : "No strength estimates available for this period.",
      strengthMetrics,
      e1rmEntries.length === 0
        ? "Missing: completed sets with load and reps for major lifts."
        : null,
      e1rmEntries.length > 0
        ? ["All 1RM figures on this report are estimated, not tested maxes."]
        : [],
    ),
    section(
      "technique",
      signals.technique.analysisCount > 0
        ? "Technique analyses completed in the data period."
        : "No technique analyses in this period.",
      techniqueMetrics,
      signals.technique.analysisCount === 0
        ? "Missing: technique video analyses with scores."
        : techAvg == null
          ? "Analyses exist but none have an overall Technique Score yet."
          : null,
    ),
    section(
      "training",
      signals.training.completedSessions > 0
        ? "Training sessions and volume logged in the data period."
        : "No completed sessions in this period.",
      trainingMetrics,
      signals.training.completedSessions === 0
        ? "Missing: completed training sessions."
        : signals.training.volumeSetCount === 0
          ? "Sessions logged but volume incomplete (load/reps missing)."
          : null,
    ),
    section(
      "recovery",
      signals.recovery.checkInCount > 0
        ? "Recovery check-ins reported in the data period."
        : "No recovery check-ins in this period.",
      recoveryMetrics,
      signals.recovery.checkInCount === 0
        ? "Missing: recovery / readiness check-ins."
        : null,
      signals.recovery.checkInCount > 0
        ? ["Readiness is athlete-reported — not a medical assessment."]
        : [],
    ),
    section(
      "progress",
      signals.progress.metricLabels.length > 0 || bwAvg != null
        ? "Progress metrics and bodyweight samples in the data period."
        : "No progress metrics in this period.",
      progressMetrics,
      signals.progress.metricLabels.length === 0 && bwAvg == null
        ? "Missing: progress metrics and bodyweight entries."
        : null,
    ),
    section(
      "key_recommendations",
      signals.recommendations.titles.length > 0
        ? "Recommendations stored for this athlete (not auto-applied)."
        : "No stored recommendations to list for this period.",
      recMetrics,
      signals.recommendations.titles.length === 0
        ? "Missing: coach or system recommendations in this window."
        : null,
      signals.recommendations.titles.slice(0, 8),
    ),
  ];

  const estimatedMetricLabels = sections
    .flatMap((s) => s.metrics)
    .filter((m) => m.kind === "estimated" && m.value != null)
    .map((m) => m.label);

  const missingDataNotes = sections
    .map((s) => s.missingData)
    .filter((n): n is string => Boolean(n));

  return {
    engineVersion: PERFORMANCE_REPORT_ENGINE_VERSION,
    branding: signals.branding,
    athleteDisplayName: signals.athleteDisplayName,
    period: signals.period,
    generatedAtIso: signals.now.toISOString(),
    sections,
    estimatedMetricLabels,
    missingDataNotes,
    honesty: PERFORMANCE_REPORT_HONESTY,
  };
}
