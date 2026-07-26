/**
 * Coach AI Copilot — generate drafts, never auto-apply; coach accept/edit/reject.
 */

import {
  COACH_AI_COPILOT_HONESTY,
  COACH_AI_ENGINE_VERSION,
  COACH_AI_SUGGESTION_KIND_LABELS,
  decisionEventType,
  draftCoachAiSuggestions,
  isCoachAiDecision,
  statusAfterDecision,
  type CoachAiAthleteSignals,
  type CoachAiDecision,
  type CoachAiSuggestionKind,
} from "@/domain/coach-ai";
import { SUGGESTION_AUTHORSHIP } from "@/domain/coach";
import { featureFlags } from "@/config/feature-flags";
import { prisma } from "@/lib/db";
import { assertCoachCanAccessAthlete } from "@/services/coach/coach-service";
import { createCoachModification } from "@/services/coach/coach-athlete-service";
import { recordCoachAiDecisionFeedback } from "@/services/model-feedback/model-feedback-service";

function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function parseSupportingData(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export type CoachAiSuggestionView = {
  id: string;
  kind: string;
  kindLabel: string;
  title: string;
  suggestedChange: string;
  why: string;
  supportingData: string[];
  confidence: string;
  status: string;
  authorship: string;
  engineVersion: string;
  editedChange: string | null;
  decisionNote: string | null;
  decidedAt: string | null;
  createdAt: string;
  events: Array<{
    id: string;
    eventType: string;
    createdAt: string;
  }>;
};

export type CoachAiCopilotPanelView = {
  honesty: readonly string[];
  pending: CoachAiSuggestionView[];
  decided: CoachAiSuggestionView[];
};

function toView(row: {
  id: string;
  kind: string;
  title: string;
  suggestedChange: string;
  why: string;
  supportingDataJson: string;
  confidence: string;
  status: string;
  authorship: string;
  engineVersion: string;
  editedChange: string | null;
  decisionNote: string | null;
  decidedAt: Date | null;
  createdAt: Date;
  events?: Array<{ id: string; eventType: string; createdAt: Date }>;
}): CoachAiSuggestionView {
  const kind = row.kind as CoachAiSuggestionKind;
  return {
    id: row.id,
    kind: row.kind,
    kindLabel: COACH_AI_SUGGESTION_KIND_LABELS[kind] ?? row.kind,
    title: row.title,
    suggestedChange: row.suggestedChange,
    why: row.why,
    supportingData: parseSupportingData(row.supportingDataJson),
    confidence: row.confidence,
    status: row.status,
    authorship: row.authorship,
    engineVersion: row.engineVersion,
    editedChange: row.editedChange,
    decisionNote: row.decisionNote,
    decidedAt: row.decidedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    events: (row.events ?? []).map((e) => ({
      id: e.id,
      eventType: e.eventType,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

async function gatherAthleteSignals(input: {
  athleteProfileId: string;
  coachScopes: readonly string[];
}): Promise<
  { ok: true; signals: CoachAiAthleteSignals } | { ok: false; error: string }
> {
  const now = new Date();
  const d7 = daysAgo(7, now);
  const d14 = daysAgo(14, now);
  const d21 = daysAgo(21, now);

  const canRecovery = input.coachScopes.includes("recovery");

  const [
    profile,
    sessionsLast7d,
    sessionsPrev7d,
    techniqueRecent,
    techniqueEarlier,
    recoveryCount,
    technique14d,
    activeProgram,
    openGoals,
    nextCompetition,
  ] = await Promise.all([
    prisma.athleteProfile.findUnique({
      where: { id: input.athleteProfileId },
      select: { displayName: true },
    }),
    prisma.trainingSession.count({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "completed",
        completedAt: { gte: d7 },
      },
    }),
    prisma.trainingSession.count({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "completed",
        completedAt: { gte: d14, lt: d7 },
      },
    }),
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        deletedAt: null,
        overallScore: { not: null },
        createdAt: { gte: d14 },
      },
      select: { overallScore: true },
      take: 20,
    }),
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        deletedAt: null,
        overallScore: { not: null },
        createdAt: { gte: d21, lt: d14 },
      },
      select: { overallScore: true },
      take: 20,
    }),
    canRecovery
      ? prisma.recoveryEntry.count({
          where: {
            athleteProfileId: input.athleteProfileId,
            recordedAt: { gte: d7 },
          },
        })
      : Promise.resolve(0),
    prisma.techniqueAnalysis.count({
      where: {
        athleteProfileId: input.athleteProfileId,
        deletedAt: null,
        createdAt: { gte: d14 },
      },
    }),
    prisma.program.findFirst({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "active",
        kind: "athlete",
      },
      select: { id: true },
    }),
    prisma.goal.count({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "active",
      },
    }),
    prisma.competitionPrep.findFirst({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: { in: ["active", "planned"] },
        competitionDate: { gte: now },
      },
      orderBy: { competitionDate: "asc" },
      select: { competitionDate: true, name: true, sport: true },
    }),
  ]);

  if (!profile) {
    return { ok: false, error: "Athlete profile not found." };
  }

  const recentScores = techniqueRecent
    .map((t) => t.overallScore)
    .filter((v): v is number => v != null);
  const earlierScores = techniqueEarlier
    .map((t) => t.overallScore)
    .filter((v): v is number => v != null);
  const recentMean = mean(recentScores);
  const earlierMean = mean(earlierScores);
  let techniqueDelta: number | null = null;
  if (recentMean != null && earlierMean != null) {
    techniqueDelta = recentMean - earlierMean;
  }

  const recentSessions = await prisma.trainingSession.findMany({
    where: {
      athleteProfileId: input.athleteProfileId,
      status: "completed",
      completedAt: { gte: d7 },
      perceivedEffort: { not: null },
    },
    select: { perceivedEffort: true },
    take: 20,
  });
  const rpes = recentSessions
    .map((s) => s.perceivedEffort)
    .filter((v): v is number => v != null);

  let daysUntilCompetition: number | null = null;
  let competitionLabel: string | null = null;
  if (nextCompetition) {
    daysUntilCompetition = Math.max(
      0,
      Math.floor(
        (nextCompetition.competitionDate.getTime() - now.getTime()) /
          (24 * 60 * 60 * 1000),
      ),
    );
    competitionLabel =
      nextCompetition.name?.trim() ||
      `${nextCompetition.sport.replaceAll("_", " ")} meet`;
  }

  return {
    ok: true,
    signals: {
      athleteLabel: profile.displayName?.trim() || "Athlete",
      sessionsLast7d,
      sessionsPrev7d,
      techniqueDelta,
      techniqueSampleCount: recentScores.length + earlierScores.length,
      meanRpeRecent: mean(rpes),
      // Without recovery scope, do not flag missing recovery (would leak absence).
      hasRecoveryEntries7d: canRecovery ? recoveryCount > 0 : true,
      hasTechniqueAnalyses14d: technique14d > 0,
      hasActiveProgram: Boolean(activeProgram),
      openGoalsCount: openGoals,
      daysUntilCompetition,
      competitionLabel,
    },
  };
}

function modificationKindForAi(
  kind: string,
): "training_review" | "program_change" | "technique_focus" | "general" {
  if (kind === "program_adjustment_draft") return "program_change";
  if (kind === "performance_change") return "technique_focus";
  if (kind === "week_summary") return "training_review";
  return "general";
}

/**
 * List pending + recent decided suggestions for the coach workspace.
 */
export async function getCoachAiCopilotPanel(input: {
  coachUserId: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; view: CoachAiCopilotPanelView }
  | { ok: false; error: string }
> {
  if (!featureFlags.coachAiCopilot) {
    return { ok: false, error: "Coach AI Copilot is not enabled." };
  }

  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const rows = await prisma.coachAiSuggestion.findMany({
    where: {
      coachUserId: input.coachUserId,
      athleteProfileId: input.athleteProfileId,
    },
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      events: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { id: true, eventType: true, createdAt: true },
      },
    },
  });

  const pending = rows.filter((r) => r.status === "pending").map(toView);
  const decided = rows
    .filter((r) => r.status !== "pending" && r.status !== "superseded")
    .map(toView);

  return {
    ok: true,
    view: {
      honesty: COACH_AI_COPILOT_HONESTY,
      pending,
      decided,
    },
  };
}

/**
 * Generate new pending AI drafts. Supersedes prior pending for same coach+athlete.
 */
export async function generateCoachAiSuggestions(input: {
  coachUserId: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; createdCount: number }
  | { ok: false; error: string }
> {
  if (!featureFlags.coachAiCopilot) {
    return { ok: false, error: "Coach AI Copilot is not enabled." };
  }

  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const gathered = await gatherAthleteSignals({
    athleteProfileId: input.athleteProfileId,
    coachScopes: access.scopes,
  });
  if (!gathered.ok) return gathered;

  const drafts = draftCoachAiSuggestions(gathered.signals);
  if (drafts.length === 0) {
    return { ok: true, createdCount: 0 };
  }

  const createdCount = await prisma.$transaction(async (tx) => {
    const pending = await tx.coachAiSuggestion.findMany({
      where: {
        coachUserId: input.coachUserId,
        athleteProfileId: input.athleteProfileId,
        status: "pending",
      },
      select: { id: true },
    });

    for (const p of pending) {
      await tx.coachAiSuggestion.update({
        where: { id: p.id },
        data: { status: "superseded" },
      });
      await tx.coachAiSuggestionEvent.create({
        data: {
          suggestionId: p.id,
          eventType: "superseded",
          actorUserId: input.coachUserId,
          detailJson: JSON.stringify({ reason: "regenerated" }),
        },
      });
    }

    let count = 0;
    for (const draft of drafts) {
      const row = await tx.coachAiSuggestion.create({
        data: {
          coachUserId: input.coachUserId,
          athleteProfileId: input.athleteProfileId,
          authorship: SUGGESTION_AUTHORSHIP.ai_engine,
          kind: draft.kind,
          title: draft.title,
          suggestedChange: draft.suggestedChange,
          why: draft.why,
          supportingDataJson: JSON.stringify(draft.supportingData),
          confidence: draft.confidence,
          status: "pending",
          engineVersion: draft.engineVersion || COACH_AI_ENGINE_VERSION,
          proposedChangeJson: JSON.stringify(draft.proposedChangeJson),
        },
      });
      await tx.coachAiSuggestionEvent.create({
        data: {
          suggestionId: row.id,
          eventType: "proposed",
          actorUserId: input.coachUserId,
          detailJson: JSON.stringify({
            kind: draft.kind,
            confidence: draft.confidence,
            autoApply: false,
          }),
        },
      });
      count += 1;
    }
    return count;
  });

  return { ok: true, createdCount };
}

/**
 * Coach decision — Accept / Edit / Reject. Never auto-applies program changes.
 * Accept/Edit may create a human_coach CoachModification (coach-owned).
 */
export async function decideCoachAiSuggestion(input: {
  coachUserId: string;
  suggestionId: string;
  decision: CoachAiDecision | string;
  editedChange?: string;
  decisionNote?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!featureFlags.coachAiCopilot) {
    return { ok: false, error: "Coach AI Copilot is not enabled." };
  }
  if (!isCoachAiDecision(input.decision)) {
    return { ok: false, error: "Decision must be accept, edit, or reject." };
  }

  const row = await prisma.coachAiSuggestion.findUnique({
    where: { id: input.suggestionId },
  });
  if (!row || row.coachUserId !== input.coachUserId) {
    return { ok: false, error: "Suggestion not found." };
  }
  if (row.status !== "pending") {
    return { ok: false, error: `Suggestion is already ${row.status}.` };
  }

  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: row.athleteProfileId,
  });
  if (!access.ok) return access;

  let editedChange: string | null = null;
  if (input.decision === "edit") {
    const text = (input.editedChange ?? "").trim();
    if (text.length < 2) {
      return {
        ok: false,
        error: "Edited change text is required when editing.",
      };
    }
    editedChange = text;
  }

  const status = statusAfterDecision(input.decision);
  const eventType = decisionEventType(input.decision);
  const decisionNote = input.decisionNote?.trim() || null;

  await prisma.$transaction(async (tx) => {
    await tx.coachAiSuggestion.update({
      where: { id: row.id },
      data: {
        status,
        editedChange,
        decisionNote,
        decidedAt: new Date(),
        decidedByUserId: input.coachUserId,
      },
    });
    await tx.coachAiSuggestionEvent.create({
      data: {
        suggestionId: row.id,
        eventType,
        actorUserId: input.coachUserId,
        detailJson: JSON.stringify({
          decision: input.decision,
          note: decisionNote,
          editedChange,
          autoApply: false,
        }),
      },
    });
  });

  if (input.decision === "accept" || input.decision === "edit") {
    const changeText =
      input.decision === "edit" && editedChange
        ? editedChange
        : row.suggestedChange;
    await createCoachModification({
      coachUserId: input.coachUserId,
      athleteProfileId: row.athleteProfileId,
      kind: modificationKindForAi(row.kind),
      title: `[Coach decision] ${row.title}`,
      body: [
        changeText,
        "",
        `Why (from AI draft): ${row.why}`,
        decisionNote ? `Coach note: ${decisionNote}` : null,
        `Origin: AI Copilot suggestion ${row.id} (${input.decision}).`,
      ]
        .filter(Boolean)
        .join("\n"),
      proposedChangeJson: row.proposedChangeJson,
      relatedType: "CoachAiSuggestion",
      relatedId: row.id,
    });
  }

  await recordCoachAiDecisionFeedback({
    coachUserId: input.coachUserId,
    athleteProfileId: row.athleteProfileId,
    suggestionId: row.id,
    decision: input.decision,
  });

  return { ok: true };
}
