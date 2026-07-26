/**
 * Opt-in leaderboards (Prompt 76).
 * No fake rankings — empty when insufficient real opted-in data.
 */

export type LeaderboardCategoryId =
  | "verified_lifts"
  | "rep_prs"
  | "technique_improvement"
  | "consistency";

/** Verification tiers — always labeled; never mixed as equal. */
export type LiftVerificationTier =
  | "self_reported"
  | "video_verified"
  | "competition_verified";

export const LEADERBOARD_CATEGORY_OPTIONS: readonly {
  id: LeaderboardCategoryId;
  label: string;
  description: string;
}[] = [
  {
    id: "verified_lifts",
    label: "Verified lifts",
    description: "Best singles ranked with clear verification labels",
  },
  {
    id: "rep_prs",
    label: "Rep PRs",
    description: "Best multi-rep efforts (load × reps), labeled by source",
  },
  {
    id: "technique_improvement",
    label: "Technique improvement",
    description: "Positive technique score change over a recent window",
  },
  {
    id: "consistency",
    label: "Consistency",
    description: "Completed training sessions in the window — not recovery",
  },
] as const;

export const VERIFICATION_LABELS: Record<LiftVerificationTier, string> = {
  self_reported: "Self-reported",
  video_verified: "Video verified",
  competition_verified: "Competition verified",
};

/** Categories we refuse to build — safety / product rules. */
export const LEADERBOARD_FORBIDDEN_CATEGORIES = [
  "recovery",
  "weight_loss",
  "bodyweight_drop",
  "readiness",
] as const;

export const LEADERBOARD_SAFETY_NOTES = [
  "Leaderboards are opt-in only. Empty boards mean not enough real participants — we never invent ranks.",
  "Self-reported lifts are labeled and are not equal to video- or competition-verified results.",
  "Do not chase unsafe loads for a ranking. Technique and recovery come first.",
  "We do not rank recovery scores or aggressive weight-loss metrics.",
] as const;

export type LeaderboardCategoryParticipation = Record<
  LeaderboardCategoryId,
  boolean
>;

export function defaultCategoryParticipation(): LeaderboardCategoryParticipation {
  return {
    verified_lifts: true,
    rep_prs: true,
    technique_improvement: true,
    consistency: true,
  };
}

export function parseCategoriesJson(
  raw: string | null | undefined,
): LeaderboardCategoryParticipation {
  const base = defaultCategoryParticipation();
  if (!raw?.trim()) return base;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const opt of LEADERBOARD_CATEGORY_OPTIONS) {
      if (typeof parsed[opt.id] === "boolean") {
        base[opt.id] = parsed[opt.id] as boolean;
      }
    }
    return base;
  } catch {
    return base;
  }
}

export function serializeCategories(
  c: LeaderboardCategoryParticipation,
): string {
  return JSON.stringify(c);
}

/**
 * Map ProgressMetric / session source strings to verification tiers.
 */
export function resolveVerificationTier(
  source: string | null | undefined,
): LiftVerificationTier {
  const s = (source ?? "reported").toLowerCase();
  if (s === "competition" || s === "competition_verified" || s === "meet") {
    return "competition_verified";
  }
  if (s === "observed" || s === "video" || s === "video_verified") {
    return "video_verified";
  }
  return "self_reported";
}

/** Prefer stronger verification when comparing equal loads. */
export function verificationRank(tier: LiftVerificationTier): number {
  if (tier === "competition_verified") return 3;
  if (tier === "video_verified") return 2;
  return 1;
}
