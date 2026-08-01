/**
 * Transparent program-finder scoring (not AI).
 * Each answer adds explicit weighted points; reasons are stable i18n keys for the UI.
 */

export const PROGRAM_FINDER_FAMILIES = [
  "linear-strength-builder",
  "dup-powerlifting-system",
  "block-periodisation",
  "conjugate-strength-system",
  "high-frequency-sbd",
  "powerbuilding-hybrid",
] as const;

export type ProgramFinderFamilyId =
  (typeof PROGRAM_FINDER_FAMILIES)[number];

export const PROGRAM_FINDER_GOALS = [
  "strength",
  "powerlifting",
  "hypertrophy",
  "competition_prep",
  "general_strength",
] as const;

export const PROGRAM_FINDER_EXPERIENCE = [
  "beginner",
  "intermediate",
  "advanced",
] as const;

export const PROGRAM_FINDER_DAYS = ["3", "4", "5", "6"] as const;

export const PROGRAM_FINDER_WEAKEST = [
  "squat",
  "bench",
  "deadlift",
  "none",
] as const;

export const PROGRAM_FINDER_RECOVERY = ["poor", "okay", "good"] as const;

export type ProgramFinderAnswers = {
  goal: (typeof PROGRAM_FINDER_GOALS)[number];
  experience: (typeof PROGRAM_FINDER_EXPERIENCE)[number];
  days: (typeof PROGRAM_FINDER_DAYS)[number];
  weakest: (typeof PROGRAM_FINDER_WEAKEST)[number];
  recovery: (typeof PROGRAM_FINDER_RECOVERY)[number];
};

/** Stable reason key resolved via ProgramsPage.finderQuiz.reasons.* */
export type ProgramFinderReason = {
  key: string;
  lift?: "squat" | "bench" | "deadlift";
};

export type ProgramFinderScoreBreakdown = {
  familyId: ProgramFinderFamilyId;
  score: number;
  reasons: ProgramFinderReason[];
};

export type ProgramFinderResult = {
  primary: ProgramFinderScoreBreakdown;
  secondary: ProgramFinderScoreBreakdown;
  rankings: ProgramFinderScoreBreakdown[];
  /** Stable honesty notice key — translate in UI via finderQuiz.honesty */
  honesty: "transparent_weighted_score";
};

const FAMILY_LABEL: Record<ProgramFinderFamilyId, string> = {
  "linear-strength-builder": "Linear Strength Builder",
  "dup-powerlifting-system": "DUP Powerlifting System",
  "block-periodisation": "Block Periodisation",
  "conjugate-strength-system": "Conjugate Strength System",
  "high-frequency-sbd": "High-Frequency SBD",
  "powerbuilding-hybrid": "Powerbuilding Hybrid",
};

export function programFinderFamilyLabel(
  familyId: ProgramFinderFamilyId,
): string {
  return FAMILY_LABEL[familyId];
}

function emptyScores(): Record<
  ProgramFinderFamilyId,
  { score: number; reasons: ProgramFinderReason[] }
> {
  return {
    "linear-strength-builder": { score: 0, reasons: [] },
    "dup-powerlifting-system": { score: 0, reasons: [] },
    "block-periodisation": { score: 0, reasons: [] },
    "conjugate-strength-system": { score: 0, reasons: [] },
    "high-frequency-sbd": { score: 0, reasons: [] },
    "powerbuilding-hybrid": { score: 0, reasons: [] },
  };
}

function add(
  scores: ReturnType<typeof emptyScores>,
  familyId: ProgramFinderFamilyId,
  points: number,
  reason: ProgramFinderReason,
) {
  if (points === 0) return;
  scores[familyId].score += points;
  scores[familyId].reasons.push(reason);
}

function r(key: string, lift?: ProgramFinderReason["lift"]): ProgramFinderReason {
  return lift ? { key, lift } : { key };
}

/**
 * Deterministic weighted scoring. Same answers → same ranking.
 */
export function scoreProgramFinder(
  answers: ProgramFinderAnswers,
): ProgramFinderResult {
  const scores = emptyScores();
  const days = Number(answers.days);

  // --- Goal ---
  switch (answers.goal) {
    case "strength":
    case "general_strength":
      add(scores, "linear-strength-builder", 4, r("goal.strength.linear"));
      add(scores, "dup-powerlifting-system", 2, r("goal.strength.dup"));
      add(scores, "powerbuilding-hybrid", 2, r("goal.strength.hybrid"));
      break;
    case "powerlifting":
      add(scores, "dup-powerlifting-system", 4, r("goal.powerlifting.dup"));
      add(scores, "high-frequency-sbd", 3, r("goal.powerlifting.highFreq"));
      add(scores, "conjugate-strength-system", 2, r("goal.powerlifting.conjugate"));
      add(scores, "block-periodisation", 2, r("goal.powerlifting.block"));
      break;
    case "hypertrophy":
      add(scores, "powerbuilding-hybrid", 5, r("goal.hypertrophy.hybrid"));
      add(scores, "dup-powerlifting-system", 2, r("goal.hypertrophy.dup"));
      add(scores, "linear-strength-builder", 1, r("goal.hypertrophy.linear"));
      break;
    case "competition_prep":
      add(scores, "block-periodisation", 5, r("goal.comp.block"));
      add(scores, "dup-powerlifting-system", 3, r("goal.comp.dup"));
      add(scores, "conjugate-strength-system", 2, r("goal.comp.conjugate"));
      break;
  }

  // --- Experience ---
  switch (answers.experience) {
    case "beginner":
      add(scores, "linear-strength-builder", 5, r("exp.beginner.linear"));
      add(scores, "powerbuilding-hybrid", 1, r("exp.beginner.hybrid"));
      add(scores, "conjugate-strength-system", -4, r("exp.beginner.conjugate"));
      add(scores, "high-frequency-sbd", -3, r("exp.beginner.highFreq"));
      add(scores, "block-periodisation", -2, r("exp.beginner.block"));
      break;
    case "intermediate":
      add(scores, "dup-powerlifting-system", 4, r("exp.intermediate.dup"));
      add(scores, "powerbuilding-hybrid", 3, r("exp.intermediate.hybrid"));
      add(scores, "block-periodisation", 2, r("exp.intermediate.block"));
      add(scores, "linear-strength-builder", 1, r("exp.intermediate.linear"));
      break;
    case "advanced":
      add(scores, "conjugate-strength-system", 4, r("exp.advanced.conjugate"));
      add(scores, "high-frequency-sbd", 3, r("exp.advanced.highFreq"));
      add(scores, "block-periodisation", 3, r("exp.advanced.block"));
      add(scores, "dup-powerlifting-system", 2, r("exp.advanced.dup"));
      add(scores, "linear-strength-builder", -2, r("exp.advanced.linear"));
      break;
  }

  // --- Days available ---
  if (days <= 3) {
    add(scores, "linear-strength-builder", 3, r("days.3.linear"));
    add(scores, "dup-powerlifting-system", 3, r("days.3.dup"));
    add(scores, "high-frequency-sbd", -4, r("days.3.highFreq"));
    add(scores, "conjugate-strength-system", -2, r("days.3.conjugate"));
  } else if (days === 4) {
    add(scores, "dup-powerlifting-system", 2, r("days.4.dup"));
    add(scores, "conjugate-strength-system", 3, r("days.4.conjugate"));
    add(scores, "block-periodisation", 2, r("days.4.block"));
    add(scores, "powerbuilding-hybrid", 2, r("days.4.hybrid"));
    add(scores, "high-frequency-sbd", 1, r("days.4.highFreq"));
  } else if (days === 5) {
    add(scores, "high-frequency-sbd", 3, r("days.5.highFreq"));
    add(scores, "powerbuilding-hybrid", 3, r("days.5.hybrid"));
    add(scores, "block-periodisation", 2, r("days.5.block"));
    add(scores, "conjugate-strength-system", 1, r("days.5.conjugate"));
  } else {
    add(scores, "high-frequency-sbd", 5, r("days.6.highFreq"));
    add(scores, "powerbuilding-hybrid", 2, r("days.6.hybrid"));
    add(scores, "linear-strength-builder", -2, r("days.6.linear"));
  }

  // --- Weakest lift ---
  if (answers.weakest !== "none") {
    const lift = answers.weakest;
    add(scores, "conjugate-strength-system", 3, r("weak.conjugate", lift));
    add(scores, "dup-powerlifting-system", 2, r("weak.dup", lift));
    add(scores, "high-frequency-sbd", 2, r("weak.highFreq", lift));
  } else {
    add(scores, "linear-strength-builder", 1, r("weak.none"));
  }

  // --- Recovery ---
  switch (answers.recovery) {
    case "poor":
      add(scores, "linear-strength-builder", 4, r("rec.poor.linear"));
      add(scores, "dup-powerlifting-system", 1, r("rec.poor.dup"));
      add(scores, "high-frequency-sbd", -5, r("rec.poor.highFreq"));
      add(scores, "conjugate-strength-system", -4, r("rec.poor.conjugate"));
      add(scores, "block-periodisation", -3, r("rec.poor.block"));
      add(scores, "powerbuilding-hybrid", -2, r("rec.poor.hybrid"));
      break;
    case "okay":
      add(scores, "dup-powerlifting-system", 2, r("rec.okay.dup"));
      add(scores, "linear-strength-builder", 2, r("rec.okay.linear"));
      add(scores, "powerbuilding-hybrid", 1, r("rec.okay.hybrid"));
      add(scores, "block-periodisation", 1, r("rec.okay.block"));
      add(scores, "high-frequency-sbd", -1, r("rec.okay.highFreq"));
      break;
    case "good":
      add(scores, "high-frequency-sbd", 3, r("rec.good.highFreq"));
      add(scores, "conjugate-strength-system", 3, r("rec.good.conjugate"));
      add(scores, "block-periodisation", 2, r("rec.good.block"));
      add(scores, "powerbuilding-hybrid", 2, r("rec.good.hybrid"));
      break;
  }

  const rankings: ProgramFinderScoreBreakdown[] = PROGRAM_FINDER_FAMILIES.map(
    (familyId) => ({
      familyId,
      score: scores[familyId].score,
      reasons: scores[familyId].reasons,
    }),
  ).sort((a, b) => b.score - a.score || a.familyId.localeCompare(b.familyId));

  return {
    primary: rankings[0]!,
    secondary: rankings[1]!,
    rankings,
    honesty: "transparent_weighted_score",
  };
}

export function freeProductSlugForFamily(
  familyId: ProgramFinderFamilyId,
): string {
  return `${familyId}-free`;
}

export function paidProductSlugForFamily(
  familyId: ProgramFinderFamilyId,
): string {
  return familyId;
}
