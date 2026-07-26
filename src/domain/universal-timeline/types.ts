import type { TimelineEventKind } from "@/domain/universal-timeline/constants";

export type TimelineEvent = {
  id: string;
  kind: TimelineEventKind;
  /** ISO timestamp for ordering. */
  occurredAt: string;
  title: string;
  summary: string;
  href: string | null;
  /** Optional secondary label (status, source). */
  meta: string | null;
};

export type TimelineFilters = {
  /** Empty / all kinds → no kind filter. */
  kinds: TimelineEventKind[];
};

export type TimelineViewModel = {
  events: TimelineEvent[];
  filters: TimelineFilters;
  countsByKind: Record<TimelineEventKind, number>;
  totalBeforeFilter: number;
  honesty: readonly string[];
  engineVersion: string;
};

/** Raw rows collected by the service — domain maps these; never invent. */
export type TimelineWorkoutRecord = {
  id: string;
  completedAt: Date | null;
  scheduledAt: Date | null;
  title: string;
  status: string;
};

export type TimelinePrRecord = {
  id: string;
  occurredAt: Date;
  title: string;
  summary: string;
  href: string;
  meta: string | null;
};

export type TimelineTechniqueRecord = {
  id: string;
  createdAt: Date;
  exerciseName: string | null;
  status: string;
  overallScore: number | null;
};

export type TimelineProgramChangeRecord = {
  id: string;
  createdAt: Date;
  programName: string;
  versionLabel: string;
  reason: string;
  programId: string;
};

export type TimelineCompetitionRecord = {
  id: string;
  competitionDate: Date;
  name: string | null;
  sport: string;
  status: string;
  weightClassLabel: string | null;
};

export type TimelineBodyweightRecord = {
  id: string;
  recordedAt: Date;
  valueKg: number;
  source: string;
};

export type TimelineCoachNoteRecord = {
  id: string;
  createdAt: Date;
  section: string;
  /** Truncated preview — never private notes. */
  preview: string;
};

export type TimelineSourceBundle = {
  workouts: TimelineWorkoutRecord[];
  prs: TimelinePrRecord[];
  technique: TimelineTechniqueRecord[];
  programChanges: TimelineProgramChangeRecord[];
  competitions: TimelineCompetitionRecord[];
  bodyweights: TimelineBodyweightRecord[];
  coachNotes: TimelineCoachNoteRecord[];
};

export type UniversalTimelineSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  kinds: Array<{ id: TimelineEventKind; label: string }>;
  docPath: "docs/UNIVERSAL_TIMELINE.md";
  generatedAt: string;
};
