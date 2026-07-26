import {
  BODYWEIGHT_MILESTONE_MIN_DELTA_KG,
  TIMELINE_EVENT_KINDS,
  type TimelineEventKind,
} from "@/domain/universal-timeline/constants";
import type {
  TimelineBodyweightRecord,
  TimelineCoachNoteRecord,
  TimelineCompetitionRecord,
  TimelineEvent,
  TimelineFilters,
  TimelinePrRecord,
  TimelineProgramChangeRecord,
  TimelineSourceBundle,
  TimelineTechniqueRecord,
  TimelineWorkoutRecord,
} from "@/domain/universal-timeline/types";

export function isTimelineEventKind(value: unknown): value is TimelineEventKind {
  return (
    typeof value === "string" &&
    (TIMELINE_EVENT_KINDS as readonly string[]).includes(value)
  );
}

export function parseTimelineKindsParam(
  raw: string | string[] | undefined,
): TimelineEventKind[] {
  if (raw == null) return [];
  const parts = Array.isArray(raw)
    ? raw.flatMap((r) => r.split(","))
    : raw.split(",");
  const kinds: TimelineEventKind[] = [];
  for (const p of parts) {
    const id = p.trim();
    if (isTimelineEventKind(id) && !kinds.includes(id)) kinds.push(id);
  }
  return kinds;
}

function workoutOccurredAt(w: TimelineWorkoutRecord): Date | null {
  return w.completedAt ?? w.scheduledAt;
}

export function mapWorkoutEvent(w: TimelineWorkoutRecord): TimelineEvent | null {
  const at = workoutOccurredAt(w);
  if (!at) return null;
  return {
    id: `workout:${w.id}`,
    kind: "workout",
    occurredAt: at.toISOString(),
    title: w.title || "Workout",
    summary: `Session ${w.status.replace(/_/g, " ")}.`,
    href: "/app/today",
    meta: w.status,
  };
}

export function mapPrEvent(p: TimelinePrRecord): TimelineEvent {
  return {
    id: `pr:${p.id}`,
    kind: "pr",
    occurredAt: p.occurredAt.toISOString(),
    title: p.title,
    summary: p.summary,
    href: p.href,
    meta: p.meta,
  };
}

export function mapTechniqueEvent(t: TimelineTechniqueRecord): TimelineEvent {
  const score =
    t.overallScore != null ? `Score ${Math.round(t.overallScore)}` : null;
  return {
    id: `technique:${t.id}`,
    kind: "technique_analysis",
    occurredAt: t.createdAt.toISOString(),
    title: t.exerciseName
      ? `Technique — ${t.exerciseName}`
      : "Technique analysis",
    summary: score
      ? `${score} · status ${t.status}`
      : `Status ${t.status} — score only when a real analysis returns one.`,
    href: `/app/technique/${t.id}`,
    meta: t.status,
  };
}

export function mapProgramChangeEvent(
  p: TimelineProgramChangeRecord,
): TimelineEvent {
  return {
    id: `program:${p.id}`,
    kind: "program_change",
    occurredAt: p.createdAt.toISOString(),
    title: `${p.programName} · ${p.versionLabel}`,
    summary: p.reason,
    href: `/app/programs/${p.programId}`,
    meta: p.versionLabel,
  };
}

export function mapCompetitionEvent(
  c: TimelineCompetitionRecord,
): TimelineEvent {
  return {
    id: `competition:${c.id}`,
    kind: "competition",
    occurredAt: c.competitionDate.toISOString(),
    title: c.name?.trim() || `${c.sport} competition`,
    summary: [
      c.sport.replace(/_/g, " "),
      c.weightClassLabel ? `class ${c.weightClassLabel}` : null,
      c.status,
    ]
      .filter(Boolean)
      .join(" · "),
    href: "/app/competition",
    meta: c.status,
  };
}

export function mapCoachNoteEvent(n: TimelineCoachNoteRecord): TimelineEvent {
  return {
    id: `coach_note:${n.id}`,
    kind: "coach_note",
    occurredAt: n.createdAt.toISOString(),
    title: `Coach note · ${n.section}`,
    summary: n.preview,
    href: "/app/coaching-notes",
    meta: n.section,
  };
}

/**
 * First bodyweight log, or later logs that move ≥ threshold vs previous.
 */
export function detectBodyweightMilestones(
  rows: TimelineBodyweightRecord[],
): TimelineEvent[] {
  const sorted = [...rows].sort(
    (a, b) => a.recordedAt.getTime() - b.recordedAt.getTime(),
  );
  const events: TimelineEvent[] = [];
  let prevKg: number | null = null;

  for (const row of sorted) {
    if (!Number.isFinite(row.valueKg) || row.valueKg <= 0) continue;
    const isFirst = prevKg == null;
    const delta = prevKg == null ? null : row.valueKg - prevKg;
    const isMilestone =
      isFirst ||
      (delta != null &&
        Math.abs(delta) >= BODYWEIGHT_MILESTONE_MIN_DELTA_KG);

    if (isMilestone) {
      const summary = isFirst
        ? `First logged bodyweight: ${row.valueKg.toFixed(1)} kg (${row.source}).`
        : `Bodyweight ${row.valueKg.toFixed(1)} kg (${delta! >= 0 ? "+" : ""}${delta!.toFixed(1)} kg vs prior log).`;
      events.push({
        id: `bw:${row.id}`,
        kind: "bodyweight_milestone",
        occurredAt: row.recordedAt.toISOString(),
        title: isFirst ? "First bodyweight log" : "Bodyweight milestone",
        summary,
        href: "/app/profile",
        meta: row.source,
      });
    }
    prevKg = row.valueKg;
  }

  return events;
}

export function assembleTimelineEvents(
  sources: TimelineSourceBundle,
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  for (const w of sources.workouts) {
    const e = mapWorkoutEvent(w);
    if (e) events.push(e);
  }
  for (const p of sources.prs) events.push(mapPrEvent(p));
  for (const t of sources.technique) events.push(mapTechniqueEvent(t));
  for (const p of sources.programChanges) events.push(mapProgramChangeEvent(p));
  for (const c of sources.competitions) events.push(mapCompetitionEvent(c));
  events.push(...detectBodyweightMilestones(sources.bodyweights));
  for (const n of sources.coachNotes) events.push(mapCoachNoteEvent(n));

  events.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime(),
  );
  return events;
}

export function filterTimelineEvents(
  events: TimelineEvent[],
  filters: TimelineFilters,
): TimelineEvent[] {
  if (filters.kinds.length === 0) return events;
  const set = new Set(filters.kinds);
  return events.filter((e) => set.has(e.kind));
}

export function countByKind(
  events: TimelineEvent[],
): Record<TimelineEventKind, number> {
  const counts = Object.fromEntries(
    TIMELINE_EVENT_KINDS.map((k) => [k, 0]),
  ) as Record<TimelineEventKind, number>;
  for (const e of events) counts[e.kind] += 1;
  return counts;
}
