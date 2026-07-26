import type { CoachingNotesSource } from "@/domain/coaching-notes-intelligence/constants";

export type CoachNoteForIntelligence = {
  id: string;
  section: string;
  body: string;
  isPrivate: boolean;
  allowAiSummarize: boolean;
  status: string;
  createdAt: string;
  coachUserId: string;
};

export type CoachingNoteDisplayItem = {
  id: string;
  source: CoachingNotesSource;
  sourceLabel: string;
  body: string;
  section?: string;
  isPrivate?: boolean;
  createdAt: string;
  /** For AI summaries — which note ids were included. */
  sourceNoteIds?: string[];
  engineVersion?: string | null;
};

export type CoachNotesAiSummaryResult = {
  source: "ai_summary";
  sourceLabel: string;
  isAiGenerated: true;
  body: string;
  disclaimer: string;
  sourceNoteIds: string[];
  excludedPrivateCount: number;
  engineVersion: string;
  generatedAt: string;
};
