import type { ScoreDefinition } from "@/domain/scoring/types";
import {
  STRENGTH_MIN_CONTEXT_LIFTS_FOR_HIGH,
  STRENGTH_MIN_CONTEXT_LIFTS_FOR_MEDIUM,
} from "@/domain/scoring/strength/thresholds";
import {
  CONSISTENCY_MIN_RESOLVED_FOR_HIGH,
  CONSISTENCY_MIN_RESOLVED_FOR_MEDIUM,
  OVERALL_MIN_DISPLAYABLE_PILLARS,
  PROGRAMMING_MIN_RESOLVED_FOR_MEDIUM,
  RECOVERY_MIN_ENTRIES_FOR_HIGH,
  RECOVERY_MIN_ENTRIES_FOR_MEDIUM,
  RECOVERY_WINDOW_DAYS,
  SESSION_WINDOW_DAYS,
  TECHNIQUE_MIN_ANALYSES_FOR_HIGH,
  TECHNIQUE_MIN_ANALYSES_FOR_MEDIUM,
} from "@/domain/scoring/thresholds";

/**
 * Canonical catalog of score definitions (input sources, formula, minima, confidence).
 * Engines must stay aligned with this catalog — see docs/SCORING_SYSTEM.md.
 */
export const SCORE_DEFINITIONS: Record<
  ScoreDefinition["scoreKey"],
  ScoreDefinition
> = {
  strength: {
    scoreKey: "strength",
    label: "Strength Score",
    inputSources: [
      "ProgressMetric major-lift history (canonical kg, optional reps)",
      "BodyMetric bodyweight (canonical kg)",
      "TrainingExperience.level (beginner | intermediate | advanced | elite→competition)",
      "AthleteProfile.primaryDiscipline (sport lift weights)",
    ],
    formula:
      "Per sport-weighted lift: contextScore = 100 × (effortKg / bodyweightKg) / levelReferenceMultiple. effortKg is verified load, else Epley estimated 1RM (reps 2–12), else reported load. Strength = 0.7 × weighted mean(contextScores) + 0.3 × trendScore when both exist (else whichever is available). Trend maps ±20% recent-vs-prior best effort to 0–100 centered at 50. Estimated 1RM is never treated as a verified PR.",
    requiredMinimumData: [
      "Bodyweight",
      `≥ ${STRENGTH_MIN_CONTEXT_LIFTS_FOR_MEDIUM} sport-relevant lifts with usable efforts (for medium confidence, observed preferred)`,
    ],
    confidenceRules: `none: cannot blend. low: blended from reported-only or trend-only. medium: bodyweight + ≥${STRENGTH_MIN_CONTEXT_LIFTS_FOR_MEDIUM} observed context lifts. high: bodyweight + ≥${STRENGTH_MIN_CONTEXT_LIFTS_FOR_HIGH} observed context lifts.`,
  },
  technique: {
    scoreKey: "technique",
    label: "Technique Score",
    inputSources: [
      "TechniqueAnalysis.overallScore where status=completed",
      "TechniqueAnalysis.confidenceBasis",
    ],
    formula:
      "Technique Score = arithmetic mean of completed overallScore values (already 0–100).",
    requiredMinimumData: [
      `≥ ${TECHNIQUE_MIN_ANALYSES_FOR_MEDIUM} completed analyses with overallScore (for medium confidence)`,
    ],
    confidenceRules: `none: zero analyses. low: 1 analysis. medium: ≥${TECHNIQUE_MIN_ANALYSES_FOR_MEDIUM}. high: ≥${TECHNIQUE_MIN_ANALYSES_FOR_HIGH} and all confidenceBasis=observed.`,
  },
  programming: {
    scoreKey: "programming",
    label: "Programming Score",
    inputSources: [
      "Active Program id",
      `TrainingSession rows linked to that program in the last ${SESSION_WINDOW_DAYS} days`,
    ],
    formula: `Among program-linked sessions in ${SESSION_WINDOW_DAYS}d with status completed or skipped: score = 100 × completed / (completed + skipped).`,
    requiredMinimumData: [
      "Active program assigned",
      `≥ ${PROGRAMMING_MIN_RESOLVED_FOR_MEDIUM} completed|skipped sessions linked to that program in ${SESSION_WINDOW_DAYS}d`,
    ],
    confidenceRules: `none: no active program or below resolved minimum. medium: minima met. high: minima met and ≥1 completed in window.`,
  },
  recovery: {
    scoreKey: "recovery",
    label: "Recovery Score",
    inputSources: [
      `RecoveryEntry.readiness in the last ${RECOVERY_WINDOW_DAYS} days`,
    ],
    formula:
      "Recovery Score = arithmetic mean of readiness values in-window (athlete scale already 0–100; no remapping).",
    requiredMinimumData: [
      `≥ ${RECOVERY_MIN_ENTRIES_FOR_MEDIUM} readiness logs in ${RECOVERY_WINDOW_DAYS}d`,
    ],
    confidenceRules: `none: below ${RECOVERY_MIN_ENTRIES_FOR_MEDIUM}. medium: ≥${RECOVERY_MIN_ENTRIES_FOR_MEDIUM}. high: ≥${RECOVERY_MIN_ENTRIES_FOR_HIGH}.`,
  },
  consistency: {
    scoreKey: "consistency",
    label: "Consistency Score",
    inputSources: [
      `TrainingSession status in the last ${SESSION_WINDOW_DAYS} days`,
    ],
    formula: `Among sessions in ${SESSION_WINDOW_DAYS}d with status completed or skipped: score = 100 × completed / (completed + skipped). Future planned sessions are excluded from the denominator.`,
    requiredMinimumData: [
      `≥ ${CONSISTENCY_MIN_RESOLVED_FOR_MEDIUM} completed|skipped sessions in ${SESSION_WINDOW_DAYS}d`,
    ],
    confidenceRules: `none: below minimum resolved. medium: minima met. high: ≥${CONSISTENCY_MIN_RESOLVED_FOR_HIGH} resolved in window.`,
  },
  overall: {
    scoreKey: "overall",
    label: "Overall Athlete Score",
    inputSources: [
      "Displayable Strength, Technique, Programming, Recovery, Consistency pillar results",
    ],
    formula:
      "Overall = arithmetic mean of pillar scores that pass the displayable confidence gate (equal weights). Pillars below the gate are omitted, not zero-filled.",
    requiredMinimumData: [
      `≥ ${OVERALL_MIN_DISPLAYABLE_PILLARS} pillars with displayable confidence`,
    ],
    confidenceRules: `none: fewer than ${OVERALL_MIN_DISPLAYABLE_PILLARS} displayable pillars. Otherwise confidence = minimum confidence among included pillars.`,
  },
};

export const SCORE_DEFINITION_LIST = Object.values(SCORE_DEFINITIONS);
