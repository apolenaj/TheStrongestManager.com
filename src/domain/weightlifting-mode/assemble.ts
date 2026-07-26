/**
 * Assemble Weightlifting Mode — no technique analysis until models exist.
 */

import {
  WEIGHTLIFTING_DASHBOARD_PRIORITIES,
  WEIGHTLIFTING_LIFT_IDS,
  WEIGHTLIFTING_LIFT_LABELS,
  WEIGHTLIFTING_MODE_ENGINE_VERSION,
  WEIGHTLIFTING_MODE_HONESTY,
  WEIGHTLIFTING_POSITION_CUES,
  WEIGHTLIFTING_PRIORITY_LABELS,
  WEIGHTLIFTING_TECHNIQUE_ANALYSIS_STATUS,
  WEIGHTLIFTING_TRACKING_AREAS,
  WEIGHTLIFTING_TRACKING_LABELS,
  weightliftingPrMetricKey,
  type WeightliftingLiftId,
} from "@/domain/weightlifting-mode/constants";
import type {
  WeightliftingLiftCard,
  WeightliftingModePayload,
  WeightliftingModeSignals,
  WeightliftingPriorityCard,
} from "@/domain/weightlifting-mode/types";

function liftCard(
  liftId: WeightliftingLiftId,
  signals: WeightliftingModeSignals,
): WeightliftingLiftCard {
  const row = signals.lifts[liftId];
  return {
    liftId,
    label: WEIGHTLIFTING_LIFT_LABELS[liftId],
    loadKg: row?.loadKg ?? null,
    metricKey: weightliftingPrMetricKey(liftId),
    recordedAtIso: row?.recordedAt?.toISOString() ?? null,
    source: row ? "reported_pr" : "missing",
  };
}

function competitionTotal(lifts: WeightliftingLiftCard[]): {
  totalKg: number | null;
  source: WeightliftingModePayload["competitionTotalSource"];
} {
  const snatch = lifts.find((l) => l.liftId === "snatch")?.loadKg ?? null;
  const cj = lifts.find((l) => l.liftId === "clean_and_jerk")?.loadKg ?? null;
  if (snatch != null && cj != null) {
    return {
      totalKg: Math.round((snatch + cj) * 10) / 10,
      source: "complete",
    };
  }
  if (snatch != null || cj != null) {
    return { totalKg: null, source: "partial" };
  }
  return { totalKg: null, source: "missing" };
}

function buildPriorities(
  signals: WeightliftingModeSignals,
  lifts: WeightliftingLiftCard[],
  totalKg: number | null,
  totalSource: WeightliftingModePayload["competitionTotalSource"],
): WeightliftingPriorityCard[] {
  const byId = Object.fromEntries(lifts.map((l) => [l.liftId, l])) as Record<
    WeightliftingLiftId,
    WeightliftingLiftCard
  >;

  return WEIGHTLIFTING_DASHBOARD_PRIORITIES.map((id) => {
    if (
      id === "snatch" ||
      id === "clean" ||
      id === "jerk" ||
      id === "clean_and_jerk"
    ) {
      const card = byId[id];
      return {
        id,
        label: WEIGHTLIFTING_PRIORITY_LABELS[id],
        headline:
          card.loadKg != null ? `${card.loadKg} kg` : "No load on file yet",
        detail:
          card.source === "missing"
            ? "Log a weightlifting PR when ready (wl_<lift>_weight)."
            : "Reported PR — not a verified competition result.",
        href: "/app/progress",
        metricValue: card.loadKg,
        metricUnit: card.loadKg != null ? "kg" : null,
        available: card.loadKg != null,
        missingNote:
          card.loadKg == null ? "Missing reported load for this lift." : null,
      };
    }

    if (id === "competition_total") {
      return {
        id,
        label: WEIGHTLIFTING_PRIORITY_LABELS.competition_total,
        headline:
          totalKg != null
            ? `${totalKg} kg (snatch + C&J)`
            : totalSource === "partial"
              ? "Need both snatch and clean & jerk"
              : "Competition total not available",
        detail:
          "Sum of best snatch and clean & jerk when both are logged — not Sinclair or other scoring.",
        href: "/app/progress",
        metricValue: totalKg,
        metricUnit: totalKg != null ? "kg" : null,
        available: totalKg != null,
        missingNote:
          totalKg == null
            ? "Missing snatch and/or clean & jerk for a competition total."
            : null,
      };
    }

    if (id === "attempts") {
      return {
        id,
        label: WEIGHTLIFTING_PRIORITY_LABELS.attempts,
        headline: "3 snatch · 3 clean & jerk",
        detail:
          "Structural attempt slots for meet day. Not a make/miss predictor — confirm federation attempt rules separately.",
        href: "/app/competition",
        metricValue: 6,
        metricUnit: "slots",
        available: true,
        missingNote: null,
      };
    }

    if (id === "positions") {
      return {
        id,
        label: WEIGHTLIFTING_PRIORITY_LABELS.positions,
        headline: `${WEIGHTLIFTING_POSITION_CUES.length} position cues`,
        detail:
          "Educational checklist (start, pulls, catch, jerk phases) — not automatic position scoring from video.",
        href: "/app/weightlifting",
        metricValue: WEIGHTLIFTING_POSITION_CUES.length,
        metricUnit: "cues",
        available: true,
        missingNote: null,
      };
    }

    // technique
    return {
      id: "technique",
      label: WEIGHTLIFTING_PRIORITY_LABELS.technique,
      headline: signals.advancedVideoAnalysisEnabled
        ? "Advanced video flag on — analysis models not shipped"
        : "Technique analysis deferred",
      detail: WEIGHTLIFTING_TECHNIQUE_ANALYSIS_STATUS.reason,
      href: null,
      metricValue: null,
      metricUnit: null,
      available: false,
      missingNote:
        "Do not implement weightlifting technique analysis until specific models exist.",
    };
  });
}

export function assembleWeightliftingMode(
  signals: WeightliftingModeSignals,
): WeightliftingModePayload {
  const lifts = WEIGHTLIFTING_LIFT_IDS.map((id) => liftCard(id, signals));
  const { totalKg, source: totalSource } = competitionTotal(lifts);

  const tracking = Object.fromEntries(
    WEIGHTLIFTING_TRACKING_AREAS.map((area) => {
      if (area === "technique") {
        return [
          area,
          {
            label: WEIGHTLIFTING_TRACKING_LABELS.technique,
            status: "deferred" as const,
            detail: WEIGHTLIFTING_TECHNIQUE_ANALYSIS_STATUS.reason,
          },
        ];
      }
      if (area === "positions") {
        return [
          area,
          {
            label: WEIGHTLIFTING_TRACKING_LABELS.positions,
            status: "checklist" as const,
            detail:
              "Position cues are listed for coaching reference — not video-derived scores.",
          },
        ];
      }
      if (area === "attempts") {
        return [
          area,
          {
            label: WEIGHTLIFTING_TRACKING_LABELS.attempts,
            status: "link" as const,
            detail: "3 snatch + 3 clean & jerk attempt structure.",
          },
        ];
      }
      return [
        area,
        {
          label: WEIGHTLIFTING_TRACKING_LABELS.competition_total,
          status: totalKg != null ? ("ready" as const) : ("deferred" as const),
          detail:
            totalKg != null
              ? `Competition total ${totalKg} kg.`
              : "Needs snatch and clean & jerk loads.",
        },
      ];
    }),
  ) as WeightliftingModePayload["tracking"];

  return {
    engineVersion: WEIGHTLIFTING_MODE_ENGINE_VERSION,
    generatedAtIso: signals.now.toISOString(),
    lifts,
    competitionTotalKg: totalKg,
    competitionTotalSource: totalSource,
    priorities: buildPriorities(signals, lifts, totalKg, totalSource),
    tracking,
    positions: WEIGHTLIFTING_POSITION_CUES.map((p) => ({
      id: p.id,
      label: p.label,
      lifts: [...p.lifts],
    })),
    techniqueAnalysis: {
      implemented: false,
      advancedVideoAnalysisEnabled: signals.advancedVideoAnalysisEnabled,
      reason: WEIGHTLIFTING_TECHNIQUE_ANALYSIS_STATUS.reason,
    },
    attempts: {
      snatchAttempts: 3,
      cleanAndJerkAttempts: 3,
      detail:
        "Olympic weightlifting meets typically allow three snatch and three clean & jerk attempts. This is structural tracking only.",
      href: "/app/competition",
    },
    competition: { ...signals.competition },
    honesty: WEIGHTLIFTING_MODE_HONESTY,
  };
}

export function weightliftingModeText(
  payload: WeightliftingModePayload,
): string {
  return [
    ...payload.honesty,
    payload.techniqueAnalysis.reason,
    ...payload.priorities.flatMap((p) => [
      p.headline,
      p.detail,
      p.missingNote ?? "",
    ]),
  ]
    .join("\n")
    .toLowerCase();
}
