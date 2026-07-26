import type { ArchiveProfileKind } from "@/domain/history/archive-constants";

export type HistoricalArchiveProfile = {
  slug: string;
  kind: ArchiveProfileKind;
  title: string;
  subtitle: string;
  periodLabel: string;
  teaser: string;
  /** Short principle bullets — never a reprinted program. */
  principlesSummary: string[];
  whatWasInnovative: string[];
  whatRemainsUseful: string[];
  whatModernEvidenceQuestions: string[];
  relatedEraSlugs: string[];
  relatedMethodSlugs: string[];
  /** Optional method-graph coach/practice node ids. */
  relatedGraphNodeIds: string[];
};
