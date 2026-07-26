export {
  HISTORY_ERAS,
  HISTORY_HONESTY,
  HISTORY_TIMELINE_DESCRIPTION,
  HISTORY_TIMELINE_TITLE,
  allHistoryEraSlugs,
  getHistoryEraBySlug,
  historyEraPath,
  historyTimelinePath,
  listHistoryEras,
} from "@/domain/history/timeline";
export type { HistoryEra, HistoryEraSlug } from "@/domain/history/timeline";

export {
  HISTORICAL_ARCHIVE_TITLE,
  HISTORICAL_ARCHIVE_DESCRIPTION,
  ARCHIVE_PROFILE_KINDS,
  ARCHIVE_PROFILE_KIND_LABELS,
  ARCHIVE_LENS_LABELS,
  ARCHIVE_HONESTY,
  ARCHIVE_COPYRIGHT_NOTICE,
} from "@/domain/history/archive-constants";
export type { ArchiveProfileKind } from "@/domain/history/archive-constants";

export type { HistoricalArchiveProfile } from "@/domain/history/archive-types";

export { HISTORICAL_ARCHIVE_PROFILES } from "@/domain/history/archive-profiles";
export type { HistoricalArchiveSlug } from "@/domain/history/archive-profiles";

export {
  listArchiveProfiles,
  getArchiveProfileBySlug,
  allArchiveProfileSlugs,
  archiveProfilePath,
  archiveIndexPath,
  listArchiveProfilesByKind,
  archiveRelatedMethodsValid,
  archiveRelatedErasValid,
} from "@/domain/history/archive";
