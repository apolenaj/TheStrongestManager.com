/**
 * Coaching Notes Intelligence service (Prompt 131).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  COACHING_NOTES_INTELLIGENCE_HONESTY,
  COACHING_NOTES_SOURCE,
  COACHING_NOTES_SOURCE_LABELS,
  assembleCoachNotesAiSummary,
  toCoachNoteDisplayItem,
  type CoachingNoteDisplayItem,
} from "@/domain/coaching-notes-intelligence";
import { assertCoachCanAccessAthlete } from "@/services/coach/coach-service";

function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export type CoachingNotesIntelligenceView = {
  athleteProfileId: string;
  athleteDisplayName: string | null;
  honesty: readonly string[];
  notes: CoachingNoteDisplayItem[];
  summaries: CoachingNoteDisplayItem[];
};

export async function getCoachingNotesIntelligenceView(input: {
  coachUserId: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; view: CoachingNotesIntelligenceView }
  | { ok: false; error: string }
> {
  if (!featureFlags.coachingNotesIntelligence) {
    return {
      ok: false,
      error: "Coaching Notes Intelligence is not enabled.",
    };
  }

  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const [profile, notes, summaries] = await Promise.all([
    prisma.athleteProfile.findUnique({
      where: { id: input.athleteProfileId },
      select: { id: true, displayName: true },
    }),
    prisma.coachNote.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "active",
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        section: true,
        body: true,
        isPrivate: true,
        createdAt: true,
      },
    }),
    prisma.coachNoteSummary.findMany({
      where: { athleteProfileId: input.athleteProfileId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  if (!profile) return { ok: false, error: "Athlete not found." };

  return {
    ok: true,
    view: {
      athleteProfileId: profile.id,
      athleteDisplayName: profile.displayName,
      honesty: COACHING_NOTES_INTELLIGENCE_HONESTY,
      notes: notes.map((n) =>
        toCoachNoteDisplayItem({
          id: n.id,
          section: n.section,
          body: n.body,
          isPrivate: n.isPrivate,
          createdAt: n.createdAt.toISOString(),
        }),
      ),
      summaries: summaries.map((s) => ({
        id: s.id,
        source: COACHING_NOTES_SOURCE.ai_summary,
        sourceLabel: COACHING_NOTES_SOURCE_LABELS.ai_summary,
        body: s.summaryBody,
        createdAt: s.createdAt.toISOString(),
        sourceNoteIds: parseJsonArray(s.sourceNoteIdsJson),
        engineVersion: s.engineVersion,
      })),
    },
  };
}

export async function summarizeCoachNotes(input: {
  coachUserId: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; summaryId: string }
  | { ok: false; error: string }
> {
  if (!featureFlags.coachingNotesIntelligence) {
    return { ok: false, error: "Feature off." };
  }

  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const notes = await prisma.coachNote.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      status: "active",
    },
    orderBy: { createdAt: "desc" },
    take: 60,
    select: {
      id: true,
      section: true,
      body: true,
      isPrivate: true,
      allowAiSummarize: true,
      status: true,
      createdAt: true,
      coachUserId: true,
    },
  });

  const assembled = assembleCoachNotesAiSummary(
    notes.map((n) => ({
      id: n.id,
      section: n.section,
      body: n.body,
      isPrivate: n.isPrivate,
      allowAiSummarize: n.allowAiSummarize,
      status: n.status,
      createdAt: n.createdAt.toISOString(),
      coachUserId: n.coachUserId,
    })),
  );

  if ("ok" in assembled && assembled.ok === false) {
    return { ok: false, error: assembled.error };
  }
  if ("ok" in assembled) {
    return { ok: false, error: "Could not build summary." };
  }

  const row = await prisma.coachNoteSummary.create({
    data: {
      athleteProfileId: input.athleteProfileId,
      requestedByUserId: input.coachUserId,
      sourceNoteIdsJson: JSON.stringify(assembled.sourceNoteIds),
      summaryBody: assembled.body,
      excludedPrivateCount: assembled.excludedPrivateCount,
      engineVersion: assembled.engineVersion,
      source: COACHING_NOTES_SOURCE.ai_summary,
    },
  });

  return { ok: true, summaryId: row.id };
}
