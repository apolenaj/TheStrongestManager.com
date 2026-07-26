/**
 * Pure monthly report assembly — no invented scores.
 */

import {
  MONTHLY_REPORT_ENGINE_VERSION,
  MONTHLY_REPORT_HONESTY,
  MONTHLY_REPORT_SECTION_LABELS,
} from "@/domain/monthly-report/constants";
import { formatMonthRangeLabel } from "@/domain/monthly-report/month";
import type {
  AssembleMonthlyReportInput,
  MonthlyAthleteReportPayload,
  MonthlyMonthSignals,
  MonthlyNextPriorities,
  MonthlyReportSection,
  MonthlyReportSharePayload,
} from "@/domain/monthly-report/types";
import type { ConfidenceLevel } from "@/domain/scoring/types";

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function massDisplay(kg: number, units: "kg" | "lb"): string {
  if (units === "lb") return `${Math.round(kg * 2.2046226218)} lb`;
  return `${round1(kg)} kg`;
}

function deltaSessions(curr: number, prev: number): string | null {
  const d = curr - prev;
  if (d === 0) return "Same as previous month";
  if (d > 0) return `↑ ${d} sessions vs previous month`;
  return `↓ ${Math.abs(d)} sessions vs previous month`;
}

function deltaPct(curr: number | null, prev: number | null): string | null {
  if (curr == null || prev == null) return null;
  if (prev === 0) return curr > 0 ? "↑ from zero previous month" : "Same";
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return "≈ previous month";
  return pct > 0
    ? `↑ ${pct}% vs previous month`
    : `↓ ${Math.abs(pct)}% vs previous month`;
}

function confFromCount(n: number): ConfidenceLevel {
  if (n >= 8) return "high";
  if (n >= 3) return "medium";
  if (n >= 1) return "low";
  return "none";
}

function section(
  id: MonthlyReportSection["id"],
  summary: string,
  thisMonthDisplay: string | null,
  previousMonthDisplay: string | null,
  deltaDisplay: string | null,
  confidence: ConfidenceLevel,
  missingNote: string | null,
): MonthlyReportSection {
  return {
    id,
    label: MONTHLY_REPORT_SECTION_LABELS[id],
    summary,
    thisMonthDisplay,
    previousMonthDisplay,
    deltaDisplay,
    confidence,
    missingNote,
  };
}

function buildNextPriorities(
  thisMonth: MonthlyMonthSignals,
  previousMonth: MonthlyMonthSignals,
): MonthlyNextPriorities {
  const keep: string[] = [];
  const change: string[] = [];
  const watch: string[] = [];

  if (thisMonth.completedSessions >= previousMonth.completedSessions && thisMonth.completedSessions > 0) {
    keep.push("Keep the training rhythm that produced this month’s session count.");
  } else if (thisMonth.completedSessions < 4) {
    change.push("Aim for more completed sessions next month — consistency first.");
  }

  if (thisMonth.techniqueScores.length === 0) {
    watch.push("Log a technique analysis when camera setup allows — none this month.");
  } else {
    const tech = avg(thisMonth.techniqueScores);
    const prev = avg(previousMonth.techniqueScores);
    if (tech != null && prev != null && tech + 2 < prev) {
      change.push("Revisit technique cues — scores trended down vs last month.");
    } else if (tech != null) {
      keep.push("Continue technique check-ins at the current cadence.");
    }
  }

  if (thisMonth.recoveryCheckIns === 0) {
    watch.push("Add recovery check-ins so readiness isn’t missing from next month’s report.");
  }

  if (thisMonth.goals.length === 0) {
    change.push("Set or activate a goal so monthly goal progress has something to track.");
  } else {
    keep.push("Review active goals weekly so next month’s goal progress is clearer.");
  }

  if (keep.length === 0) {
    keep.push("Keep logging sessions with load and reps so strength estimates stay usable.");
  }
  if (change.length === 0) {
    change.push("Pick one weak point from this month and give it deliberate practice next month.");
  }
  if (watch.length === 0) {
    watch.push("Watch recovery and technique when volume rises — don’t invent readiness.");
  }

  return {
    keep: keep.slice(0, 3),
    change: change.slice(0, 3),
    watch: watch.slice(0, 3),
  };
}

export function assembleMonthlyAthleteReport(
  input: AssembleMonthlyReportInput,
): MonthlyAthleteReportPayload {
  const { thisMonth, previousMonth, unitsLabel: units } = input;
  const sections: MonthlyReportSection[] = [];

  // Month summary
  {
    const display =
      thisMonth.completedSessions > 0
        ? `${thisMonth.completedSessions} completed session(s)`
        : null;
    sections.push(
      section(
        "month_summary",
        thisMonth.completedSessions > 0
          ? `Training footprint for ${thisMonth.window.label}.`
          : `Little or no completed training logged in ${thisMonth.window.label}.`,
        display,
        previousMonth.completedSessions > 0
          ? `${previousMonth.completedSessions} completed session(s)`
          : null,
        deltaSessions(
          thisMonth.completedSessions,
          previousMonth.completedSessions,
        ),
        confFromCount(thisMonth.completedSessions),
        thisMonth.completedSessions === 0
          ? "Missing: completed training sessions this month."
          : null,
      ),
    );
  }

  // Progress (bodyweight + session trend)
  {
    const bw = avg(thisMonth.bodyweightKg);
    const prevBw = avg(previousMonth.bodyweightKg);
    sections.push(
      section(
        "progress",
        bw != null
          ? `Bodyweight samples and session progress for the month.`
          : "Progress metrics are thin this month.",
        bw != null ? `Mean bodyweight ${massDisplay(bw, units)}` : null,
        prevBw != null ? `Mean bodyweight ${massDisplay(prevBw, units)}` : null,
        bw != null && prevBw != null
          ? `Bodyweight Δ ${round1(bw - prevBw) >= 0 ? "+" : ""}${round1(bw - prevBw)} kg (observed)`
          : deltaSessions(
              thisMonth.completedSessions,
              previousMonth.completedSessions,
            ),
        bw != null ? confFromCount(thisMonth.bodyweightKg.length) : "low",
        bw == null && thisMonth.completedSessions === 0
          ? "Missing: bodyweight and training progress inputs."
          : bw == null
            ? "Missing: bodyweight entries this month."
            : null,
      ),
    );
  }

  // Best performance
  {
    const lifts = Object.entries(thisMonth.bestE1rmByLift);
    const best =
      lifts.length > 0
        ? lifts.sort((a, b) => b[1] - a[1])[0]
        : null;
    const display = best
      ? `${best[0]} ${massDisplay(best[1], units)} estimated 1RM`
      : thisMonth.prLabels[0] ?? null;
    sections.push(
      section(
        "best_performance",
        display
          ? "Best estimated lifts / PRs from logged work this month."
          : "No estimated max or PR samples this month.",
        display,
        Object.keys(previousMonth.bestE1rmByLift).length > 0
          ? Object.entries(previousMonth.bestE1rmByLift)
              .slice(0, 2)
              .map(([k, v]) => `${k} ${massDisplay(v, units)}`)
              .join(" · ")
          : null,
        thisMonth.prLabels.length > 0
          ? `PRs noted: ${thisMonth.prLabels.slice(0, 3).join("; ")}`
          : null,
        best ? "medium" : "none",
        display == null
          ? "Missing: sets with load/reps or progress-metric PRs."
          : "Estimated 1RM is not a tested max.",
      ),
    );
  }

  // Technique changes
  {
    const tech = avg(thisMonth.techniqueScores);
    const prev = avg(previousMonth.techniqueScores);
    sections.push(
      section(
        "technique_changes",
        tech != null
          ? "Mean Technique Score from scored analyses this month."
          : "No scored technique analyses this month.",
        tech != null
          ? `Mean score ${Math.round(tech)} (${thisMonth.techniqueScores.length} analyses)`
          : null,
        prev != null ? `Previous mean ${Math.round(prev)}` : null,
        deltaPct(tech, prev),
        tech != null ? confFromCount(thisMonth.techniqueScores.length) : "none",
        tech == null
          ? "Missing: scored technique analyses this month."
          : null,
      ),
    );
  }

  // Training volume
  {
    sections.push(
      section(
        "training_volume",
        thisMonth.volumeSetCount > 0
          ? "Logged volume from sets with load and reps."
          : "Volume could not be computed for this month.",
        thisMonth.volumeSetCount > 0
          ? `${massDisplay(thisMonth.volumeKg, units)} across ${thisMonth.volumeSetCount} sets`
          : null,
        previousMonth.volumeSetCount > 0
          ? `${massDisplay(previousMonth.volumeKg, units)} across ${previousMonth.volumeSetCount} sets`
          : null,
        deltaPct(
          thisMonth.volumeSetCount > 0 ? thisMonth.volumeKg : null,
          previousMonth.volumeSetCount > 0 ? previousMonth.volumeKg : null,
        ),
        thisMonth.volumeSetCount > 0
          ? confFromCount(thisMonth.volumeSetCount)
          : "none",
        thisMonth.volumeSetCount === 0
          ? "Missing: set load and reps for volume."
          : null,
      ),
    );
  }

  // Consistency
  {
    const days = thisMonth.trainingDaysWithSession;
    const prevDays = previousMonth.trainingDaysWithSession;
    sections.push(
      section(
        "consistency",
        days > 0
          ? "Days with at least one completed session."
          : "No training days logged this month.",
        days > 0 ? `${days} training day(s)` : null,
        prevDays > 0 ? `${prevDays} training day(s)` : null,
        days > 0 || prevDays > 0
          ? deltaSessions(days, prevDays)?.replace("sessions", "days") ?? null
          : null,
        confFromCount(days),
        days === 0 ? "Missing: completed sessions for consistency." : null,
      ),
    );
  }

  // Goal progress
  {
    const titles = thisMonth.goals.map((g) => g.title);
    sections.push(
      section(
        "goal_progress",
        titles.length > 0
          ? "Active goals on the athlete profile (qualitative — no invented % chance)."
          : "No active goals to report.",
        titles.length > 0 ? titles.slice(0, 4).join("; ") : null,
        previousMonth.goals.length > 0
          ? previousMonth.goals
              .map((g) => g.title)
              .slice(0, 3)
              .join("; ")
          : null,
        null,
        titles.length > 0 ? "medium" : "none",
        titles.length === 0
          ? "Missing: active goals on the athlete profile."
          : "Goal progress is listed, not a probability forecast.",
      ),
    );
  }

  // Next priorities (also mirrored in nextPriorities object)
  const nextPriorities = buildNextPriorities(thisMonth, previousMonth);
  sections.push(
    section(
      "next_priorities",
      "Keep · Change · Watch for the coming month.",
      `Keep: ${nextPriorities.keep[0] ?? "—"}`,
      null,
      null,
      "medium",
      null,
    ),
  );

  const headline =
    thisMonth.prLabels[0] ??
    (thisMonth.completedSessions > 0
      ? `${thisMonth.completedSessions} sessions in ${thisMonth.window.label}`
      : null);

  return {
    engineVersion: MONTHLY_REPORT_ENGINE_VERSION,
    month: {
      monthKey: thisMonth.window.monthKey,
      monthStartIso: thisMonth.window.monthStart.toISOString(),
      monthEndIso: thisMonth.window.monthEnd.toISOString(),
      rangeLabel: formatMonthRangeLabel(thisMonth.window),
      label: thisMonth.window.label,
      inProgress: thisMonth.window.inProgress,
    },
    previousMonthKey: previousMonth.window.monthKey,
    sections,
    headline,
    nextPriorities,
    honesty: MONTHLY_REPORT_HONESTY,
  };
}

/** Frozen public-safe share snapshot. */
export function buildMonthlyReportSharePayload(input: {
  athleteDisplayName: string;
  report: MonthlyAthleteReportPayload;
}): MonthlyReportSharePayload {
  const highlights = input.report.sections
    .filter((s) => s.thisMonthDisplay && s.id !== "next_priorities")
    .slice(0, 5)
    .map((s) => `${s.label}: ${s.thisMonthDisplay}`);

  return {
    athleteDisplayName: input.athleteDisplayName,
    monthLabel: input.report.month.label,
    monthKey: input.report.month.monthKey,
    headline: input.report.headline,
    highlights,
    honestyNote: MONTHLY_REPORT_HONESTY[3],
    engineVersion: input.report.engineVersion,
  };
}
