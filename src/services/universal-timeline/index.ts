import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";
import {
  TIMELINE_DEFAULT_LIMIT,
  TIMELINE_MAX_LIMIT,
  UNIVERSAL_TIMELINE_ENGINE_VERSION,
  UNIVERSAL_TIMELINE_HONESTY,
  assembleTimelineEvents,
  buildUniversalTimelineSnapshot,
  countByKind,
  filterTimelineEvents,
  type TimelineEventKind,
  type TimelineFilters,
  type TimelineSourceBundle,
  type TimelineViewModel,
  type UniversalTimelineSnapshot,
} from "@/domain/universal-timeline";
import { getPrIntelligence } from "@/services/pr-intelligence";
import {
  formatMass,
  normalizeMassUnit,
  toCanonicalKg,
} from "@/services/units/convert";

function sessionTitle(row: {
  workoutNameSnapshot: string | null;
  workout: { name: string } | null;
  status: string;
}): string {
  return (
    row.workoutNameSnapshot?.trim() ||
    row.workout?.name?.trim() ||
    `Training session (${row.status})`
  );
}

function truncate(text: string, max = 160): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1)}…`;
}

function isLiftMetricKey(key: string): boolean {
  const k = key.toLowerCase();
  return (
    k.includes("squat") ||
    k.includes("bench") ||
    k.includes("deadlift") ||
    k.includes("press") ||
    k.includes("1rm") ||
    k.startsWith("e1rm")
  );
}

/**
 * Load athlete universal timeline from real records.
 * Returns null without a profile — never invents history.
 */
export async function getUniversalTimeline(input: {
  userId: string;
  kinds?: TimelineEventKind[];
  limit?: number;
}): Promise<TimelineViewModel | null> {
  if (!featureFlags.universalTimeline) {
    return {
      events: [],
      filters: { kinds: input.kinds ?? [] },
      countsByKind: countByKind([]),
      totalBeforeFilter: 0,
      honesty: [
        ...UNIVERSAL_TIMELINE_HONESTY,
        "Universal timeline feature flag is off.",
      ],
      engineVersion: UNIVERSAL_TIMELINE_ENGINE_VERSION,
    };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: {
      id: true,
      units: true,
    },
  });
  if (!profile) return null;

  const limit = Math.min(
    Math.max(input.limit ?? TIMELINE_DEFAULT_LIMIT, 1),
    TIMELINE_MAX_LIMIT,
  );

  const [
    sessions,
    technique,
    programVersions,
    competitions,
    bodyweights,
    coachNotes,
    progressMetrics,
  ] = await Promise.all([
    prisma.trainingSession.findMany({
      where: {
        athleteProfileId: profile.id,
        status: "completed",
      },
      orderBy: { completedAt: "desc" },
      take: limit,
      select: {
        id: true,
        completedAt: true,
        scheduledAt: true,
        status: true,
        workoutNameSnapshot: true,
        workout: { select: { name: true } },
      },
    }),
    prisma.techniqueAnalysis.findMany({
      where: {
        athleteProfileId: profile.id,
        status: { not: "deleted" },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        status: true,
        overallScore: true,
        exercise: { select: { name: true } },
      },
    }),
    prisma.programVersion.findMany({
      where: {
        program: {
          athleteProfileId: profile.id,
          kind: "athlete",
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        versionNumber: true,
        label: true,
        reason: true,
        programId: true,
        program: { select: { name: true } },
      },
    }),
    prisma.competitionPrep.findMany({
      where: { athleteProfileId: profile.id },
      orderBy: { competitionDate: "desc" },
      take: limit,
      select: {
        id: true,
        competitionDate: true,
        name: true,
        sport: true,
        status: true,
        weightClassLabel: true,
      },
    }),
    prisma.bodyMetric.findMany({
      where: {
        athleteProfileId: profile.id,
        metricKey: "bodyweight",
      },
      orderBy: { recordedAt: "asc" },
      take: TIMELINE_MAX_LIMIT,
      select: {
        id: true,
        recordedAt: true,
        value: true,
        unit: true,
        source: true,
      },
    }),
    prisma.coachNote.findMany({
      where: {
        athleteProfileId: profile.id,
        status: "active",
        isPrivate: false,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        createdAt: true,
        section: true,
        body: true,
      },
    }),
    prisma.progressMetric.findMany({
      where: { athleteProfileId: profile.id },
      orderBy: { recordedAt: "asc" },
      take: TIMELINE_MAX_LIMIT,
      select: {
        id: true,
        metricKey: true,
        value: true,
        unit: true,
        source: true,
        recordedAt: true,
        notes: true,
      },
    }),
  ]);

  const units = normalizeMassUnit(profile.units);
  const bestByKey = new Map<string, number>();
  const prsFromMetrics = progressMetrics.flatMap((row) => {
    if (!isLiftMetricKey(row.metricKey)) return [];
    const kg = toCanonicalKg(row.value, row.unit ?? "kg");
    if (!(kg > 0)) return [];
    const prev = bestByKey.get(row.metricKey) ?? 0;
    if (kg <= prev) return [];
    bestByKey.set(row.metricKey, kg);
    return [
      {
        id: row.id,
        occurredAt: row.recordedAt,
        title: `PR · ${row.metricKey.replace(/_/g, " ")}`,
        summary: `${formatMass(kg, units)}${
          row.notes ? ` — ${truncate(row.notes, 80)}` : ""
        }`,
        href: "/app/prs",
        meta: row.source,
      },
    ];
  });

  let prs = prsFromMetrics;
  if (featureFlags.prIntelligence) {
    const intel = await getPrIntelligence(input.userId);
    if (intel?.timeline.events.length) {
      const fromIntel = intel.timeline.events.map((e) => ({
        id: e.id,
        occurredAt: new Date(e.at),
        title: e.headline || e.title,
        summary: e.related[0] ?? e.exerciseLabel,
        href: "/app/prs",
        meta: e.primaryType,
      }));
      const intelIds = new Set(fromIntel.map((p) => p.id));
      prs = [
        ...fromIntel,
        ...prsFromMetrics.filter((p) => !intelIds.has(p.id)),
      ];
    }
  }

  const sources: TimelineSourceBundle = {
    workouts: sessions.map((s) => ({
      id: s.id,
      completedAt: s.completedAt,
      scheduledAt: s.scheduledAt,
      title: sessionTitle(s),
      status: s.status,
    })),
    prs,
    technique: technique.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      exerciseName: t.exercise?.name ?? null,
      status: t.status,
      overallScore: t.overallScore,
    })),
    programChanges: programVersions.map((v) => ({
      id: v.id,
      createdAt: v.createdAt,
      programName: v.program.name,
      versionLabel: v.label?.trim() || `v${v.versionNumber}`,
      reason: v.reason,
      programId: v.programId,
    })),
    competitions: competitions.map((c) => ({
      id: c.id,
      competitionDate: c.competitionDate,
      name: c.name,
      sport: c.sport,
      status: c.status,
      weightClassLabel: c.weightClassLabel,
    })),
    bodyweights: bodyweights.map((b) => ({
      id: b.id,
      recordedAt: b.recordedAt,
      valueKg: toCanonicalKg(b.value, b.unit),
      source: b.source,
    })),
    coachNotes: coachNotes.map((n) => ({
      id: n.id,
      createdAt: n.createdAt,
      section: n.section,
      preview: truncate(n.body),
    })),
  };

  const all = assembleTimelineEvents(sources);
  const filters: TimelineFilters = { kinds: input.kinds ?? [] };
  const filtered = filterTimelineEvents(all, filters).slice(0, limit);

  return {
    events: filtered,
    filters,
    countsByKind: countByKind(all),
    totalBeforeFilter: all.length,
    honesty: UNIVERSAL_TIMELINE_HONESTY,
    engineVersion: UNIVERSAL_TIMELINE_ENGINE_VERSION,
  };
}

export function getUniversalTimelineAdminSnapshot(): UniversalTimelineSnapshot {
  return buildUniversalTimelineSnapshot();
}
