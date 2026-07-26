import {
  SESSION_CHECKIN_FIELD_LABELS,
  SESSION_CHECKIN_SCALE_MAX,
  SESSION_CHECKIN_SCALE_MIN,
  SESSION_FATIGUE_CONCERN,
  SESSION_MOTIVATION_CONCERN,
  SESSION_READINESS_ENGINE_VERSION,
  SESSION_READINESS_HONESTY,
  SESSION_READINESS_RECOMMENDATION_DETAILS,
  SESSION_READINESS_RECOMMENDATION_LABELS,
  SESSION_REVIEW_LOAD_MIN_CONCERNS,
  SESSION_SLEEP_HOURS_CONCERN,
  SESSION_SORENESS_CONCERN,
} from "@/domain/session-readiness-adjuster/constants";
import type {
  SessionConcernFlag,
  SessionReadinessAdjustment,
  SessionReadinessCheckIn,
} from "@/domain/session-readiness-adjuster/types";

function inScale(n: number): boolean {
  return (
    Number.isFinite(n) &&
    n >= SESSION_CHECKIN_SCALE_MIN &&
    n <= SESSION_CHECKIN_SCALE_MAX
  );
}

export function collectSessionConcerns(
  input: SessionReadinessCheckIn,
): SessionConcernFlag[] {
  const concerns: SessionConcernFlag[] = [];

  if (
    input.sleepHours != null &&
    Number.isFinite(input.sleepHours) &&
    input.sleepHours >= 0 &&
    input.sleepHours < SESSION_SLEEP_HOURS_CONCERN
  ) {
    concerns.push({
      field: "sleepHours",
      label: SESSION_CHECKIN_FIELD_LABELS.sleepHours,
      detail: `Reported sleep ${input.sleepHours}h is under ${SESSION_SLEEP_HOURS_CONCERN}h — one signal among several.`,
    });
  }

  if (
    input.fatigue != null &&
    inScale(input.fatigue) &&
    input.fatigue >= SESSION_FATIGUE_CONCERN
  ) {
    concerns.push({
      field: "fatigue",
      label: SESSION_CHECKIN_FIELD_LABELS.fatigue,
      detail: `Fatigue ${input.fatigue}/10 is elevated — not an overtraining diagnosis.`,
    });
  }

  if (
    input.soreness != null &&
    inScale(input.soreness) &&
    input.soreness >= SESSION_SORENESS_CONCERN
  ) {
    concerns.push({
      field: "soreness",
      label: SESSION_CHECKIN_FIELD_LABELS.soreness,
      detail: `Soreness ${input.soreness}/10 is elevated — persistent pain needs a clinician, not an app cancel.`,
    });
  }

  if (
    input.motivation != null &&
    inScale(input.motivation) &&
    input.motivation <= SESSION_MOTIVATION_CONCERN
  ) {
    concerns.push({
      field: "motivation",
      label: SESSION_CHECKIN_FIELD_LABELS.motivation,
      detail: `Motivation ${input.motivation}/10 is low — useful context, not a mood diagnosis.`,
    });
  }

  return concerns;
}

function countLoggedSignals(input: SessionReadinessCheckIn): number {
  let n = 0;
  if (input.sleepHours != null && Number.isFinite(input.sleepHours)) n += 1;
  if (input.fatigue != null && inScale(input.fatigue)) n += 1;
  if (input.soreness != null && inScale(input.soreness)) n += 1;
  if (input.motivation != null && inScale(input.motivation)) n += 1;
  return n;
}

/**
 * Recommend proceed / minor adjustment / review load from the quick check-in.
 *
 * Hard rules:
 * - Never recommends canceling the workout (`cancelsWorkout` is always false).
 * - A single concerning metric cannot alone produce `review_load`.
 */
export function adjustSessionReadiness(
  input: SessionReadinessCheckIn,
): SessionReadinessAdjustment {
  const concerns = collectSessionConcerns(input);
  const concernCount = concerns.length;
  const signalsLogged = countLoggedSignals(input);
  const notes: string[] = [];

  let recommendation: SessionReadinessAdjustment["recommendation"] = "proceed";
  let singleMetricEscalationBlocked = false;

  if (concernCount === 0) {
    recommendation = "proceed";
    if (signalsLogged === 0) {
      notes.push(
        "No check-in signals yet — recommendation defaults to proceed until you log sleep, fatigue, soreness, or motivation.",
      );
    }
  } else if (concernCount < SESSION_REVIEW_LOAD_MIN_CONCERNS) {
    // Exactly one concern (min is 2 for review_load).
    recommendation = "minor_adjustment";
    singleMetricEscalationBlocked = true;
    notes.push(
      "Only one soft signal is elevated — workout is not cancelled, and “review load” is withheld until more signals agree.",
    );
  } else {
    recommendation = "review_load";
    notes.push(
      `${concernCount} signals look soft together — review today’s top loads; still not an automatic cancel.`,
    );
  }

  // Belt-and-suspenders: never emit review_load from fewer than min concerns.
  if (
    recommendation === "review_load" &&
    concernCount < SESSION_REVIEW_LOAD_MIN_CONCERNS
  ) {
    recommendation = "minor_adjustment";
    singleMetricEscalationBlocked = true;
  }

  notes.push(
    "This adjuster never cancels your session from check-in metrics alone.",
  );

  return {
    recommendation,
    recommendationLabel:
      SESSION_READINESS_RECOMMENDATION_LABELS[recommendation],
    headline: SESSION_READINESS_RECOMMENDATION_LABELS[recommendation],
    detail: SESSION_READINESS_RECOMMENDATION_DETAILS[recommendation],
    concerns,
    concernCount,
    signalsLogged,
    cancelsWorkout: false,
    singleMetricEscalationBlocked,
    notes,
    honesty: SESSION_READINESS_HONESTY,
    engineVersion: SESSION_READINESS_ENGINE_VERSION,
  };
}
