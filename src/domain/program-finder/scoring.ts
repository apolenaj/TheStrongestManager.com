/**
 * Transparent program-finder scoring (not AI).
 * Each answer adds explicit weighted points; reasons are collected for the UI.
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

export type ProgramFinderScoreBreakdown = {
  familyId: ProgramFinderFamilyId;
  score: number;
  reasons: string[];
};

export type ProgramFinderResult = {
  primary: ProgramFinderScoreBreakdown;
  secondary: ProgramFinderScoreBreakdown;
  rankings: ProgramFinderScoreBreakdown[];
  honesty: string;
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
  { score: number; reasons: string[] }
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
  reason: string,
) {
  if (points === 0) return;
  scores[familyId].score += points;
  scores[familyId].reasons.push(reason);
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
      add(scores, "linear-strength-builder", 4, "Primary goal is general strength — linear progression is a clear fit.");
      add(scores, "dup-powerlifting-system", 2, "DUP still supports strength with weekly variation.");
      add(scores, "powerbuilding-hybrid", 2, "Powerbuilding keeps strength primary with accessory volume.");
      break;
    case "powerlifting":
      add(scores, "dup-powerlifting-system", 4, "Powerlifting goal favors undulating SBD emphasis.");
      add(scores, "high-frequency-sbd", 3, "High-frequency SBD increases competition-lift practice.");
      add(scores, "conjugate-strength-system", 2, "Conjugate is a powerlifting-oriented advanced option.");
      add(scores, "block-periodisation", 2, "Block sequencing suits structured powerlifting prep.");
      break;
    case "hypertrophy":
      add(scores, "powerbuilding-hybrid", 5, "Hypertrophy priority maps to the powerbuilding hybrid.");
      add(scores, "dup-powerlifting-system", 2, "DUP includes hypertrophy-oriented days in the week.");
      add(scores, "linear-strength-builder", 1, "Linear still builds base strength that supports muscle work.");
      break;
    case "competition_prep":
      add(scores, "block-periodisation", 5, "Competition prep favors sequenced accumulation → realization.");
      add(scores, "dup-powerlifting-system", 3, "DUP can peak toward a meet with rising specificity.");
      add(scores, "conjugate-strength-system", 2, "Conjugate can increase specificity late in a cycle.");
      break;
  }

  // --- Experience ---
  switch (answers.experience) {
    case "beginner":
      add(scores, "linear-strength-builder", 5, "Beginner experience scores highest on simple linear structure.");
      add(scores, "powerbuilding-hybrid", 1, "Hybrid is usable later; linear is safer first.");
      add(scores, "conjugate-strength-system", -4, "Conjugate is penalized for beginners.");
      add(scores, "high-frequency-sbd", -3, "High frequency is penalized until technique and recovery are proven.");
      add(scores, "block-periodisation", -2, "True block concentration is usually unnecessary for beginners.");
      break;
    case "intermediate":
      add(scores, "dup-powerlifting-system", 4, "Intermediate lifters often respond well to weekly undulation.");
      add(scores, "powerbuilding-hybrid", 3, "Intermediates can handle strength + hypertrophy dual focus.");
      add(scores, "block-periodisation", 2, "Blocks become useful once progress is no longer automatic.");
      add(scores, "linear-strength-builder", 1, "Linear remains viable if you prefer simplicity.");
      break;
    case "advanced":
      add(scores, "conjugate-strength-system", 4, "Advanced lifters can tolerate ME/DE rotation.");
      add(scores, "high-frequency-sbd", 3, "Advanced recovery literacy supports higher frequency.");
      add(scores, "block-periodisation", 3, "Concentrated blocks suit advanced preparation windows.");
      add(scores, "dup-powerlifting-system", 2, "DUP remains a strong advanced powerlifting option.");
      add(scores, "linear-strength-builder", -2, "Long exclusive linear phases score lower for advanced lifters.");
      break;
  }

  // --- Days available ---
  if (days <= 3) {
    add(scores, "linear-strength-builder", 3, "3 training days fit a focused linear template.");
    add(scores, "dup-powerlifting-system", 3, "DUP has a clear 3-day SBD split.");
    add(scores, "high-frequency-sbd", -4, "High-frequency SBD needs more than 3 days to make sense.");
    add(scores, "conjugate-strength-system", -2, "Classic conjugate structure expects a 4-day week.");
  } else if (days === 4) {
    add(scores, "dup-powerlifting-system", 2, "4 days is a strong DUP schedule.");
    add(scores, "conjugate-strength-system", 3, "4 days matches conjugate ME/DE layout.");
    add(scores, "block-periodisation", 2, "4 days supports concentrated block loading.");
    add(scores, "powerbuilding-hybrid", 2, "4 days leaves room for accessories.");
    add(scores, "high-frequency-sbd", 1, "4 days can start a moderated high-frequency plan.");
  } else if (days === 5) {
    add(scores, "high-frequency-sbd", 3, "5 days supports frequent SBD exposures.");
    add(scores, "powerbuilding-hybrid", 3, "5 days suits strength + hypertrophy volume.");
    add(scores, "block-periodisation", 2, "5-day blocks allow dedicated emphasis sessions.");
    add(scores, "conjugate-strength-system", 1, "Extra day can hold special-exercise work.");
  } else {
    add(scores, "high-frequency-sbd", 5, "6 days is the clearest match for high-frequency SBD.");
    add(scores, "powerbuilding-hybrid", 2, "6 days can work if recovery is managed.");
    add(scores, "linear-strength-builder", -2, "6 days usually exceeds what a simple linear plan needs.");
  }

  // --- Weakest lift ---
  if (answers.weakest !== "none") {
    const lift = answers.weakest;
    add(
      scores,
      "conjugate-strength-system",
      3,
      `Weak ${lift} favors conjugate-style special-exercise variation.`,
    );
    add(
      scores,
      "dup-powerlifting-system",
      2,
      `Weak ${lift} can get extra emphasis inside undulating days.`,
    );
    add(
      scores,
      "high-frequency-sbd",
      2,
      `Weak ${lift} benefits from more frequent practice exposures.`,
    );
  } else {
    add(scores, "linear-strength-builder", 1, "No single weak lift — balanced linear work is fine.");
  }

  // --- Recovery ---
  switch (answers.recovery) {
    case "poor":
      add(scores, "linear-strength-builder", 4, "Poor recovery favors lower complexity and clearer fatigue control.");
      add(scores, "dup-powerlifting-system", 1, "DUP can stay moderate if RPE is capped.");
      add(scores, "high-frequency-sbd", -5, "High frequency is heavily penalized when recovery is poor.");
      add(scores, "conjugate-strength-system", -4, "Conjugate max-effort stress is a poor match for low recovery.");
      add(scores, "block-periodisation", -3, "Accumulation blocks are risky when recovery is already poor.");
      add(scores, "powerbuilding-hybrid", -2, "Hybrid accessory volume adds fatigue when recovery is limited.");
      break;
    case "okay":
      add(scores, "dup-powerlifting-system", 2, "Okay recovery supports moderate undulating stress.");
      add(scores, "linear-strength-builder", 2, "Okay recovery pairs well with simple progressive overload.");
      add(scores, "powerbuilding-hybrid", 1, "Hybrid is usable with careful accessory dosing.");
      add(scores, "block-periodisation", 1, "Blocks are possible if accumulation stays honest.");
      add(scores, "high-frequency-sbd", -1, "High frequency remains a cautious choice on okay recovery.");
      break;
    case "good":
      add(scores, "high-frequency-sbd", 3, "Good recovery unlocks higher training frequency.");
      add(scores, "conjugate-strength-system", 3, "Good recovery supports max-effort / dynamic rotation.");
      add(scores, "block-periodisation", 2, "Good recovery tolerates concentrated loading.");
      add(scores, "powerbuilding-hybrid", 2, "Good recovery supports dual strength/hypertrophy stress.");
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
    honesty:
      "This recommendation is a transparent weighted score from your answers — not AI, not a guarantee, and not personalized coaching.",
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
