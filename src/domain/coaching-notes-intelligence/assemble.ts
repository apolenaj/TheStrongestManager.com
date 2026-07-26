/**
 * Deterministic extractive AI summary of coach notes.
 * Always labelled AI summary — never attributed as a coach note.
 */

import {
  COACHING_NOTES_AI_SUMMARY_DISCLAIMER,
  COACHING_NOTES_INTELLIGENCE_ENGINE_VERSION,
  COACHING_NOTES_SOURCE,
  COACHING_NOTES_SOURCE_LABELS,
} from "@/domain/coaching-notes-intelligence/constants";
import {
  countPrivateNotesExcluded,
  notesEligibleForAiSummary,
} from "@/domain/coaching-notes-intelligence/privacy";
import type {
  CoachNoteForIntelligence,
  CoachNotesAiSummaryResult,
} from "@/domain/coaching-notes-intelligence/types";

const SECTION_LABELS: Record<string, string> = {
  overview: "Overview",
  training: "Training",
  technique: "Technique",
  progress: "Progress",
  recovery: "Recovery",
  notes: "Notes",
  recommendations: "Recommendations",
};

/**
 * Build an AI summary from eligible (non-private) coach notes.
 */
export function assembleCoachNotesAiSummary(
  notes: readonly CoachNoteForIntelligence[],
  now: Date = new Date(),
): CoachNotesAiSummaryResult | { ok: false; error: string } {
  const eligible = notesEligibleForAiSummary(notes);
  const excludedPrivateCount = countPrivateNotesExcluded(notes);

  if (eligible.length === 0) {
    return {
      ok: false,
      error:
        excludedPrivateCount > 0
          ? "No eligible notes to summarize — private notes are excluded from AI summaries."
          : "No active coach notes available to summarize.",
    };
  }

  const bySection = new Map<string, CoachNoteForIntelligence[]>();
  for (const n of eligible) {
    const list = bySection.get(n.section) ?? [];
    list.push(n);
    bySection.set(n.section, list);
  }

  const lines: string[] = [];
  lines.push(
    `AI overview of ${eligible.length} coach note${eligible.length === 1 ? "" : "s"} (private notes excluded).`,
  );

  if (excludedPrivateCount > 0) {
    lines.push(
      `${excludedPrivateCount} private note${excludedPrivateCount === 1 ? "" : "s"} withheld from this summary.`,
    );
  }

  const sections = [...bySection.keys()].sort();
  for (const section of sections) {
    const sectionNotes = bySection.get(section) ?? [];
    const label = SECTION_LABELS[section] ?? section;
    lines.push(`${label} (${sectionNotes.length}):`);
    for (const n of sectionNotes.slice(0, 3)) {
      const snippet = n.body.trim().replace(/\s+/g, " ").slice(0, 140);
      lines.push(
        `• “${snippet}${n.body.trim().length > 140 ? "…" : ""}”`,
      );
    }
    if (sectionNotes.length > 3) {
      lines.push(`• …and ${sectionNotes.length - 3} more in this section.`);
    }
  }

  lines.push(COACHING_NOTES_AI_SUMMARY_DISCLAIMER);

  return {
    source: COACHING_NOTES_SOURCE.ai_summary,
    sourceLabel: COACHING_NOTES_SOURCE_LABELS.ai_summary,
    isAiGenerated: true,
    body: lines.join("\n"),
    disclaimer: COACHING_NOTES_AI_SUMMARY_DISCLAIMER,
    sourceNoteIds: eligible.map((n) => n.id),
    excludedPrivateCount,
    engineVersion: COACHING_NOTES_INTELLIGENCE_ENGINE_VERSION,
    generatedAt: now.toISOString(),
  };
}

export function toCoachNoteDisplayItem(note: {
  id: string;
  section: string;
  body: string;
  isPrivate: boolean;
  createdAt: string;
}): {
  id: string;
  source: "coach_note";
  sourceLabel: string;
  body: string;
  section: string;
  isPrivate: boolean;
  createdAt: string;
} {
  return {
    id: note.id,
    source: COACHING_NOTES_SOURCE.coach_note,
    sourceLabel: COACHING_NOTES_SOURCE_LABELS.coach_note,
    body: note.body,
    section: note.section,
    isPrivate: note.isPrivate,
    createdAt: note.createdAt,
  };
}
