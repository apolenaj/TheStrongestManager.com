/**
 * Multi-Sport Athlete Mode (Prompt 108).
 * Multiple sport focuses on one AthleteProfile — never duplicate profiles.
 */

export const MULTI_SPORT_MODE_ENGINE_VERSION = "multi_sport_mode.v1" as const;

/**
 * Sports that can be active focuses (modes with distinct PR namespaces).
 * `hybrid` is a collapsed primaryDiscipline label, not a selectable focus.
 */
export const MULTI_SPORT_FOCUS_IDS = [
  "powerlifting",
  "bodybuilding",
  "strongman",
  "weightlifting",
  "general_strength",
] as const;

export type MultiSportFocusId = (typeof MULTI_SPORT_FOCUS_IDS)[number];

export const MULTI_SPORT_FOCUS_LABELS: Record<MultiSportFocusId, string> = {
  powerlifting: "Powerlifting",
  bodybuilding: "Bodybuilding",
  strongman: "Strongman",
  weightlifting: "Weightlifting",
  general_strength: "General strength",
};

/** Mode shell routes for each focus (feature-gated separately). */
export const MULTI_SPORT_MODE_HREF: Record<MultiSportFocusId, string> = {
  powerlifting: "/app/powerlifting",
  bodybuilding: "/app/bodybuilding",
  strongman: "/app/strongman",
  weightlifting: "/app/weightlifting",
  general_strength: "/app/training",
};

/** PR namespace for dashboard separation — bodybuilding has no lift PR keys. */
export const MULTI_SPORT_PR_NAMESPACE: Record<
  MultiSportFocusId,
  "lift" | "sm" | "wl" | "none"
> = {
  powerlifting: "lift",
  bodybuilding: "none",
  strongman: "sm",
  weightlifting: "wl",
  general_strength: "lift",
};

export const MULTI_SPORT_MODE_HONESTY = [
  "Multi-Sport Athlete Mode keeps one AthleteProfile — selecting Powerlifting + Strongman does not create a second profile.",
  "PRs stay separated by sport namespace (lift_*, sm_*, wl_*). Totals are never mixed across sports.",
  "The dashboard adapts to active focuses. Training may contain mixed goals across focuses.",
  "primaryDiscipline remains a lead label for scoring; preferredSports is the source of truth for focuses.",
] as const;

export function isMultiSportFocusId(raw: string): raw is MultiSportFocusId {
  return (MULTI_SPORT_FOCUS_IDS as readonly string[]).includes(raw);
}

/**
 * Map stored preferredSports / primaryDiscipline into ordered focus ids.
 * Dedupes; drops hybrid / unknown; maps `general` → general_strength.
 */
export function normalizeSportFocuses(input: {
  preferredSports: string[];
  primaryDiscipline: string | null;
}): MultiSportFocusId[] {
  const raw = [...input.preferredSports];
  if (raw.length === 0 && input.primaryDiscipline) {
    raw.push(input.primaryDiscipline);
  }

  const seen = new Set<MultiSportFocusId>();
  const out: MultiSportFocusId[] = [];
  for (const item of raw) {
    let id = item;
    if (id === "general") id = "general_strength";
    if (id === "hybrid") continue;
    if (!isMultiSportFocusId(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function isMultiSportAthlete(focuses: MultiSportFocusId[]): boolean {
  return focuses.length >= 2;
}
