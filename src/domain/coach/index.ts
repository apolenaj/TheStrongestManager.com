export {
  COACH_ACCESS_STATUSES,
  COACH_PLATFORM_HONESTY,
  COACH_SCOPES,
  COACH_SCOPE_LABELS,
  DEFAULT_COACH_SCOPES,
  SENSITIVE_COACH_SCOPES,
  describeRoles,
  hasCoachScope,
  parseCoachScopes,
  serializeCoachScopes,
} from "@/domain/coach/permissions";
export type {
  CoachAccessStatus,
  CoachScope,
  UserRoles,
} from "@/domain/coach/permissions";
export {
  COACH_ATHLETE_DETAIL_HONESTY,
  COACH_MODIFICATION_KINDS,
  COACH_MODIFICATION_KIND_LABELS,
  COACH_WORKSPACE_SECTIONS,
  COACH_WORKSPACE_SECTION_LABELS,
  SUGGESTION_AUTHORSHIP,
  SUGGESTION_AUTHORSHIP_LABELS,
  canViewWorkspaceSection,
  isCoachModificationKind,
  isCoachWorkspaceSection,
  sectionRequiredScopes,
} from "@/domain/coach/workspace";
export type {
  CoachModificationKind,
  CoachWorkspaceSection,
  SuggestionAuthorship,
} from "@/domain/coach/workspace";
