import {
  analyzeStrength,
  displayableScore,
  type StrengthAssessment,
} from "@/domain/scoring";
import type { ScoringSnapshot } from "@/domain/scoring/types";
import { prisma } from "@/lib/db";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import {
  formatMass,
  normalizeMassUnit,
  toCanonicalKg,
} from "@/services/units/convert";

const LIFT_KEYS = MAJOR_LIFTS.map((lift) => lift.metricKey);

function toInputSource(
  raw: string | null | undefined,
): "observed" | "heuristic" | "reported" | "recommended" {
  if (
    raw === "observed" ||
    raw === "heuristic" ||
    raw === "reported" ||
    raw === "recommended"
  ) {
    return raw;
  }
  return "reported";
}

export type StrengthScoreView = {
  assessment: StrengthAssessment;
  displayScore: number | null;
  units: "kg" | "lb";
  formatKg: (kg: number) => string;
};

/**
 * Load athlete signals and run the Strength Score module for Progress UI.
 */
export async function getStrengthScoreForUser(
  userId: string,
): Promise<StrengthScoreView | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    include: {
      trainingExperience: true,
      bodyMetrics: {
        where: { metricKey: "bodyweight" },
        orderBy: { recordedAt: "desc" },
        take: 1,
      },
      progressMetrics: {
        where: { metricKey: { in: [...LIFT_KEYS] } },
        orderBy: { recordedAt: "desc" },
      },
    },
  });

  if (!profile) return null;

  const units = normalizeMassUnit(profile.units);
  const snapshot: ScoringSnapshot = {
    now: new Date(),
    lifts: profile.progressMetrics.map((m) => ({
      metricKey: m.metricKey,
      valueKg: toCanonicalKg(m.value, m.unit ?? "kg"),
      reps: m.reps,
      recordedAt: m.recordedAt,
      source: toInputSource(m.source),
    })),
    techniqueAnalyses: [],
    recoveryEntries: [],
    sessions: [],
    activeProgramId: null,
    activeProgramName: null,
    bodyweightKg: profile.bodyMetrics[0]
      ? toCanonicalKg(
          profile.bodyMetrics[0].value,
          profile.bodyMetrics[0].unit,
        )
      : null,
    experienceLevel: profile.trainingExperience?.level ?? null,
    primaryDiscipline: profile.primaryDiscipline,
  };

  const assessment = analyzeStrength(snapshot);

  return {
    assessment,
    displayScore: displayableScore(assessment.result),
    units,
    formatKg: (kg: number) => formatMass(kg, units),
  };
}
