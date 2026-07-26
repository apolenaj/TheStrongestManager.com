/**
 * Coach athlete workspace sections & authorship labels (Prompt 36).
 */

import type { CoachScope } from "@/domain/coach/permissions";
import { hasCoachScope } from "@/domain/coach/permissions";

export const COACH_WORKSPACE_SECTIONS = [
  "overview",
  "training",
  "technique",
  "progress",
  "recovery",
  "notes",
  "recommendations",
] as const;
export type CoachWorkspaceSection = (typeof COACH_WORKSPACE_SECTIONS)[number];

export const COACH_WORKSPACE_SECTION_LABELS: Record<
  CoachWorkspaceSection,
  string
> = {
  overview: "Overview",
  training: "Training",
  technique: "Technique",
  progress: "Progress",
  recovery: "Recovery",
  notes: "Notes",
  recommendations: "Recommendations",
};

export const COACH_MODIFICATION_KINDS = [
  "training_review",
  "program_change",
  "technique_focus",
  "recovery_guidance",
  "general",
] as const;
export type CoachModificationKind = (typeof COACH_MODIFICATION_KINDS)[number];

export const COACH_MODIFICATION_KIND_LABELS: Record<
  CoachModificationKind,
  string
> = {
  training_review: "Training review",
  program_change: "Program change",
  technique_focus: "Technique focus",
  recovery_guidance: "Recovery guidance",
  general: "General",
};

/** Authorship discriminator — never conflate AI with human coach. */
export const SUGGESTION_AUTHORSHIP = {
  human_coach: "human_coach",
  ai_engine: "ai_engine",
  system: "system",
} as const;
export type SuggestionAuthorship =
  (typeof SUGGESTION_AUTHORSHIP)[keyof typeof SUGGESTION_AUTHORSHIP];

export const SUGGESTION_AUTHORSHIP_LABELS: Record<SuggestionAuthorship, string> =
  {
    human_coach: "Human coach",
    ai_engine: "AI suggestion",
    system: "System recommendation",
  };

export const COACH_ATHLETE_DETAIL_HONESTY = [
  "Human coach decisions and comments are timestamped and auditable.",
  "AI / engine suggestions are labelled separately and are never presented as coach decisions.",
  "Recovery and detailed body data stay hidden unless the athlete granted those scopes.",
] as const;

/** Which scopes unlock which workspace sections. */
export function sectionRequiredScopes(
  section: CoachWorkspaceSection,
): readonly CoachScope[] | "any_active_grant" {
  switch (section) {
    case "overview":
    case "notes":
      return "any_active_grant";
    case "training":
      return ["training", "programs"];
    case "technique":
      return ["technique_summary", "technique_media"];
    case "progress":
      return ["training", "programs"];
    case "recovery":
      return ["recovery"];
    case "recommendations":
      return ["training", "programs", "technique_summary"];
  }
}

export function canViewWorkspaceSection(
  scopes: readonly CoachScope[],
  section: CoachWorkspaceSection,
): boolean {
  const required = sectionRequiredScopes(section);
  if (required === "any_active_grant") return true;
  return required.some((s) => hasCoachScope(scopes, s));
}

export function isCoachModificationKind(
  value: string,
): value is CoachModificationKind {
  return (COACH_MODIFICATION_KINDS as readonly string[]).includes(value);
}

export function isCoachWorkspaceSection(
  value: string,
): value is CoachWorkspaceSection {
  return (COACH_WORKSPACE_SECTIONS as readonly string[]).includes(value);
}
