/**
 * Build a partial profile from limited self-report answers.
 * Never calls computeAthleteScores. Never invents an overall number.
 */

import { SCORE_DEFINITIONS } from "@/domain/scoring/definitions";
import { OVERALL_MIN_DISPLAYABLE_PILLARS } from "@/domain/scoring/thresholds";
import {
  ATHLETE_ASSESSMENT_EXPERIENCE,
  ATHLETE_ASSESSMENT_FREQUENCY,
  ATHLETE_ASSESSMENT_GOALS,
  ATHLETE_ASSESSMENT_LOCKED_SECTIONS,
  ATHLETE_ASSESSMENT_LOGGING,
  ATHLETE_ASSESSMENT_NOT_FULL_LABEL,
  ATHLETE_ASSESSMENT_PRIVACY_COPY,
  ATHLETE_ASSESSMENT_RECOVERY,
  ATHLETE_ASSESSMENT_SELF_LABEL,
  ATHLETE_ASSESSMENT_SPORTS,
  type AthleteAssessmentAnswers,
} from "@/domain/athlete-assessment/constants";

export type PartialProfileField = {
  key: string;
  label: string;
  value: string;
  /** Always reported for this funnel. */
  source: "reported";
  estimateLabel: typeof ATHLETE_ASSESSMENT_SELF_LABEL;
};

export type PillarUnlockHint = {
  pillar: string;
  label: string;
  needs: string[];
  status: "missing_logged_data";
};

export type PartialAthleteProfile = {
  labels: {
    selfAssessment: typeof ATHLETE_ASSESSMENT_SELF_LABEL;
    notFullScore: typeof ATHLETE_ASSESSMENT_NOT_FULL_LABEL;
  };
  headline: string;
  summary: string;
  fields: PartialProfileField[];
  focusHints: string[];
  pillarUnlocks: PillarUnlockHint[];
  overallUnlock: {
    needs: string;
    detail: string;
  };
  athleteScore: {
    shown: false;
    reason: string;
  };
  lockedSections: readonly string[];
  privacyNote: string;
  honestyNote: string;
};

function labelOf<T extends { id: string; label: string }>(
  catalog: readonly T[],
  id: string,
): string {
  return catalog.find((c) => c.id === id)?.label ?? id;
}

function focusHintsFor(answers: AthleteAssessmentAnswers): string[] {
  const hints: string[] = [];
  if (answers.goal === "powerlifting" || answers.sport === "powerlifting") {
    hints.push(
      "When you log SBD sessions and technique clips, Strength and Technique pillars can become displayable.",
    );
  } else if (answers.goal === "physique" || answers.sport === "bodybuilding") {
    hints.push(
      "Consistency and Programming pillars grow from completed sessions on an assigned program — not from this questionnaire.",
    );
  } else if (answers.goal === "strongman" || answers.sport === "strongman") {
    hints.push(
      "Log event-specific sessions in Strongman Mode later — Athlete Score still needs observed training rows, not event guesses here.",
    );
  } else {
    hints.push(
      "Start by logging a few completed sessions so Consistency can resolve without inventing attendance.",
    );
  }

  if (answers.recovery === "struggling") {
    hints.push(
      "Recovery Score needs readiness logs in-app — your “under-recovered” answer is a Self-assessment estimate only.",
    );
  } else {
    hints.push(
      "Optional readiness logs unlock Recovery; until then that pillar stays unavailable (not zero).",
    );
  }

  if (answers.logging === "no") {
    hints.push(
      "You are not logging yet — create an account and complete sessions so the real Athlete Score has inputs.",
    );
  } else {
    hints.push(
      "Bring your logging habit into the app so reported history can become observed Progress and sessions.",
    );
  }

  if (answers.experience === "beginner") {
    hints.push(
      "Experience is self-reported. Athlete Level and Strength context still wait on logged evidence — Not full Athlete Score.",
    );
  }

  return hints.slice(0, 4);
}

/**
 * Partial profile from limited questions — Self-assessment estimate only.
 */
export function buildPartialAthleteProfile(
  answers: AthleteAssessmentAnswers,
): PartialAthleteProfile {
  const fields: PartialProfileField[] = [
    {
      key: "goal",
      label: "Primary goal",
      value: labelOf(ATHLETE_ASSESSMENT_GOALS, answers.goal),
      source: "reported",
      estimateLabel: ATHLETE_ASSESSMENT_SELF_LABEL,
    },
    {
      key: "experience",
      label: "Experience",
      value: labelOf(ATHLETE_ASSESSMENT_EXPERIENCE, answers.experience),
      source: "reported",
      estimateLabel: ATHLETE_ASSESSMENT_SELF_LABEL,
    },
    {
      key: "sport",
      label: "Sport focus",
      value: labelOf(ATHLETE_ASSESSMENT_SPORTS, answers.sport),
      source: "reported",
      estimateLabel: ATHLETE_ASSESSMENT_SELF_LABEL,
    },
    {
      key: "frequency",
      label: "Training frequency",
      value: labelOf(ATHLETE_ASSESSMENT_FREQUENCY, answers.frequency),
      source: "reported",
      estimateLabel: ATHLETE_ASSESSMENT_SELF_LABEL,
    },
    {
      key: "recovery",
      label: "Recovery feel",
      value: labelOf(ATHLETE_ASSESSMENT_RECOVERY, answers.recovery),
      source: "reported",
      estimateLabel: ATHLETE_ASSESSMENT_SELF_LABEL,
    },
    {
      key: "logging",
      label: "Currently logging",
      value: labelOf(ATHLETE_ASSESSMENT_LOGGING, answers.logging),
      source: "reported",
      estimateLabel: ATHLETE_ASSESSMENT_SELF_LABEL,
    },
  ];

  const pillarKeys = [
    "strength",
    "technique",
    "programming",
    "recovery",
    "consistency",
  ] as const;

  const pillarUnlocks: PillarUnlockHint[] = pillarKeys.map((key) => {
    const def = SCORE_DEFINITIONS[key];
    return {
      pillar: key,
      label: def.label,
      needs: [...def.requiredMinimumData],
      status: "missing_logged_data",
    };
  });

  return {
    labels: {
      selfAssessment: ATHLETE_ASSESSMENT_SELF_LABEL,
      notFullScore: ATHLETE_ASSESSMENT_NOT_FULL_LABEL,
    },
    headline: "Partial profile ready",
    summary: `Self-assessment estimate from ${fields.length} answers. Not full Athlete Score — no pillar or overall number was computed from this questionnaire.`,
    fields,
    focusHints: focusHintsFor(answers),
    pillarUnlocks,
    overallUnlock: {
      needs: `≥ ${OVERALL_MIN_DISPLAYABLE_PILLARS} displayable pillars from logged data`,
      detail: SCORE_DEFINITIONS.overall.requiredMinimumData.join("; "),
    },
    athleteScore: {
      shown: false,
      reason:
        "Not full Athlete Score. The real overall score is the equal-weight mean of displayable pillars from logged training — never from self-assessment alone.",
    },
    lockedSections: ATHLETE_ASSESSMENT_LOCKED_SECTIONS,
    privacyNote: ATHLETE_ASSESSMENT_PRIVACY_COPY,
    honestyNote:
      "Self-assessment estimate. Reported answers only. Create an account for a real data-driven score.",
  };
}

export function isCompleteAthleteAssessmentAnswers(
  value: Partial<AthleteAssessmentAnswers> | null | undefined,
): value is AthleteAssessmentAnswers {
  if (!value) return false;
  return Boolean(
    value.goal &&
      value.experience &&
      value.sport &&
      value.frequency &&
      value.recovery &&
      value.logging,
  );
}
