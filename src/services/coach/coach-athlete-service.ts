import {
  COACH_ATHLETE_DETAIL_HONESTY,
  COACH_SCOPE_LABELS,
  SUGGESTION_AUTHORSHIP,
  SUGGESTION_AUTHORSHIP_LABELS,
  canViewWorkspaceSection,
  isCoachModificationKind,
  isCoachWorkspaceSection,
  type CoachModificationKind,
  type CoachScope,
  type CoachWorkspaceSection,
  type SuggestionAuthorship,
} from "@/domain/coach";
import {
  COACHING_NOTES_SOURCE,
  COACHING_NOTES_SOURCE_LABELS,
} from "@/domain/coaching-notes-intelligence";
import { featureFlags } from "@/config/feature-flags";
import { prisma } from "@/lib/db";
import { assertCoachCanAccessAthlete } from "@/services/coach/coach-service";
import type { Prisma } from "@prisma/client";

function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

const BODY_COMP_METRIC_KEYS = new Set([
  "bodyfat",
  "body_fat",
  "bodyfat_pct",
  "girth_waist",
  "girth_chest",
  "girth_hip",
  "girth_arm",
  "girth_thigh",
]);

export type CoachAthleteWorkspaceView = {
  athleteProfileId: string;
  displayName: string;
  discipline: string | null;
  units: string;
  scopes: CoachScope[];
  scopeLabels: string[];
  honesty: readonly string[];
  sectionAccess: Record<CoachWorkspaceSection, boolean>;
  overview: {
    recentSessions7d: number;
    activeProgramName: string | null;
    techniqueTrendLabel: string | null;
    openCoachSuggestions: number;
    openAiSuggestions: number;
  };
  training: {
    locked: boolean;
    sessions: Array<{
      id: string;
      title: string;
      status: string;
      completedAt: string | null;
      perceivedEffort: number | null;
    }>;
  };
  technique: {
    locked: boolean;
    mediaAllowed: boolean;
    items: Array<{
      id: string;
      status: string;
      overallScore: number | null;
      createdAt: string;
      href: string | null;
    }>;
  };
  progress: {
    locked: boolean;
    metrics: Array<{
      id: string;
      metricKey: string;
      value: number;
      unit: string | null;
      recordedAt: string;
      source: string;
    }>;
  };
  recovery: {
    locked: boolean;
    entries: Array<{
      id: string;
      recordedAt: string;
      readiness: number | null;
      soreness: number | null;
      stress: number | null;
      fatigue: number | null;
      sleepHours: number | null;
      notes: string | null;
    }>;
  };
  notes: Array<{
    id: string;
    section: string;
    body: string;
    createdAt: string;
    relatedType: string | null;
    relatedId: string | null;
    isPrivate: boolean;
    source: "coach_note";
    sourceLabel: string;
  }>;
  noteSummaries: Array<{
    id: string;
    body: string;
    createdAt: string;
    source: "ai_summary";
    sourceLabel: string;
    sourceNoteIds: string[];
    excludedPrivateCount: number;
  }>;
  recommendations: {
    humanCoach: Array<{
      id: string;
      authorship: SuggestionAuthorship;
      authorshipLabel: string;
      kind: string;
      title: string;
      body: string;
      status: string;
      createdAt: string;
      eventCount: number;
    }>;
    aiEngine: Array<{
      id: string;
      authorship: SuggestionAuthorship;
      authorshipLabel: string;
      title: string;
      body: string;
      status: string;
      confidence: string;
      source: string;
      createdAt: string;
    }>;
    system: Array<{
      id: string;
      authorship: SuggestionAuthorship;
      authorshipLabel: string;
      title: string;
      body: string;
      status: string;
      category: string;
      createdAt: string;
    }>;
  };
};

/**
 * Full coach athlete workspace — scoped reads; never exposes sex/birthYear/movementNotes.
 */
export async function getCoachAthleteWorkspace(input: {
  coachUserId: string;
  athleteProfileId: string;
}): Promise<
  | { ok: true; view: CoachAthleteWorkspaceView }
  | { ok: false; error: string }
> {
  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const scopes = access.scopes;
  const sectionAccess: Record<CoachWorkspaceSection, boolean> = {
    overview: canViewWorkspaceSection(scopes, "overview"),
    training: canViewWorkspaceSection(scopes, "training"),
    technique: canViewWorkspaceSection(scopes, "technique"),
    progress: canViewWorkspaceSection(scopes, "progress"),
    recovery: canViewWorkspaceSection(scopes, "recovery"),
    notes: canViewWorkspaceSection(scopes, "notes"),
    recommendations: canViewWorkspaceSection(scopes, "recommendations"),
  };

  const mediaAllowed = scopes.includes("technique_media");
  const bodyDetailed = scopes.includes("body_metrics_detailed");
  const weekAgo = daysAgo(7);

  const select: Prisma.AthleteProfileSelect = {
    id: true,
    displayName: true,
    primaryDiscipline: true,
    units: true,
    programs: {
      where: { status: "active", kind: "athlete" },
      take: 1,
      select: { name: true },
    },
    coachNotes: {
      where: { status: "active" },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: {
        id: true,
        section: true,
        body: true,
        createdAt: true,
        relatedType: true,
        relatedId: true,
        isPrivate: true,
      },
    },
  };

  if (sectionAccess.training) {
    select.trainingSessions = {
      orderBy: { completedAt: "desc" },
      take: 20,
      select: {
        id: true,
        status: true,
        completedAt: true,
        perceivedEffort: true,
        workoutNameSnapshot: true,
        workout: { select: { name: true } },
      },
    };
  }
  if (sectionAccess.technique) {
    select.techniqueAnalyses = {
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 12,
      select: {
        id: true,
        status: true,
        overallScore: true,
        createdAt: true,
      },
    };
  }
  if (sectionAccess.progress) {
    select.progressMetrics = {
      orderBy: { recordedAt: "desc" },
      take: 30,
      select: {
        id: true,
        metricKey: true,
        value: true,
        unit: true,
        recordedAt: true,
        source: true,
      },
    };
  }
  if (sectionAccess.recovery) {
    select.recoveryEntries = {
      orderBy: { recordedAt: "desc" },
      take: 14,
      select: {
        id: true,
        recordedAt: true,
        readiness: true,
        soreness: true,
        stress: true,
        fatigue: true,
        sleepHours: true,
        notes: true,
      },
    };
  }
  if (sectionAccess.recommendations) {
    select.coachModifications = {
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        kind: true,
        title: true,
        body: true,
        status: true,
        authorship: true,
        createdAt: true,
        _count: { select: { events: true } },
      },
    };
    select.programAdaptations = {
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        recommendedChange: true,
        reason: true,
        status: true,
        confidence: true,
        source: true,
        createdAt: true,
      },
    };
    select.recommendations = {
      where: { status: { in: ["pending", "accepted"] } },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      take: 12,
      select: {
        id: true,
        category: true,
        title: true,
        body: true,
        status: true,
        createdAt: true,
      },
    };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { id: input.athleteProfileId },
    select,
  });

  if (!profile) {
    return { ok: false, error: "Athlete profile not found." };
  }

  const noteSummaryRows =
    sectionAccess.notes && featureFlags.coachingNotesIntelligence
      ? await prisma.coachNoteSummary.findMany({
          where: { athleteProfileId: input.athleteProfileId },
          orderBy: { createdAt: "desc" },
          take: 8,
        })
      : [];

  type SessionRow = {
    id: string;
    status: string;
    completedAt: Date | null;
    perceivedEffort: number | null;
    workoutNameSnapshot: string | null;
    workout: { name: string } | null;
  };
  type TechniqueRow = {
    id: string;
    status: string;
    overallScore: number | null;
    createdAt: Date;
  };
  type ProgressRow = {
    id: string;
    metricKey: string;
    value: number;
    unit: string | null;
    recordedAt: Date;
    source: string;
  };
  type RecoveryRow = {
    id: string;
    recordedAt: Date;
    readiness: number | null;
    soreness: number | null;
    stress: number | null;
    fatigue: number | null;
    sleepHours: number | null;
    notes: string | null;
  };
  type ModRow = {
    id: string;
    kind: string;
    title: string;
    body: string;
    status: string;
    authorship: string;
    createdAt: Date;
    _count: { events: number };
  };
  type AdaptationRow = {
    id: string;
    recommendedChange: string;
    reason: string;
    status: string;
    confidence: string;
    source: string;
    createdAt: Date;
  };
  type RecRow = {
    id: string;
    category: string;
    title: string;
    body: string;
    status: string;
    createdAt: Date;
  };

  const loaded = profile as unknown as {
    id: string;
    displayName: string | null;
    primaryDiscipline: string | null;
    units: string;
    programs: Array<{ name: string }>;
    coachNotes: Array<{
      id: string;
      section: string;
      body: string;
      createdAt: Date;
      relatedType: string | null;
      relatedId: string | null;
      isPrivate: boolean;
    }>;
    trainingSessions?: SessionRow[];
    techniqueAnalyses?: TechniqueRow[];
    progressMetrics?: ProgressRow[];
    recoveryEntries?: RecoveryRow[];
    coachModifications?: ModRow[];
    programAdaptations?: AdaptationRow[];
    recommendations?: RecRow[];
  };

  const sessions = loaded.trainingSessions ?? [];
  const techniques = loaded.techniqueAnalyses ?? [];
  const progressRows = (loaded.progressMetrics ?? []).filter((m) => {
    if (bodyDetailed) return true;
    return !BODY_COMP_METRIC_KEYS.has(m.metricKey.toLowerCase());
  });
  const recoveryRows = loaded.recoveryEntries ?? [];
  const coachMods = loaded.coachModifications ?? [];
  const adaptations = loaded.programAdaptations ?? [];
  const systemRecs = loaded.recommendations ?? [];

  const sessions7d = sessions.filter(
    (s) =>
      s.completedAt && s.completedAt >= weekAgo && s.status === "completed",
  ).length;

  let techniqueTrendLabel: string | null = null;
  if (sectionAccess.technique) {
    const scored = techniques.filter((t) => t.overallScore != null);
    if (scored.length >= 2) {
      const delta = Math.round(
        (scored[0]!.overallScore ?? 0) - (scored[1]!.overallScore ?? 0),
      );
      techniqueTrendLabel =
        delta === 0
          ? `Technique score steady at ${scored[0]!.overallScore}`
          : delta > 0
            ? `Technique score +${delta} vs prior`
            : `Technique score ${delta} vs prior`;
    } else if (scored.length === 1) {
      techniqueTrendLabel = `Latest technique score ${scored[0]!.overallScore}`;
    }
  }

  const view: CoachAthleteWorkspaceView = {
    athleteProfileId: loaded.id,
    displayName:
      loaded.displayName?.trim() || `Athlete ${loaded.id.slice(-6)}`,
    discipline: loaded.primaryDiscipline,
    units: loaded.units,
    scopes,
    scopeLabels: scopes.map((s) => COACH_SCOPE_LABELS[s]),
    honesty: COACH_ATHLETE_DETAIL_HONESTY,
    sectionAccess,
    overview: {
      recentSessions7d: sectionAccess.training ? sessions7d : 0,
      activeProgramName: loaded.programs[0]?.name ?? null,
      techniqueTrendLabel,
      openCoachSuggestions: coachMods.filter((m) => m.status === "open").length,
      openAiSuggestions: adaptations.filter((a) => a.status === "pending")
        .length,
    },
    training: {
      locked: !sectionAccess.training,
      sessions: sectionAccess.training
        ? sessions.map((s) => ({
            id: s.id,
            title:
              s.workoutNameSnapshot ?? s.workout?.name ?? "Training session",
            status: s.status,
            completedAt: s.completedAt?.toISOString() ?? null,
            perceivedEffort: s.perceivedEffort,
          }))
        : [],
    },
    technique: {
      locked: !sectionAccess.technique,
      mediaAllowed,
      items: sectionAccess.technique
        ? techniques.map((t) => ({
            id: t.id,
            status: t.status,
            overallScore: t.overallScore,
            createdAt: t.createdAt.toISOString(),
            href: mediaAllowed ? `/app/technique/${t.id}` : null,
          }))
        : [],
    },
    progress: {
      locked: !sectionAccess.progress,
      metrics: sectionAccess.progress
        ? progressRows.map((m) => ({
            id: m.id,
            metricKey: m.metricKey,
            value: m.value,
            unit: m.unit,
            recordedAt: m.recordedAt.toISOString(),
            source: m.source,
          }))
        : [],
    },
    recovery: {
      locked: !sectionAccess.recovery,
      entries: sectionAccess.recovery
        ? recoveryRows.map((e) => ({
            id: e.id,
            recordedAt: e.recordedAt.toISOString(),
            readiness: e.readiness,
            soreness: e.soreness,
            stress: e.stress,
            fatigue: e.fatigue,
            sleepHours: e.sleepHours,
            notes: e.notes,
          }))
        : [],
    },
    notes: loaded.coachNotes.map((n) => ({
      id: n.id,
      section: n.section,
      body: n.body,
      createdAt: n.createdAt.toISOString(),
      relatedType: n.relatedType,
      relatedId: n.relatedId,
      isPrivate: n.isPrivate,
      source: COACHING_NOTES_SOURCE.coach_note,
      sourceLabel: COACHING_NOTES_SOURCE_LABELS.coach_note,
    })),
    noteSummaries: noteSummaryRows.map((s) => ({
      id: s.id,
      body: s.summaryBody,
      createdAt: s.createdAt.toISOString(),
      source: COACHING_NOTES_SOURCE.ai_summary,
      sourceLabel: COACHING_NOTES_SOURCE_LABELS.ai_summary,
      sourceNoteIds: (() => {
        try {
          const parsed = JSON.parse(s.sourceNoteIdsJson) as unknown;
          return Array.isArray(parsed)
            ? parsed.filter((x): x is string => typeof x === "string")
            : [];
        } catch {
          return [];
        }
      })(),
      excludedPrivateCount: s.excludedPrivateCount,
    })),
    recommendations: {
      humanCoach: coachMods.map((m) => ({
        id: m.id,
        authorship: SUGGESTION_AUTHORSHIP.human_coach,
        authorshipLabel: SUGGESTION_AUTHORSHIP_LABELS.human_coach,
        kind: m.kind,
        title: m.title,
        body: m.body,
        status: m.status,
        createdAt: m.createdAt.toISOString(),
        eventCount: m._count.events,
      })),
      aiEngine: adaptations.map((a) => ({
        id: a.id,
        authorship: SUGGESTION_AUTHORSHIP.ai_engine,
        authorshipLabel: SUGGESTION_AUTHORSHIP_LABELS.ai_engine,
        title: a.recommendedChange,
        body: a.reason,
        status: a.status,
        confidence: a.confidence,
        source: a.source,
        createdAt: a.createdAt.toISOString(),
      })),
      system: systemRecs.map((r) => ({
        id: r.id,
        authorship: SUGGESTION_AUTHORSHIP.system,
        authorshipLabel: SUGGESTION_AUTHORSHIP_LABELS.system,
        title: r.title,
        body: r.body,
        status: r.status,
        category: r.category,
        createdAt: r.createdAt.toISOString(),
      })),
    },
  };

  return { ok: true, view };
}

export async function createCoachNote(input: {
  coachUserId: string;
  athleteProfileId: string;
  section?: string;
  body: string;
  relatedType?: string;
  relatedId?: string;
  isPrivate?: boolean;
  allowAiSummarize?: boolean;
}): Promise<{ ok: true; noteId: string } | { ok: false; error: string }> {
  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const body = input.body.trim();
  if (body.length < 2) {
    return { ok: false, error: "Note must be at least 2 characters." };
  }
  if (body.length > 4000) {
    return { ok: false, error: "Note is too long." };
  }

  const sectionRaw = (input.section ?? "notes").trim();
  const section = isCoachWorkspaceSection(sectionRaw) ? sectionRaw : "notes";
  const isPrivate = Boolean(input.isPrivate);
  // Private notes are never AI-summarized regardless of allowAiSummarize.
  const allowAiSummarize = isPrivate
    ? false
    : input.allowAiSummarize !== false;

  const note = await prisma.coachNote.create({
    data: {
      coachUserId: input.coachUserId,
      athleteProfileId: input.athleteProfileId,
      section,
      body,
      isPrivate,
      allowAiSummarize,
      relatedType: input.relatedType?.trim() || null,
      relatedId: input.relatedId?.trim() || null,
    },
  });
  return { ok: true, noteId: note.id };
}

export async function createCoachModification(input: {
  coachUserId: string;
  athleteProfileId: string;
  kind?: string;
  title: string;
  body: string;
  proposedChangeJson?: string;
  relatedType?: string;
  relatedId?: string;
}): Promise<
  { ok: true; modificationId: string } | { ok: false; error: string }
> {
  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: input.athleteProfileId,
  });
  if (!access.ok) return access;

  const title = input.title.trim();
  const body = input.body.trim();
  if (title.length < 2) {
    return { ok: false, error: "Title must be at least 2 characters." };
  }
  if (body.length < 2) {
    return { ok: false, error: "Suggestion body must be at least 2 characters." };
  }

  const kind: CoachModificationKind = isCoachModificationKind(
    input.kind ?? "general",
  )
    ? (input.kind as CoachModificationKind)
    : "general";

  let proposedChangeJson = "{}";
  if (input.proposedChangeJson?.trim()) {
    try {
      JSON.parse(input.proposedChangeJson);
      proposedChangeJson = input.proposedChangeJson.trim();
    } catch {
      return { ok: false, error: "Proposed change must be valid JSON." };
    }
  }

  const modification = await prisma.$transaction(async (tx) => {
    const row = await tx.coachModification.create({
      data: {
        coachUserId: input.coachUserId,
        athleteProfileId: input.athleteProfileId,
        kind,
        title,
        body,
        proposedChangeJson,
        authorship: SUGGESTION_AUTHORSHIP.human_coach,
        relatedType: input.relatedType?.trim() || null,
        relatedId: input.relatedId?.trim() || null,
      },
    });
    await tx.coachModificationEvent.create({
      data: {
        modificationId: row.id,
        eventType: "created",
        actorUserId: input.coachUserId,
        detailJson: JSON.stringify({
          kind,
          title,
          authorship: SUGGESTION_AUTHORSHIP.human_coach,
        }),
      },
    });
    return row;
  });

  return { ok: true, modificationId: modification.id };
}

export async function withdrawCoachModification(input: {
  coachUserId: string;
  modificationId: string;
  reason?: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const mod = await prisma.coachModification.findUnique({
    where: { id: input.modificationId },
  });
  if (!mod || mod.coachUserId !== input.coachUserId) {
    return { ok: false, error: "Modification not found." };
  }
  if (mod.status === "withdrawn") return { ok: true };

  const access = await assertCoachCanAccessAthlete({
    coachUserId: input.coachUserId,
    athleteProfileId: mod.athleteProfileId,
  });
  if (!access.ok) return access;

  await prisma.$transaction(async (tx) => {
    await tx.coachModification.update({
      where: { id: mod.id },
      data: {
        status: "withdrawn",
        withdrawnAt: new Date(),
      },
    });
    await tx.coachModificationEvent.create({
      data: {
        modificationId: mod.id,
        eventType: "withdrawn",
        actorUserId: input.coachUserId,
        detailJson: JSON.stringify({
          reason: input.reason?.trim() || "Withdrawn by coach",
        }),
      },
    });
  });

  return { ok: true };
}
