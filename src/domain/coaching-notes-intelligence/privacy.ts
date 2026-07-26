/**
 * Privacy + eligibility for Coaching Notes Intelligence.
 */

import type { CoachNoteForIntelligence } from "@/domain/coaching-notes-intelligence/types";

/**
 * Notes eligible for AI summarization.
 * Private notes and opted-out notes are excluded.
 */
export function notesEligibleForAiSummary(
  notes: readonly CoachNoteForIntelligence[],
): CoachNoteForIntelligence[] {
  return notes.filter(
    (n) =>
      n.status === "active" &&
      !n.isPrivate &&
      n.allowAiSummarize &&
      n.body.trim().length > 0,
  );
}

/**
 * Notes that may be scanned by unrelated product heuristics (e.g. TCI).
 * Private notes are always excluded.
 */
export function notesAllowedForUnrelatedProductUse(
  notes: readonly CoachNoteForIntelligence[],
): CoachNoteForIntelligence[] {
  return notes.filter((n) => n.status === "active" && !n.isPrivate);
}

export function countPrivateNotesExcluded(
  notes: readonly CoachNoteForIntelligence[],
): number {
  return notes.filter((n) => n.isPrivate && n.status === "active").length;
}
