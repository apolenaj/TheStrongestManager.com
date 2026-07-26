/**
 * Multi-athlete coach dashboard — batch signals + prioritized attention (Prompt 86).
 */

import { featureFlags } from "@/config/feature-flags";
import {
  COACH_MULTI_ATHLETE_HONESTY,
  buildPrioritizedAttention,
  type AthleteAttentionSignals,
  type CoachAttentionItem,
} from "@/domain/coach-dashboard";
import { hasCoachScope, parseCoachScopes, type CoachScope } from "@/domain/coach";
import { detectPrEvents, type StrengthSample } from "@/domain/pr-intelligence";
import { prisma } from "@/lib/db";

function daysAgo(days: number, now = new Date()): Date {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

function daysBetween(later: Date, earlier: Date): number {
  return Math.floor(
    (later.getTime() - earlier.getTime()) / (24 * 60 * 60 * 1000),
  );
}

export type CoachAttentionQueueView = {
  honesty: readonly string[];
  items: Array<CoachAttentionItem & { urgencyLabel: string }>;
  totalCandidates: number;
  capped: boolean;
  enabled: boolean;
};

/**
 * Build prioritized attention queue across granted athletes.
 * Scope-aware; never invents athletes.
 */
export async function buildCoachAttentionQueue(input: {
  coachUserId: string;
  grants: Array<{
    athleteProfileId: string;
    displayName: string;
    scopes: CoachScope[];
  }>;
}): Promise<CoachAttentionQueueView> {
  if (!featureFlags.multiAthleteCoachDashboard) {
    return {
      honesty: COACH_MULTI_ATHLETE_HONESTY,
      items: [],
      totalCandidates: 0,
      capped: false,
      enabled: false,
    };
  }

  if (input.grants.length === 0) {
    return {
      honesty: COACH_MULTI_ATHLETE_HONESTY,
      items: [],
      totalCandidates: 0,
      capped: false,
      enabled: true,
    };
  }

  const now = new Date();
  const d7 = daysAgo(7, now);
  const d14 = daysAgo(14, now);
  const d28 = daysAgo(28, now);
  const d60 = daysAgo(60, now);
  const ids = input.grants.map((g) => g.athleteProfileId);
  const recoveryIds = input.grants
    .filter((g) => hasCoachScope(g.scopes, "recovery"))
    .map((g) => g.athleteProfileId);

  const [
    sessions,
    techniqueRows,
    competitions,
    recoveryEntries,
    recentSets,
  ] = await Promise.all([
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId: { in: ids },
        status: "completed",
        completedAt: { gte: d28 },
      },
      select: {
        id: true,
        athleteProfileId: true,
        completedAt: true,
        perceivedEffort: true,
      },
      orderBy: { completedAt: "desc" },
    }),
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId: { in: ids },
        deletedAt: null,
        overallScore: { not: null },
        createdAt: { gte: d28 },
      },
      select: {
        athleteProfileId: true,
        overallScore: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.competitionPrep.findMany({
      where: {
        athleteProfileId: { in: ids },
        status: { in: ["active", "planned"] },
        competitionDate: { gte: now, lte: daysAgo(-21, now) },
      },
      select: {
        athleteProfileId: true,
        name: true,
        competitionDate: true,
        sport: true,
      },
      orderBy: { competitionDate: "asc" },
    }),
    recoveryIds.length > 0
      ? prisma.recoveryEntry.findMany({
          where: {
            athleteProfileId: { in: recoveryIds },
            recordedAt: { gte: d28 },
          },
          select: {
            athleteProfileId: true,
            recordedAt: true,
          },
          orderBy: { recordedAt: "desc" },
        })
      : Promise.resolve([]),
    prisma.sessionSet.findMany({
      where: {
        completedAt: { gte: d60 },
        performedLoadKg: { not: null },
        performedReps: { not: null },
        setType: { in: ["work", "amrap"] },
        sessionExercise: {
          trainingSession: {
            athleteProfileId: { in: ids },
            status: "completed",
          },
        },
      },
      orderBy: { completedAt: "asc" },
      take: 800,
      select: {
        id: true,
        performedLoadKg: true,
        performedReps: true,
        completedAt: true,
        sessionExercise: {
          select: {
            exercise: { select: { slug: true, name: true } },
            trainingSession: { select: { athleteProfileId: true } },
          },
        },
      },
    }),
  ]);

  const sessionsByAthlete = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const list = sessionsByAthlete.get(s.athleteProfileId) ?? [];
    list.push(s);
    sessionsByAthlete.set(s.athleteProfileId, list);
  }

  const techniqueByAthlete = new Map<string, typeof techniqueRows>();
  for (const t of techniqueRows) {
    const list = techniqueByAthlete.get(t.athleteProfileId) ?? [];
    list.push(t);
    techniqueByAthlete.set(t.athleteProfileId, list);
  }

  const competitionByAthlete = new Map<string, (typeof competitions)[0]>();
  for (const c of competitions) {
    if (!competitionByAthlete.has(c.athleteProfileId)) {
      competitionByAthlete.set(c.athleteProfileId, c);
    }
  }

  const recoveryByAthlete = new Map<string, Date>();
  const hadCheckin = new Set<string>();
  for (const r of recoveryEntries) {
    hadCheckin.add(r.athleteProfileId);
    if (!recoveryByAthlete.has(r.athleteProfileId)) {
      recoveryByAthlete.set(r.athleteProfileId, r.recordedAt);
    }
  }

  const strengthByAthlete = new Map<string, StrengthSample[]>();
  for (const row of recentSets) {
    const athleteId =
      row.sessionExercise.trainingSession.athleteProfileId;
    const ex = row.sessionExercise.exercise;
    if (
      !ex ||
      row.completedAt == null ||
      row.performedLoadKg == null ||
      row.performedReps == null
    ) {
      continue;
    }
    const list = strengthByAthlete.get(athleteId) ?? [];
    list.push({
      id: row.id,
      at: row.completedAt,
      exerciseKey: ex.slug,
      exerciseLabel: ex.name,
      loadKg: row.performedLoadKg,
      reps: row.performedReps,
    });
    strengthByAthlete.set(athleteId, list);
  }

  const roster: AthleteAttentionSignals[] = input.grants.map((grant) => {
    const athSessions = sessionsByAthlete.get(grant.athleteProfileId) ?? [];
    const last7 = athSessions.filter(
      (s) => s.completedAt && s.completedAt >= d7,
    );
    const prev7 = athSessions.filter(
      (s) =>
        s.completedAt && s.completedAt >= d14 && s.completedAt < d7,
    );
    const lastSession = athSessions[0]?.completedAt ?? null;
    const rpes = last7
      .map((s) => s.perceivedEffort)
      .filter((v): v is number => v != null);

    const tech = techniqueByAthlete.get(grant.athleteProfileId) ?? [];
    const recentTech = tech.filter((t) => t.createdAt >= d14);
    const earlierTech = tech.filter(
      (t) => t.createdAt < d14 && t.createdAt >= d28,
    );
    const recentMean = mean(
      recentTech
        .map((t) => t.overallScore)
        .filter((v): v is number => v != null),
    );
    const earlierMean = mean(
      earlierTech
        .map((t) => t.overallScore)
        .filter((v): v is number => v != null),
    );
    let techniqueDelta: number | null = null;
    if (recentMean != null && earlierMean != null) {
      techniqueDelta = recentMean - earlierMean;
    } else if (tech.length >= 2) {
      const a = tech[0]!.overallScore;
      const b = tech[1]!.overallScore;
      if (a != null && b != null) techniqueDelta = a - b;
    }

    const comp = competitionByAthlete.get(grant.athleteProfileId);
    let daysUntilCompetition: number | null = null;
    let competitionLabel: string | null = null;
    if (comp) {
      daysUntilCompetition = Math.max(
        0,
        daysBetween(comp.competitionDate, now),
      );
      competitionLabel =
        comp.name?.trim() ||
        `${comp.sport.replaceAll("_", " ")} meet`;
    }

    const strength = strengthByAthlete.get(grant.athleteProfileId) ?? [];
    let recentPrCount7d = 0;
    let recentPrHeadline: string | null = null;
    if (strength.length > 0 && hasCoachScope(grant.scopes, "training")) {
      const timeline = detectPrEvents(strength, [], now);
      const recent = timeline.events.filter(
        (e) => new Date(e.at) >= d7,
      );
      recentPrCount7d = recent.length;
      if (recent[0]) {
        recentPrHeadline = `${recent[0].exerciseLabel}: ${recent[0].headline}`;
      }
    }

    const canRecovery = hasCoachScope(grant.scopes, "recovery");
    const lastCheckin = recoveryByAthlete.get(grant.athleteProfileId);

    return {
      athleteProfileId: grant.athleteProfileId,
      displayName: grant.displayName,
      canTraining:
        hasCoachScope(grant.scopes, "training") ||
        hasCoachScope(grant.scopes, "programs"),
      canTechnique: hasCoachScope(grant.scopes, "technique_summary"),
      canRecovery,
      sessionsLast7d: last7.length,
      sessionsPrev7d: prev7.length,
      sessionsLast28d: athSessions.length,
      daysSinceLastSession: lastSession
        ? daysBetween(now, lastSession)
        : null,
      techniqueDelta,
      techniqueSampleCount: tech.length,
      meanRpeRecent: mean(rpes),
      daysUntilCompetition,
      competitionLabel,
      recentPrCount7d,
      recentPrHeadline,
      daysSinceCheckin:
        canRecovery && lastCheckin
          ? daysBetween(now, lastCheckin)
          : canRecovery
            ? null
            : null,
      hadAnyCheckin: canRecovery ? hadCheckin.has(grant.athleteProfileId) : false,
    };
  });

  const queue = buildPrioritizedAttention(roster);

  return {
    honesty: COACH_MULTI_ATHLETE_HONESTY,
    items: queue.items.map((item) => ({
      ...item,
      urgencyLabel: item.urgency,
    })),
    totalCandidates: queue.totalCandidates,
    capped: queue.capped,
    enabled: true,
  };
}

/** Helper for callers that already have raw grant rows. */
export function mapGrantForAttention(grant: {
  athleteProfileId: string;
  scopesJson: string;
  athleteProfile: { displayName: string | null; id: string };
}): {
  athleteProfileId: string;
  displayName: string;
  scopes: CoachScope[];
} {
  const scopes = parseCoachScopes(grant.scopesJson);
  const label =
    grant.athleteProfile.displayName?.trim() ||
    `Athlete ${grant.athleteProfile.id.slice(-6)}`;
  return {
    athleteProfileId: grant.athleteProfileId,
    displayName: label,
    scopes,
  };
}
