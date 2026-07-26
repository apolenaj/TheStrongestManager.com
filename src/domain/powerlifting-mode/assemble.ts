/**
 * Assemble Powerlifting Mode — SBD priorities without invented federation scores.
 */

import {
  POWERLIFTING_LIFT_LABELS,
  POWERLIFTING_MEET_COMMAND_CUES,
  POWERLIFTING_MODE_ENGINE_VERSION,
  POWERLIFTING_MODE_HONESTY,
  POWERLIFTING_PRIORITY_LABELS,
  POWERLIFTING_RELATIVE_SCORE_STATUS,
  POWERLIFTING_TECHNIQUE_SLUGS,
  POWERLIFTING_TRAINING_FOCUS_LABELS,
  type PowerliftingLift,
} from "@/domain/powerlifting-mode/constants";
import type {
  PowerliftingLiftCard,
  PowerliftingModePayload,
  PowerliftingModeSignals,
  PowerliftingPriorityCard,
  PowerliftingTrainingCard,
} from "@/domain/powerlifting-mode/types";

function liftCard(
  lift: PowerliftingLift,
  loadKg: number | null,
  source: PowerliftingLiftCard["source"],
): PowerliftingLiftCard {
  return {
    lift,
    label: POWERLIFTING_LIFT_LABELS[lift],
    loadKg,
    source,
    href: `/exercises/${
      lift === "squat"
        ? "back-squat"
        : lift === "bench"
          ? "bench-press"
          : "deadlift"
    }`,
  };
}

function computeTotal(signals: PowerliftingModeSignals): {
  totalKg: number | null;
  totalSource: PowerliftingModePayload["totalSource"];
} {
  const { squatKg, benchKg, deadliftKg } = signals.lifts;
  const known = [squatKg, benchKg, deadliftKg].filter(
    (v): v is number => v != null && v > 0,
  );
  if (known.length === 3) {
    return {
      totalKg: Math.round((squatKg! + benchKg! + deadliftKg!) * 10) / 10,
      totalSource: "complete",
    };
  }
  if (known.length > 0) {
    return { totalKg: null, totalSource: "partial" };
  }
  return { totalKg: null, totalSource: "missing" };
}

function buildPriorities(
  signals: PowerliftingModeSignals,
  lifts: PowerliftingLiftCard[],
  totalKg: number | null,
  totalSource: PowerliftingModePayload["totalSource"],
): PowerliftingPriorityCard[] {
  const byLift = Object.fromEntries(lifts.map((l) => [l.lift, l])) as Record<
    PowerliftingLift,
    PowerliftingLiftCard
  >;

  const liftPriority = (lift: PowerliftingLift): PowerliftingPriorityCard => {
    const card = byLift[lift];
    return {
      id: lift,
      label: POWERLIFTING_PRIORITY_LABELS[lift],
      headline:
        card.loadKg != null
          ? `${card.loadKg} kg`
          : "No load on file yet",
      detail:
        card.source === "missing"
          ? "Add a PR in Profile or a meet target in Competition."
          : `Source: ${card.source.replace(/_/g, " ")}.`,
      href: card.href,
      metricValue: card.loadKg,
      metricUnit: card.loadKg != null ? "kg" : null,
      available: card.loadKg != null,
      missingNote:
        card.loadKg == null ? "Missing reported PR or competition target." : null,
    };
  };

  const priorities: PowerliftingPriorityCard[] = [
    liftPriority("squat"),
    liftPriority("bench"),
    liftPriority("deadlift"),
    {
      id: "total",
      label: POWERLIFTING_PRIORITY_LABELS.total,
      headline:
        totalKg != null
          ? `${totalKg} kg raw total`
          : totalSource === "partial"
            ? "Partial — need all three lifts"
            : "Total not available yet",
      detail:
        totalKg != null
          ? "Sum of squat + bench + deadlift from known loads. Not a federation-adjusted score."
          : "A raw total needs squat, bench, and deadlift values.",
      href: "/app/progress",
      metricValue: totalKg,
      metricUnit: totalKg != null ? "kg" : null,
      available: totalKg != null,
      missingNote:
        totalKg == null
          ? "Missing one or more of squat, bench, deadlift."
          : null,
    },
    {
      id: "relative_score",
      label: POWERLIFTING_PRIORITY_LABELS.relative_score,
      headline: "DOTS calculator",
      detail: POWERLIFTING_RELATIVE_SCORE_STATUS.reason,
      href: POWERLIFTING_RELATIVE_SCORE_STATUS.calculatorHref,
      metricValue: null,
      metricUnit: null,
      available: true,
      missingNote:
        "Open /tools/dots with total and bodyweight. Wilks / IPF GL still deferred.",
    },
    {
      id: "competition",
      label: POWERLIFTING_PRIORITY_LABELS.competition,
      headline: signals.competition.hasPrep
        ? signals.competition.name ??
          (signals.competition.daysUntil != null
            ? `Meet in ${signals.competition.daysUntil} day${signals.competition.daysUntil === 1 ? "" : "s"}`
            : "Competition on file")
        : "No competition set",
      detail: signals.competition.phaseLabel
        ? `Phase: ${signals.competition.phaseLabel}. Open Competition Mode for countdown and taper sketches.`
        : "Set a meet date in Competition Mode when ready.",
      href: "/app/competition",
      metricValue: signals.competition.daysUntil,
      metricUnit: signals.competition.daysUntil != null ? "days" : null,
      available: signals.competition.hasPrep,
      missingNote: signals.competition.hasPrep
        ? null
        : "Missing competition prep.",
    },
    {
      id: "weight_class",
      label: POWERLIFTING_PRIORITY_LABELS.weight_class,
      headline:
        signals.competition.weightClassLabel ??
        (signals.competition.weightClassLimitKg != null
          ? `${signals.competition.weightClassLimitKg} kg limit`
          : "Weight class not set"),
      detail:
        "Athlete-reported class label / limit — not an official federation lookup table.",
      href: "/app/competition",
      metricValue: signals.competition.weightClassLimitKg,
      metricUnit:
        signals.competition.weightClassLimitKg != null ? "kg" : null,
      available: Boolean(
        signals.competition.weightClassLabel ||
          signals.competition.weightClassLimitKg != null,
      ),
      missingNote:
        signals.competition.weightClassLabel ||
        signals.competition.weightClassLimitKg != null
          ? null
          : "Missing weight class on competition prep.",
    },
    {
      id: "attempt_planning",
      label: POWERLIFTING_PRIORITY_LABELS.attempt_planning,
      headline: "Attempt selector",
      detail:
        "Plan openers and thirds with risk preferences — coaching guidance, not federation attempt rules.",
      href: "/app/attempt-selector",
      metricValue: null,
      metricUnit: null,
      available: true,
      missingNote: null,
    },
  ];

  return priorities;
}

function buildTraining(
  signals: PowerliftingModeSignals,
): PowerliftingTrainingCard[] {
  const phase = signals.competition.phaseLabel;
  return [
    {
      id: "specificity",
      label: POWERLIFTING_TRAINING_FOCUS_LABELS.specificity,
      headline: "Train the competition lifts",
      detail:
        "Bias accessory work toward squat, bench, and deadlift variations. See the technique library below.",
      href: "/app/exercises",
    },
    {
      id: "peaking",
      label: POWERLIFTING_TRAINING_FOCUS_LABELS.peaking,
      headline: phase
        ? `Current phase cue: ${phase}`
        : "Peaking follows your meet timeline",
      detail:
        "Use Competition Mode for phase / taper sketches. Peaking is timeline-based coaching — not a federation peaking mandate.",
      href: "/app/competition",
    },
    {
      id: "competition_commands",
      label: POWERLIFTING_TRAINING_FOCUS_LABELS.competition_commands,
      headline: "Practice common meet commands",
      detail:
        "Drill start / press / rack / down cues in training. Confirm official wording with your federation — we do not lock a rulebook here.",
      href: "/app/competition",
      cues: POWERLIFTING_MEET_COMMAND_CUES.flatMap((c) =>
        c.cues.map((cue) => `${POWERLIFTING_LIFT_LABELS[c.lift]}: ${cue}`),
      ),
    },
  ];
}

export function assemblePowerliftingMode(
  signals: PowerliftingModeSignals,
): PowerliftingModePayload {
  const lifts: PowerliftingLiftCard[] = [
    liftCard("squat", signals.lifts.squatKg, signals.lifts.squatSource),
    liftCard("bench", signals.lifts.benchKg, signals.lifts.benchSource),
    liftCard(
      "deadlift",
      signals.lifts.deadliftKg,
      signals.lifts.deadliftSource,
    ),
  ];

  const { totalKg, totalSource } = computeTotal(signals);

  return {
    engineVersion: POWERLIFTING_MODE_ENGINE_VERSION,
    generatedAtIso: signals.now.toISOString(),
    federation: {
      selectedId: null,
      selectionAvailableLater: true,
      note: "Federation selection is deferred so we never mix federation-specific rules. Pick a federation later when relative scoring and rule cues ship.",
    },
    lifts,
    totalKg,
    totalSource,
    relativeScore: {
      available: true,
      systemsDeferred: [...POWERLIFTING_RELATIVE_SCORE_STATUS.systemsDeferred],
      reason: POWERLIFTING_RELATIVE_SCORE_STATUS.reason,
    },
    priorities: buildPriorities(signals, lifts, totalKg, totalSource),
    training: buildTraining(signals),
    techniqueLibrary: POWERLIFTING_TECHNIQUE_SLUGS.map((t) => ({
      slug: t.slug,
      label: t.label,
      lift: t.lift,
      href: `/exercises/${t.slug}`,
    })),
    competition: { ...signals.competition },
    honesty: POWERLIFTING_MODE_HONESTY,
  };
}

/** Text flatten for honesty tests. */
export function powerliftingModeText(payload: PowerliftingModePayload): string {
  return [
    ...payload.honesty,
    payload.federation.note,
    payload.relativeScore.reason,
    ...payload.priorities.flatMap((p) => [
      p.headline,
      p.detail,
      p.missingNote ?? "",
    ]),
    ...payload.training.flatMap((t) => [t.headline, t.detail]),
  ]
    .join("\n")
    .toLowerCase();
}
