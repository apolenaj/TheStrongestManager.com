import { buildAttemptPlans } from "@/domain/competition-mode/attempts";
import {
  buildTaperGuidance,
  daysUntil,
  formatCountdown,
  phaseLabel,
  phaseSummary,
  resolveCompetitionPhase,
} from "@/domain/competition-mode/phases";
import {
  buildWeightCutGuidance,
  strongmanNotice,
} from "@/domain/competition-mode/weight-cut";
import type {
  CompetitionModeSignals,
  CompetitionModeView,
  CompetitionSport,
} from "@/domain/competition-mode/types";

function sportLabel(sport: CompetitionSport): string {
  if (sport === "powerlifting") return "Powerlifting";
  if (sport === "deadlift_only") return "Deadlift-only";
  return "Strongman";
}

function formatHeavySummary(s: CompetitionModeSignals["lastHeavySession"]): string | null {
  if (!s) return null;
  const rpe = s.rpe != null ? ` @ RPE ${s.rpe}` : "";
  return `${s.loadKg} kg × ${s.reps}${rpe}`;
}

/**
 * Assemble Competition Mode dashboard data from stored prep + live signals.
 */
export function assembleCompetitionMode(
  signals: CompetitionModeSignals,
  now: Date = new Date(),
  timeZone: string = "UTC",
): CompetitionModeView {
  const { competition } = signals;
  const daysOut = daysUntil(competition.competitionDate, now, timeZone);
  const phaseId = resolveCompetitionPhase(daysOut);
  const countdown = formatCountdown(daysOut);

  const heavy = signals.lastHeavySession;
  const bw = signals.bodyweight;
  let bwSummary: string;
  if (bw.latestKg == null) {
    bwSummary = "No recent bodyweight log.";
  } else if (bw.kgPerWeek == null) {
    bwSummary = `Latest ${bw.latestKg} kg — need more logs for a trend.`;
  } else if (Math.abs(bw.kgPerWeek) < 0.05) {
    bwSummary = `Latest ${bw.latestKg} kg — roughly stable.`;
  } else if (bw.kgPerWeek > 0) {
    bwSummary = `Latest ${bw.latestKg} kg — rising ≈ ${bw.kgPerWeek.toFixed(2)} kg/week.`;
  } else {
    bwSummary = `Latest ${bw.latestKg} kg — falling ≈ ${Math.abs(bw.kgPerWeek).toFixed(2)} kg/week.`;
  }

  let readinessSummary: string;
  if (signals.readiness.latest == null) {
    readinessSummary =
      "No readiness check-in yet — log recovery to see meet-week context.";
  } else {
    const fat =
      signals.readiness.fatigue != null
        ? ` · fatigue ${signals.readiness.fatigue}/10`
        : "";
    readinessSummary = `Readiness ${Math.round(signals.readiness.latest)}/100${fat} — not a medical clearance.`;
  }

  const honestyNotes = [
    "Taper and attempt numbers are illustrative sketches — not auto-applied programming.",
    "Federation rules, commands, and equipment standards always override this UI.",
    "Weight-class guidance never includes an automatic dehydration or extreme cut protocol.",
  ];

  return {
    competition: {
      id: competition.id,
      sport: competition.sport,
      sportLabel: sportLabel(competition.sport),
      name: competition.name,
      competitionDate: competition.competitionDate.toISOString(),
      weightClassLabel: competition.weightClassLabel,
      weightClassLimitKg: competition.weightClassLimitKg,
      targets: competition.targets,
    },
    countdown,
    trainingPhase: {
      id: phaseId,
      label: phaseLabel(phaseId),
      summary: phaseSummary(phaseId, daysOut),
    },
    lastHeavySession: heavy
      ? {
          at: heavy.at.toISOString(),
          exerciseLabel: heavy.exerciseLabel,
          summary: formatHeavySummary(heavy)!,
        }
      : null,
    taper: buildTaperGuidance(phaseId),
    attemptPlans: buildAttemptPlans(
      competition.sport,
      competition.targets,
      signals.liftEstimates,
    ),
    bodyweightTrend: {
      latestKg: bw.latestKg,
      kgPerWeek: bw.kgPerWeek,
      summary: bwSummary,
    },
    readiness: {
      latest: signals.readiness.latest,
      fatigue: signals.readiness.fatigue,
      summary: readinessSummary,
    },
    weightCut: buildWeightCutGuidance(
      competition.weightClassLimitKg,
      signals.bodyweight,
    ),
    strongmanNotice: strongmanNotice(competition.sport),
    honestyNotes,
    generatedAt: now.toISOString(),
  };
}
