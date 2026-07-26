/**
 * Athlete public profile visibility (Prompt 75).
 * Default: everything private until explicitly enabled.
 */

export type PublicProfileFieldId =
  | "display_name"
  | "sport"
  | "prs"
  | "competition_history"
  | "achievements"
  | "technique_highlights"
  | "training_streak"
  | "body_metrics";

/**
 * Fields that must NEVER appear on a public profile via this system.
 * Enforced in assembly — not selectable.
 */
export const PUBLIC_PROFILE_FORBIDDEN = [
  "recovery",
  "private_notes",
  "coach_notes",
  "movement_notes",
] as const;

export const PUBLIC_PROFILE_FIELD_OPTIONS: readonly {
  id: PublicProfileFieldId;
  label: string;
  /** Off unless athlete enables. */
  defaultOn: boolean;
  description: string;
}[] = [
  {
    id: "display_name",
    label: "Display name",
    defaultOn: true,
    description: "Shown as the profile title when public",
  },
  {
    id: "sport",
    label: "Sport",
    defaultOn: true,
    description: "Primary discipline / sport focus",
  },
  {
    id: "prs",
    label: "PRs",
    defaultOn: false,
    description: "Best logged lifts (load only — not private session notes)",
  },
  {
    id: "competition_history",
    label: "Competition history",
    defaultOn: false,
    description: "Completed meets from Competition Mode",
  },
  {
    id: "achievements",
    label: "Public achievements",
    defaultOn: false,
    description: "Shared PR / technique celebration headlines",
  },
  {
    id: "technique_highlights",
    label: "Technique score highlights",
    defaultOn: false,
    description: "Best overall technique scores by lift — not full reports",
  },
  {
    id: "training_streak",
    label: "Training streak",
    defaultOn: false,
    description: "Consecutive days with a completed session",
  },
  {
    id: "body_metrics",
    label: "Body metrics",
    defaultOn: false,
    description: "Only if you explicitly select this — never by default",
  },
] as const;

export type PublicProfileVisibility = Record<PublicProfileFieldId, boolean>;

export function defaultVisibility(): PublicProfileVisibility {
  const v = {} as PublicProfileVisibility;
  for (const opt of PUBLIC_PROFILE_FIELD_OPTIONS) {
    v[opt.id] = opt.defaultOn;
  }
  return v;
}

export function parseVisibilityJson(raw: string | null | undefined): PublicProfileVisibility {
  const base = defaultVisibility();
  if (!raw?.trim()) return base;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    for (const opt of PUBLIC_PROFILE_FIELD_OPTIONS) {
      if (typeof parsed[opt.id] === "boolean") {
        base[opt.id] = parsed[opt.id] as boolean;
      }
    }
    return base;
  } catch {
    return base;
  }
}

export function serializeVisibility(v: PublicProfileVisibility): string {
  return JSON.stringify(v);
}

/** Slug: lowercase letters, numbers, hyphens; 3–32 chars. */
export function normalizePublicSlug(raw: string): string | null {
  const s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  if (s.length < 3 || s.length > 32) return null;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s)) return null;
  // Reserved
  const reserved = new Set([
    "app",
    "api",
    "admin",
    "share",
    "login",
    "signup",
    "u",
    "settings",
    "null",
    "undefined",
  ]);
  if (reserved.has(s)) return null;
  return s;
}
