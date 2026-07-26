/**
 * Assemble Bodybuilding Mode — observed workload only, no growth scores.
 */

import {
  BODYBUILDING_MODE_ENGINE_VERSION,
  BODYBUILDING_MODE_HONESTY,
  BODYBUILDING_MUSCLE_LABELS,
  BODYBUILDING_PRIORITY_LABELS,
  BODYBUILDING_SUPPORT_LABELS,
  DEFAULT_BODYBUILDING_LOOKBACK_DAYS,
} from "@/domain/bodybuilding-mode/constants";
import type {
  BodybuildingModePayload,
  BodybuildingModeSignals,
  BodybuildingPriorityCard,
  BodybuildingSupportCard,
  ExerciseProgressionRow,
  MuscleWorkloadRow,
} from "@/domain/bodybuilding-mode/types";

function muscleLabel(key: string): string {
  return (
    BODYBUILDING_MUSCLE_LABELS[key] ??
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function progressionTrend(
  latest: number | null,
  prior: number | null,
): ExerciseProgressionRow["trend"] {
  if (latest == null || prior == null) return "insufficient";
  const delta = latest - prior;
  if (delta >= 2.5) return "up";
  if (delta <= -2.5) return "down";
  return "stable";
}

function buildMuscleWorkload(
  signals: BodybuildingModeSignals,
): MuscleWorkloadRow[] {
  return [...signals.muscleSets]
    .map((m) => ({
      muscleKey: m.muscleKey,
      label: muscleLabel(m.muscleKey),
      setCount: m.setCount,
      volumeKg: Math.round(m.volumeKg),
    }))
    .sort((a, b) => b.setCount - a.setCount || b.volumeKg - a.volumeKg);
}

function buildProgression(
  signals: BodybuildingModeSignals,
): ExerciseProgressionRow[] {
  return [...signals.exercises]
    .map((e) => ({
      exerciseId: e.exerciseId,
      exerciseName: e.exerciseName,
      setCount: e.setCount,
      volumeKg: Math.round(e.volumeKg),
      latestLoadKg: e.latestLoadKg,
      priorLoadKg: e.priorLoadKg,
      trend: progressionTrend(e.latestLoadKg, e.priorLoadKg),
      href: e.slug ? `/exercises/${e.slug}` : "/app/progress",
    }))
    .sort((a, b) => b.volumeKg - a.volumeKg)
    .slice(0, 8);
}

function buildPriorities(
  signals: BodybuildingModeSignals,
  muscles: MuscleWorkloadRow[],
  progression: ExerciseProgressionRow[],
): BodybuildingPriorityCard[] {
  const topMuscle = muscles[0] ?? null;
  const upCount = progression.filter((p) => p.trend === "up").length;

  return [
    {
      id: "muscle_groups",
      label: BODYBUILDING_PRIORITY_LABELS.muscle_groups,
      headline: topMuscle
        ? `Most worked: ${topMuscle.label} (${topMuscle.setCount} sets)`
        : "No muscle-group sets logged",
      detail:
        "Sets attributed from exercise primary muscles in the lookback — workload, not growth prediction.",
      href: "/app/training",
      metricValue: muscles.length > 0 ? muscles.length : null,
      metricUnit: muscles.length > 0 ? "groups" : null,
      available: muscles.length > 0,
      missingNote:
        muscles.length === 0
          ? "Log completed sets linked to catalog exercises with muscle tags."
          : null,
    },
    {
      id: "weekly_volume",
      label: BODYBUILDING_PRIORITY_LABELS.weekly_volume,
      headline:
        signals.weeklyVolume.setCount > 0
          ? `${Math.round(signals.weeklyVolume.volumeKg)} kg · ${signals.weeklyVolume.setCount} sets`
          : "No volume in window",
      detail: `${signals.weeklyVolume.sessionCount} session(s), ${signals.weeklyVolume.hardSetCount} hard set(s) estimated from RPE/RIR when logged.`,
      href: "/app/training",
      metricValue:
        signals.weeklyVolume.volumeKg > 0
          ? Math.round(signals.weeklyVolume.volumeKg)
          : null,
      metricUnit: signals.weeklyVolume.volumeKg > 0 ? "kg" : null,
      available: signals.weeklyVolume.setCount > 0,
      missingNote:
        signals.weeklyVolume.setCount === 0
          ? "Complete sessions with load × reps to see weekly volume."
          : null,
    },
    {
      id: "exercise_progression",
      label: BODYBUILDING_PRIORITY_LABELS.exercise_progression,
      headline:
        progression.length > 0
          ? upCount > 0
            ? `${upCount} exercise(s) trending up on load`
            : "Progression tracked from logged loads"
          : "No progression samples yet",
      detail:
        "Compares recent top-set loads when history exists — qualitative trend only, never a hypertrophy %.",
      href: "/app/progress",
      metricValue: progression.length > 0 ? progression.length : null,
      metricUnit: progression.length > 0 ? "exercises" : null,
      available: progression.length > 0,
      missingNote:
        progression.length === 0
          ? "Need repeated loaded sets on the same exercises."
          : null,
    },
    {
      id: "bodyweight",
      label: BODYBUILDING_PRIORITY_LABELS.bodyweight,
      headline:
        signals.bodyweight.latestKg != null
          ? `${signals.bodyweight.latestKg} kg`
          : "Bodyweight not logged",
      detail:
        signals.bodyweight.priorKg != null &&
        signals.bodyweight.latestKg != null
          ? `Prior sample ${signals.bodyweight.priorKg} kg (${signals.bodyweight.sampleCount} entries). Athlete-reported only.`
          : "Log bodyweight in Profile / Progress — never inferred from photos.",
      href: "/app/progress",
      metricValue: signals.bodyweight.latestKg,
      metricUnit: signals.bodyweight.latestKg != null ? "kg" : null,
      available: signals.bodyweight.latestKg != null,
      missingNote:
        signals.bodyweight.latestKg == null
          ? "Missing bodyweight BodyMetric."
          : null,
    },
    {
      id: "training_performance",
      label: BODYBUILDING_PRIORITY_LABELS.training_performance,
      headline:
        signals.weeklyVolume.sessionCount > 0
          ? `${signals.weeklyVolume.sessionCount} session(s) · ${signals.weeklyVolume.hardSetCount} hard sets`
          : "No sessions in window",
      detail:
        "Observed session and hard-set counts — not a performance or growth score.",
      href: "/app/today",
      metricValue:
        signals.weeklyVolume.sessionCount > 0
          ? signals.weeklyVolume.sessionCount
          : null,
      metricUnit:
        signals.weeklyVolume.sessionCount > 0 ? "sessions" : null,
      available: signals.weeklyVolume.sessionCount > 0,
      missingNote:
        signals.weeklyVolume.sessionCount === 0
          ? "Complete a training session in the lookback window."
          : null,
    },
  ];
}

function buildSupport(
  signals: BodybuildingModeSignals,
  muscles: MuscleWorkloadRow[],
  progression: ExerciseProgressionRow[],
): BodybuildingSupportCard[] {
  return [
    {
      id: "muscle_workload",
      label: BODYBUILDING_SUPPORT_LABELS.muscle_workload,
      headline:
        muscles.length > 0
          ? `${muscles.length} muscle groups with logged sets`
          : "Workload overview empty",
      detail:
        "Primary-muscle set counts and tonnage from completed sets. Not a growth forecast.",
      href: "/app/training",
      available: muscles.length > 0,
    },
    {
      id: "exercise_progression",
      label: BODYBUILDING_SUPPORT_LABELS.exercise_progression,
      headline:
        progression.length > 0
          ? "Top exercises by volume"
          : "No progression rows yet",
      detail: "Load trends when prior sets exist on the same exercise.",
      href: "/app/progress",
      available: progression.length > 0,
    },
    {
      id: "recovery",
      label: BODYBUILDING_SUPPORT_LABELS.recovery,
      headline: signals.recovery.hasRecentEntry
        ? signals.recovery.latestReadiness != null
          ? `Latest readiness ~${signals.recovery.latestReadiness}`
          : "Recovery entry on file"
        : "No recent recovery check-in",
      detail:
        "Recovery is estimate-only coaching context — not a medical assessment.",
      href: "/app/recovery",
      available: signals.recovery.hasRecentEntry,
    },
    {
      id: "physique_photos",
      label: BODYBUILDING_SUPPORT_LABELS.physique_photos,
      headline: "Photos optional & private",
      detail:
        "Physique photo library is not enabled as a product surface yet. When it ships, photos stay private by default — never used for medical body-fat estimation without a validated method.",
      href: null,
      available: false,
    },
  ];
}

export function assembleBodybuildingMode(
  signals: BodybuildingModeSignals,
): BodybuildingModePayload {
  const lookbackDays =
    signals.lookbackDays > 0
      ? signals.lookbackDays
      : DEFAULT_BODYBUILDING_LOOKBACK_DAYS;

  const muscleWorkload = buildMuscleWorkload(signals);
  const exerciseProgression = buildProgression(signals);

  return {
    engineVersion: BODYBUILDING_MODE_ENGINE_VERSION,
    lookbackDays,
    generatedAtIso: signals.now.toISOString(),
    priorities: buildPriorities(signals, muscleWorkload, exerciseProgression),
    muscleWorkload,
    exerciseProgression,
    support: buildSupport(signals, muscleWorkload, exerciseProgression),
    weeklyVolume: { ...signals.weeklyVolume },
    bodyweight: { ...signals.bodyweight },
    photos: {
      enabled: false,
      privateByDefault: true,
      bodyFatFromPhotos: false,
      note: "Physique photos remain optional and private. Body-fat is never estimated from photos unless a validated method is implemented and disclosed.",
    },
    muscleGrowthScore: {
      available: false,
      reason:
        "No muscle-growth score exists. Hypertrophy cannot be honestly scored from sets alone or from photos.",
    },
    honesty: BODYBUILDING_MODE_HONESTY,
  };
}

export function bodybuildingModeText(payload: BodybuildingModePayload): string {
  return [
    ...payload.honesty,
    payload.photos.note,
    payload.muscleGrowthScore.reason,
    ...payload.priorities.flatMap((p) => [
      p.headline,
      p.detail,
      p.missingNote ?? "",
    ]),
    ...payload.support.flatMap((s) => [s.headline, s.detail]),
  ]
    .join("\n")
    .toLowerCase();
}
