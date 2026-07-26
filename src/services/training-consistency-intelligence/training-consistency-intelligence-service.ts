/**
 * Training Consistency Intelligence service (Prompt 123).
 */

import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  TCI_DEFAULT_WINDOW_DAYS,
  TCI_INJURY_BREAK_MIN_SKIPPED_DAYS,
  analyzeTrainingConsistency,
  buildDeloadContexts,
  buildInjuryBreakContexts,
  buildPlanDaysFromTemplate,
  buildProgramChangeContexts,
  type ProgramTemplateDay,
  type TrainingConsistencyAnalysis,
} from "@/domain/training-consistency-intelligence";

const INJURY_RE =
  /\b(injur(?:y|ed)|pain|flare|rehab|medical|doctor|physio|break from training|training pause)\b/i;

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function sessionDayKey(s: {
  completedAt: Date | null;
  scheduledAt: Date | null;
  startedAt: Date | null;
  updatedAt: Date;
}): string {
  const anchor = s.completedAt ?? s.scheduledAt ?? s.startedAt ?? s.updatedAt;
  return dayKey(anchor);
}

function inferInjuryBreaks(input: {
  adaptations: Array<{
    changeKind: string;
    status: string;
    reason: string;
    decidedAt: Date | null;
    appliedAt: Date | null;
    createdAt: Date;
  }>;
  coachNotes: Array<{ body: string; createdAt: Date }>;
  skippedWithInjuryNotes: Array<{ dayKey: string; note: string }>;
}): Array<{ startAt: string; endAt: string; label?: string }> {
  const breaks: Array<{ startAt: string; endAt: string; label?: string }> = [];

  for (const a of input.adaptations) {
    if (!INJURY_RE.test(a.reason)) continue;
    if (
      a.status !== "accepted" &&
      a.status !== "modified" &&
      a.appliedAt == null
    ) {
      continue;
    }
    const anchor = a.appliedAt ?? a.decidedAt ?? a.createdAt;
    const start = new Date(anchor);
    const end = new Date(anchor);
    end.setUTCDate(end.getUTCDate() + 6);
    breaks.push({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      label: "Injury-related adaptation pause",
    });
  }

  for (const n of input.coachNotes) {
    if (!INJURY_RE.test(n.body)) continue;
    const start = new Date(n.createdAt);
    const end = new Date(n.createdAt);
    end.setUTCDate(end.getUTCDate() + 6);
    breaks.push({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      label: "Coach note — training break context",
    });
  }

  const injurySkipKeys = input.skippedWithInjuryNotes
    .filter((s) => INJURY_RE.test(s.note))
    .map((s) => s.dayKey);
  const sorted = [...new Set(injurySkipKeys)].sort();
  if (sorted.length >= TCI_INJURY_BREAK_MIN_SKIPPED_DAYS) {
    breaks.push({
      startAt: `${sorted[0]}T00:00:00.000Z`,
      endAt: `${sorted[sorted.length - 1]}T00:00:00.000Z`,
      label: "Injury-noted skip window",
    });
  } else if (sorted.length > 0) {
    for (const key of sorted) {
      breaks.push({
        startAt: `${key}T00:00:00.000Z`,
        endAt: `${key}T00:00:00.000Z`,
        label: "Injury-noted skip",
      });
    }
  }

  return breaks;
}

function deloadWeekContexts(input: {
  programCreatedAt: Date;
  weeks: Array<{ weekNumber: number; name: string | null; notes: string | null }>;
}): ReturnType<typeof buildDeloadContexts> {
  const out: ReturnType<typeof buildDeloadContexts> = [];
  for (const w of input.weeks) {
    const label = `${w.name ?? ""} ${w.notes ?? ""}`.toLowerCase();
    if (!label.includes("deload")) continue;
    const start = new Date(input.programCreatedAt);
    start.setUTCDate(start.getUTCDate() + (w.weekNumber - 1) * 7);
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + 6);
    out.push({
      kind: "deload",
      startDayKey: dayKey(start),
      endDayKey: dayKey(end),
      label: `Program week ${w.weekNumber} deload`,
    });
  }
  return out;
}

export async function getTrainingConsistencyAnalysis(input: {
  athleteProfileId: string;
  windowDays?: number;
}): Promise<
  | { ok: true; analysis: TrainingConsistencyAnalysis }
  | { ok: false; error: string }
> {
  if (!featureFlags.trainingConsistencyIntelligence) {
    return {
      ok: false,
      error: "Training Consistency Intelligence is not enabled.",
    };
  }

  const days = input.windowDays ?? TCI_DEFAULT_WINDOW_DAYS;
  const now = new Date();
  const windowEnd = now;
  const windowStart = new Date(now);
  windowStart.setUTCDate(windowStart.getUTCDate() - days);
  const openDayKey = dayKey(now);
  const windowStartKey = dayKey(windowStart);
  const windowEndKey = dayKey(windowEnd);

  const program = await prisma.program.findFirst({
    where: { athleteProfileId: input.athleteProfileId, status: "active" },
    orderBy: { updatedAt: "desc" },
    include: {
      weeks: {
        orderBy: { weekNumber: "asc" },
        include: {
          days: { orderBy: { dayIndex: "asc" } },
        },
      },
      versions: {
        orderBy: { createdAt: "desc" },
        take: 8,
        select: { createdAt: true, versionNumber: true },
      },
    },
  });

  const [sessions, adaptations, coachNotes] = await Promise.all([
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        OR: [
          { completedAt: { gte: windowStart, lte: windowEnd } },
          { scheduledAt: { gte: windowStart, lte: windowEnd } },
          { startedAt: { gte: windowStart, lte: windowEnd } },
        ],
      },
      select: {
        status: true,
        completedAt: true,
        scheduledAt: true,
        startedAt: true,
        updatedAt: true,
        programId: true,
        notes: true,
      },
    }),
    prisma.programAdaptation.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        createdAt: {
          gte: new Date(windowStart.getTime() - 14 * 24 * 60 * 60 * 1000),
          lte: windowEnd,
        },
      },
      select: {
        changeKind: true,
        status: true,
        reason: true,
        decidedAt: true,
        appliedAt: true,
        createdAt: true,
      },
    }),
    prisma.coachNote.findMany({
      where: {
        athleteProfileId: input.athleteProfileId,
        status: "active",
        isPrivate: false,
        createdAt: { gte: windowStart, lte: windowEnd },
        OR: [
          { section: "recovery" },
          { body: { contains: "injur" } },
          { body: { contains: "pain" } },
        ],
      },
      select: { body: true, createdAt: true },
      take: 20,
    }),
  ]);

  // Template: prefer a non-deload week with the most training days; else first week.
  let templateDays: ProgramTemplateDay[] = [];
  if (program && program.weeks.length > 0) {
    const ranked = [...program.weeks].sort((a, b) => {
      const aDeload = /deload/i.test(`${a.name ?? ""} ${a.notes ?? ""}`);
      const bDeload = /deload/i.test(`${b.name ?? ""} ${b.notes ?? ""}`);
      if (aDeload !== bDeload) return aDeload ? 1 : -1;
      const aTrain = a.days.filter((d) => d.workoutId).length;
      const bTrain = b.days.filter((d) => d.workoutId).length;
      return bTrain - aTrain;
    });
    const chosen = ranked[0]!;
    templateDays = chosen.days.map((d) => ({
      dayIndex: d.dayIndex,
      workoutId: d.workoutId,
      name: d.name,
      weekLabel: chosen.name,
    }));
  }

  const planDays =
    templateDays.length > 0
      ? buildPlanDaysFromTemplate({
          windowStartKey,
          windowEndKey,
          templateDays,
        })
      : [];

  const skippedDayKeys = sessions
    .filter((s) => s.status === "skipped")
    .map((s) => sessionDayKey(s));

  const contexts = [
    ...buildDeloadContexts({
      adaptations: adaptations.map((a) => ({
        changeKind: a.changeKind,
        status: a.status,
        decidedAt: a.decidedAt?.toISOString() ?? null,
        appliedAt: a.appliedAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
      })),
    }),
    ...(program
      ? deloadWeekContexts({
          programCreatedAt: program.createdAt,
          weeks: program.weeks.map((w) => ({
            weekNumber: w.weekNumber,
            name: w.name,
            notes: w.notes,
          })),
        })
      : []),
    ...buildProgramChangeContexts({
      versions: (program?.versions ?? []).map((v) => ({
        createdAt: v.createdAt.toISOString(),
        versionNumber: v.versionNumber,
      })),
    }),
    ...buildInjuryBreakContexts({
      breaks: inferInjuryBreaks({
        adaptations,
        coachNotes,
        skippedWithInjuryNotes: sessions
          .filter((s) => s.status === "skipped" && s.notes)
          .map((s) => ({
            dayKey: sessionDayKey(s),
            note: s.notes ?? "",
          })),
      }),
    }),
  ];

  if (planDays.length === 0) {
    return {
      ok: true,
      analysis: analyzeTrainingConsistency({
        windowLabel: `${days} days`,
        openDayKey,
        planDays: [],
        sessions: [],
        contexts: [],
      }),
    };
  }

  const analysis = analyzeTrainingConsistency({
    windowLabel: `${days} days`,
    openDayKey,
    planDays,
    sessions: sessions.map((s) => ({
      dayKey: sessionDayKey(s),
      status: s.status as "planned" | "in_progress" | "completed" | "skipped",
      programLinked: s.programId != null,
    })),
    contexts,
  });

  if (!program) {
    analysis.narrativeLines.unshift(
      "No active program — plan adherence needs a program template with training and rest days.",
    );
  }

  return { ok: true, analysis };
}
