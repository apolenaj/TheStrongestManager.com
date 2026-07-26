import {
  WEEKLY_REVIEW_ENGINE_VERSION,
  WEEKLY_REVIEW_HONESTY,
} from "@/domain/weekly-review/constants";
import type {
  AssembleWeeklyReviewInput,
  WeeklyAthleteReviewPayload,
  WeeklyNextWeekPlan,
  WeeklyReviewSection,
  WeeklyWeekSignals,
} from "@/domain/weekly-review/types";
import { formatWeekRangeLabel } from "@/domain/weekly-review/week";
import type { ConfidenceLevel } from "@/domain/scoring/types";

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function adherencePct(s: WeeklyWeekSignals): number | null {
  const denom = s.programLinkedCompleted + s.skippedProgramSessions;
  if (denom === 0) return null;
  return Math.round((100 * s.programLinkedCompleted) / denom);
}

function massDisplay(kg: number, units: "kg" | "lb"): string {
  if (units === "lb") {
    return `${Math.round(kg * 2.2046226218)} lb`;
  }
  return `${round1(kg)} kg`;
}

function deltaSessions(curr: number, prev: number): string | null {
  const d = curr - prev;
  if (d === 0) return "Same as previous week";
  if (d > 0) return `↑ ${d} vs previous week`;
  return `↓ ${Math.abs(d)} vs previous week`;
}

function deltaPct(curr: number | null, prev: number | null): string | null {
  if (curr == null || prev == null) return null;
  if (prev === 0) return curr > 0 ? "↑ from zero previous week" : "Same";
  const pct = Math.round(((curr - prev) / prev) * 100);
  if (pct === 0) return "≈ previous week";
  return pct > 0 ? `↑ ${pct}% vs previous week` : `↓ ${Math.abs(pct)}% vs previous week`;
}

function strengthSummary(
  thisWeek: WeeklyWeekSignals,
  previousWeek: WeeklyWeekSignals,
  units: "kg" | "lb",
): { summary: string; display: string | null; prev: string | null; delta: string | null; confidence: ConfidenceLevel; missing: string | null } {
  const lifts = Object.keys({
    ...thisWeek.bestE1rmByLift,
    ...previousWeek.bestE1rmByLift,
  });
  if (lifts.length === 0) {
    return {
      summary: "No estimated 1RM samples from logged sets this week.",
      display: null,
      prev: null,
      delta: null,
      confidence: "none",
      missing: "Completed sets with load and reps",
    };
  }

  let bestLift: string | null = null;
  let bestDelta = -Infinity;
  const parts: string[] = [];
  for (const lift of lifts) {
    const curr = thisWeek.bestE1rmByLift[lift];
    const prev = previousWeek.bestE1rmByLift[lift];
    if (curr != null) {
      parts.push(`${lift} ${massDisplay(curr, units)}`);
    }
    if (curr != null && prev != null) {
      const d = curr - prev;
      if (d > bestDelta) {
        bestDelta = d;
        bestLift = lift;
      }
    }
  }

  const display = parts.slice(0, 3).join(" · ") || null;
  const prevParts = Object.entries(previousWeek.bestE1rmByLift)
    .slice(0, 3)
    .map(([k, v]) => `${k} ${massDisplay(v, units)}`);
  const prevDisplay = prevParts.length ? prevParts.join(" · ") : null;

  if (bestLift != null && bestDelta > 0.5) {
    return {
      summary: `Best week-over-week e1RM move: ${bestLift} (${bestDelta > 0 ? "+" : ""}${round1(bestDelta)} kg estimated).`,
      display,
      prev: prevDisplay,
      delta: `↑ ${round1(bestDelta)} kg e1RM on ${bestLift}`,
      confidence: "low",
      missing: null,
    };
  }
  if (bestLift != null && bestDelta < -0.5) {
    return {
      summary: `Estimated 1RM dipped on ${bestLift} vs previous week — treat as noise until more sets land.`,
      display,
      prev: prevDisplay,
      delta: `↓ ${round1(Math.abs(bestDelta))} kg e1RM on ${bestLift}`,
      confidence: "low",
      missing: null,
    };
  }
  return {
    summary: display
      ? "Estimated 1RM samples on file; no clear week-over-week lift change."
      : "Insufficient overlapping lifts to compare strength week-over-week.",
    display,
    prev: prevDisplay,
    delta: null,
    confidence: display ? "low" : "none",
    missing: display ? null : "Sets on the same lifts across both weeks",
  };
}

/**
 * Assemble a concise weekly review from two week signal bags.
 * Never invents missing recovery/strength conclusions.
 */
export function assembleWeeklyAthleteReview(
  input: AssembleWeeklyReviewInput,
): WeeklyAthleteReviewPayload {
  const { thisWeek, previousWeek, now, unitsLabel } = input;
  const inProgress = now < thisWeek.window.weekEnd;

  const sections: WeeklyReviewSection[] = [];

  // Training completed
  sections.push({
    id: "trainingCompleted",
    label: "Training completed",
    summary:
      thisWeek.completedSessions === 0
        ? "No completed sessions logged this week."
        : `${thisWeek.completedSessions} completed session(s) logged.`,
    thisWeekDisplay: `${thisWeek.completedSessions} sessions`,
    previousWeekDisplay: `${previousWeek.completedSessions} sessions`,
    deltaDisplay: deltaSessions(
      thisWeek.completedSessions,
      previousWeek.completedSessions,
    ),
    confidence: thisWeek.completedSessions > 0 ? "high" : "none",
    missingNote:
      thisWeek.completedSessions === 0 ? "Completed training sessions" : null,
  });

  // Program adherence
  const adh = adherencePct(thisWeek);
  const adhPrev = adherencePct(previousWeek);
  sections.push({
    id: "programAdherence",
    label: "Program adherence",
    summary:
      adh == null
        ? "No program-linked completed or skipped sessions this week — adherence not measurable."
        : `Program-linked adherence ${adh}% (${thisWeek.programLinkedCompleted} completed / ${thisWeek.programLinkedCompleted + thisWeek.skippedProgramSessions} scheduled).`,
    thisWeekDisplay: adh != null ? `${adh}%` : null,
    previousWeekDisplay: adhPrev != null ? `${adhPrev}%` : null,
    deltaDisplay: deltaPct(adh, adhPrev),
    confidence: adh != null ? "medium" : "none",
    missingNote:
      adh == null ? "Program-linked sessions (completed or skipped)" : null,
  });

  // Strength
  const strength = strengthSummary(thisWeek, previousWeek, unitsLabel);
  sections.push({
    id: "strengthChanges",
    label: "Strength changes",
    summary: strength.summary,
    thisWeekDisplay: strength.display,
    previousWeekDisplay: strength.prev,
    deltaDisplay: strength.delta,
    confidence: strength.confidence,
    missingNote: strength.missing,
  });

  // Volume
  const volDelta = deltaPct(thisWeek.volumeKg, previousWeek.volumeKg);
  sections.push({
    id: "volume",
    label: "Volume",
    summary:
      thisWeek.volumeSetCount === 0
        ? "No sets with both load and reps — weekly tonnage unavailable."
        : `Logged tonnage about ${massDisplay(thisWeek.volumeKg, unitsLabel)}·reps across ${thisWeek.volumeSetCount} sets.`,
    thisWeekDisplay:
      thisWeek.volumeSetCount > 0
        ? massDisplay(thisWeek.volumeKg, unitsLabel)
        : null,
    previousWeekDisplay:
      previousWeek.volumeSetCount > 0
        ? massDisplay(previousWeek.volumeKg, unitsLabel)
        : null,
    deltaDisplay: thisWeek.volumeSetCount > 0 ? volDelta : null,
    confidence: thisWeek.volumeSetCount > 0 ? "medium" : "none",
    missingNote:
      thisWeek.volumeSetCount === 0 ? "Sets with load and reps" : null,
  });

  // Technique
  const techAvg = avg(thisWeek.techniqueScores);
  const techPrev = avg(previousWeek.techniqueScores);
  sections.push({
    id: "technique",
    label: "Technique",
    summary:
      thisWeek.techniqueScores.length === 0
        ? "No completed technique analyses this week."
        : thisWeek.techniqueScores.length < 2
          ? `One technique score on file (avg ${round1(techAvg!)}). Not enough for a weekly trend claim.`
          : `${thisWeek.techniqueScores.length} analyses · avg score ${round1(techAvg!)}.`,
    thisWeekDisplay:
      techAvg != null ? `${round1(techAvg)} avg · n=${thisWeek.techniqueScores.length}` : null,
    previousWeekDisplay:
      techPrev != null
        ? `${round1(techPrev)} avg · n=${previousWeek.techniqueScores.length}`
        : null,
    deltaDisplay:
      techAvg != null && techPrev != null
        ? deltaPct(techAvg, techPrev)
        : null,
    confidence:
      thisWeek.techniqueScores.length >= 2
        ? "medium"
        : thisWeek.techniqueScores.length === 1
          ? "low"
          : "none",
    missingNote:
      thisWeek.techniqueScores.length < 2
        ? "≥2 technique analyses in the week"
        : null,
  });

  // Recovery
  const recAvg = avg(thisWeek.recoveryReadiness);
  const recPrev = avg(previousWeek.recoveryReadiness);
  const checkIns = thisWeek.recoveryReadiness.length;
  sections.push({
    id: "recovery",
    label: "Recovery",
    summary:
      checkIns === 0
        ? "No recovery check-ins with readiness this week."
        : checkIns < 3
          ? `Only ${checkIns} readiness check-in(s) — not enough to conclude recovery quality.`
          : `Average readiness ${round1(recAvg!)}/100 across ${checkIns} check-ins.`,
    thisWeekDisplay:
      checkIns > 0
        ? checkIns >= 3
          ? `${round1(recAvg!)}/100 · ${checkIns} check-ins`
          : `${checkIns} check-ins`
        : null,
    previousWeekDisplay:
      previousWeek.recoveryReadiness.length > 0
        ? `${previousWeek.recoveryReadiness.length} check-ins`
        : null,
    deltaDisplay:
      checkIns >= 3 && recAvg != null && recPrev != null && previousWeek.recoveryReadiness.length >= 3
        ? deltaPct(recAvg, recPrev)
        : null,
    confidence: checkIns >= 3 ? "medium" : checkIns > 0 ? "low" : "none",
    missingNote: checkIns < 3 ? "≥3 readiness check-ins this week" : null,
  });

  // Bodyweight
  const bw = thisWeek.bodyweightKg;
  const bwPrev = previousWeek.bodyweightKg;
  let bwSummary = "No bodyweight logs this week.";
  let bwDisplay: string | null = null;
  let bwDelta: string | null = null;
  if (bw.length === 0) {
    // keep defaults
  } else if (bw.length === 1) {
    bwDisplay = massDisplay(bw[0]!, unitsLabel);
    bwSummary = `One bodyweight log (${bwDisplay}) — not enough for a weekly change.`;
  } else {
    const first = bw[0]!;
    const last = bw[bw.length - 1]!;
    const d = last - first;
    bwDisplay = `${massDisplay(first, unitsLabel)} → ${massDisplay(last, unitsLabel)}`;
    bwSummary = `Bodyweight moved ${d >= 0 ? "+" : ""}${round1(d)} kg across ${bw.length} logs.`;
    bwDelta = `${d >= 0 ? "+" : ""}${round1(d)} kg within week`;
  }
  sections.push({
    id: "bodyweight",
    label: "Bodyweight",
    summary: bwSummary,
    thisWeekDisplay: bwDisplay,
    previousWeekDisplay:
      bwPrev.length > 0
        ? massDisplay(bwPrev[bwPrev.length - 1]!, unitsLabel)
        : null,
    deltaDisplay: bwDelta,
    confidence: bw.length >= 2 ? "medium" : bw.length === 1 ? "low" : "none",
    missingNote: bw.length < 2 ? "≥2 bodyweight logs this week" : null,
  });

  // PRs
  sections.push({
    id: "prs",
    label: "PRs",
    summary:
      thisWeek.prLabels.length === 0
        ? "No new all-time lift highs logged this week."
        : `New highs: ${thisWeek.prLabels.slice(0, 3).join(", ")}${thisWeek.prLabels.length > 3 ? "…" : ""}.`,
    thisWeekDisplay:
      thisWeek.prLabels.length > 0
        ? `${thisWeek.prLabels.length} PR(s)`
        : "None",
    previousWeekDisplay:
      previousWeek.prLabels.length > 0
        ? `${previousWeek.prLabels.length} PR(s)`
        : "None",
    deltaDisplay: null,
    confidence: thisWeek.prLabels.length > 0 ? "high" : "none",
    missingNote: null,
  });

  const { mainImprovement, biggestLimitation } = pickHighlights(
    sections,
    thisWeek,
    previousWeek,
  );
  const nextWeek = buildNextWeekPlan({
    sections,
    mainImprovement,
    biggestLimitation,
    thisWeek,
  });

  return {
    engineVersion: WEEKLY_REVIEW_ENGINE_VERSION,
    week: {
      weekKey: thisWeek.window.weekKey,
      weekStartIso: thisWeek.window.weekStart.toISOString(),
      weekEndIso: thisWeek.window.weekEnd.toISOString(),
      rangeLabel: formatWeekRangeLabel(thisWeek.window),
      inProgress,
    },
    previousWeekKey: previousWeek.window.weekKey,
    sections,
    mainImprovement,
    biggestLimitation,
    nextWeek,
    honesty: WEEKLY_REVIEW_HONESTY,
  };
}

function pickHighlights(
  sections: WeeklyReviewSection[],
  thisWeek: WeeklyWeekSignals,
  previousWeek: WeeklyWeekSignals,
): {
  mainImprovement: { title: string; detail: string } | null;
  biggestLimitation: { title: string; detail: string } | null;
} {
  let mainImprovement: { title: string; detail: string } | null = null;
  let biggestLimitation: { title: string; detail: string } | null = null;

  if (thisWeek.prLabels.length > 0) {
    mainImprovement = {
      title: "New PR(s) on file",
      detail: thisWeek.prLabels.slice(0, 2).join(", "),
    };
  } else {
    const strength = sections.find((s) => s.id === "strengthChanges");
    if (strength?.deltaDisplay?.startsWith("↑")) {
      mainImprovement = {
        title: "Strength signal up",
        detail: strength.summary,
      };
    } else if (
      thisWeek.completedSessions > previousWeek.completedSessions &&
      thisWeek.completedSessions > 0
    ) {
      mainImprovement = {
        title: "More training completed",
        detail: `${thisWeek.completedSessions} sessions vs ${previousWeek.completedSessions} previous week.`,
      };
    } else if (
      thisWeek.techniqueScores.length >= 2 &&
      avg(thisWeek.techniqueScores)! >
        (avg(previousWeek.techniqueScores) ?? 0) + 2
    ) {
      mainImprovement = {
        title: "Technique scores improved",
        detail: sections.find((s) => s.id === "technique")!.summary,
      };
    }
  }

  if (thisWeek.completedSessions === 0) {
    biggestLimitation = {
      title: "No completed sessions",
      detail:
        "Without logged training, the review cannot prioritize load or technique changes.",
    };
  } else if (thisWeek.recoveryReadiness.length < 3) {
    biggestLimitation = {
      title: "Thin recovery logging",
      detail: `Only ${thisWeek.recoveryReadiness.length} readiness check-in(s) — recovery is not established as a limiter.`,
    };
  } else if (
    thisWeek.volumeKg > 0 &&
    previousWeek.volumeKg > 0 &&
    thisWeek.volumeKg > previousWeek.volumeKg * 1.35
  ) {
    biggestLimitation = {
      title: "Volume jump vs previous week",
      detail:
        "Tonnage rose sharply week-over-week — watch recovery and confirm any load changes explicitly.",
    };
  } else if (thisWeek.techniqueScores.length === 0) {
    biggestLimitation = {
      title: "No technique film this week",
      detail: "Without analyses, technique cannot be a measured limiter.",
    };
  } else {
    const adh = adherencePct(thisWeek);
    if (adh != null && adh < 60) {
      biggestLimitation = {
        title: "Program adherence below 60%",
        detail: sections.find((s) => s.id === "programAdherence")!.summary,
      };
    }
  }

  return { mainImprovement, biggestLimitation };
}

function buildNextWeekPlan(args: {
  sections: WeeklyReviewSection[];
  mainImprovement: { title: string; detail: string } | null;
  biggestLimitation: { title: string; detail: string } | null;
  thisWeek: WeeklyWeekSignals;
}): WeeklyNextWeekPlan {
  const keep: string[] = [];
  const change: string[] = [];
  const watch: string[] = [];

  if (args.thisWeek.completedSessions >= 3) {
    keep.push("Session logging cadence — keep finishing workouts you start.");
  } else if (args.thisWeek.completedSessions > 0) {
    keep.push("Continue logging completed sets honestly.");
  } else {
    keep.push("Assign a session and complete at least one workout.");
  }

  if (args.mainImprovement?.title.includes("PR")) {
    keep.push(`Protect recent PR context: ${args.mainImprovement.detail}.`);
  }

  if (args.biggestLimitation?.title.includes("Volume jump")) {
    change.push(
      "Hold or slightly reduce volume until recovery check-ins catch up — confirm any adaptation.",
    );
  } else if (args.biggestLimitation?.title.includes("adherence")) {
    change.push(
      "Prefer completing scheduled program days over ad-hoc skips when possible.",
    );
  } else if (args.biggestLimitation?.title.includes("No completed")) {
    change.push("Schedule and complete sessions from Today or Programs.");
  } else if (args.thisWeek.techniqueScores.length === 0) {
    change.push("Film one working set for technique on a main lift.");
  } else {
    change.push(
      "Make one deliberate change only — do not overhaul the whole program.",
    );
  }

  if (args.thisWeek.recoveryReadiness.length < 3) {
    watch.push(
      "Recovery check-in count — log readiness ≥3 days so next week’s review can use it.",
    );
  } else {
    watch.push("Readiness trend vs last week’s average.");
  }

  if (
    args.thisWeek.volumeKg > 0 &&
    args.sections.find((s) => s.id === "volume")?.deltaDisplay?.startsWith("↑")
  ) {
    watch.push("Weekly tonnage — sharp rises need matching recovery logs.");
  }

  watch.push("Any pain or unusual fatigue — stop and seek appropriate care; this review is not a diagnosis.");

  return {
    keep: keep.slice(0, 3),
    change: change.slice(0, 3),
    watch: watch.slice(0, 3),
  };
}
