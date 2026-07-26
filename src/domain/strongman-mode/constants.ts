/**
 * Strongman Mode (Prompt 106).
 * Event-specific architecture — never force powerlifting SBD/total/DOTS metrics.
 */

export const STRONGMAN_MODE_ENGINE_VERSION = "strongman_mode.v1" as const;

/** Core event types for Strongman Mode. */
export const STRONGMAN_EVENT_IDS = [
  "log_press",
  "axle",
  "farmers_walk",
  "yoke",
  "stones",
  "deadlift_variations",
] as const;
export type StrongmanEventId = (typeof STRONGMAN_EVENT_IDS)[number];

export const STRONGMAN_EVENT_LABELS: Record<StrongmanEventId, string> = {
  log_press: "Log press",
  axle: "Axle",
  farmers_walk: "Farmer’s walk",
  yoke: "Yoke",
  stones: "Stones",
  deadlift_variations: "Deadlift variations",
};

/** Trackable dimensions for event PRs. */
export const STRONGMAN_METRIC_KINDS = [
  "weight",
  "distance",
  "time",
  "reps",
] as const;
export type StrongmanMetricKind = (typeof STRONGMAN_METRIC_KINDS)[number];

export const STRONGMAN_METRIC_LABELS: Record<StrongmanMetricKind, string> = {
  weight: "Weight",
  distance: "Distance",
  time: "Time",
  reps: "Reps",
};

export const STRONGMAN_METRIC_UNITS: Record<StrongmanMetricKind, string> = {
  weight: "kg",
  distance: "m",
  time: "s",
  reps: "reps",
};

/**
 * Which metrics each event commonly tracks.
 * Implement-specific — not squat/bench/deadlift totals.
 */
export const STRONGMAN_EVENT_METRICS: Record<
  StrongmanEventId,
  readonly StrongmanMetricKind[]
> = {
  log_press: ["weight", "reps"],
  axle: ["weight", "reps"],
  farmers_walk: ["weight", "distance", "time"],
  yoke: ["weight", "distance", "time"],
  stones: ["weight", "reps", "time"],
  deadlift_variations: ["weight", "reps"],
};

/**
 * ProgressMetric.metricKey convention for event-specific PRs:
 * `sm_<eventId>_<metricKind>` e.g. sm_farmers_walk_distance
 */
export function strongmanPrMetricKey(
  eventId: StrongmanEventId,
  metric: StrongmanMetricKind,
): string {
  return `sm_${eventId}_${metric}`;
}

export function parseStrongmanPrMetricKey(
  key: string,
): { eventId: StrongmanEventId; metric: StrongmanMetricKind } | null {
  if (!key.startsWith("sm_")) return null;
  for (const eventId of STRONGMAN_EVENT_IDS) {
    for (const metric of STRONGMAN_EVENT_METRICS[eventId]) {
      if (key === strongmanPrMetricKey(eventId, metric)) {
        return { eventId, metric };
      }
    }
  }
  return null;
}

/** Dashboard priorities for Strongman Mode (no PL total / DOTS). */
export const STRONGMAN_DASHBOARD_PRIORITIES = [
  "events",
  "event_prs",
  "competition",
  "implements",
] as const;
export type StrongmanDashboardPriority =
  (typeof STRONGMAN_DASHBOARD_PRIORITIES)[number];

export const STRONGMAN_PRIORITY_LABELS: Record<
  StrongmanDashboardPriority,
  string
> = {
  events: "Event types",
  event_prs: "Event-specific PRs",
  competition: "Competition",
  implements: "Implements & specialty",
};

/**
 * Powerlifting metrics explicitly out of scope for this mode.
 * Do not surface as Strongman priorities.
 */
export const STRONGMAN_EXCLUDED_POWERLIFTING_METRICS = [
  "squat",
  "bench",
  "deadlift_total",
  "powerlifting_total",
  "dots",
  "wilks",
  "ipf_gl",
  "attempt_selector_sbd",
] as const;

export const STRONGMAN_MODE_HONESTY = [
  "Strongman Mode is organized around events (log, axle, farmer’s, yoke, stones, deadlift variations) — not powerlifting SBD totals.",
  "Event PRs track weight, distance, time, and reps as relevant to each event.",
  "Powerlifting metrics (squat/bench/total/DOTS) are not forced onto Strongman athletes.",
  "Missing event PRs stay labeled missing — values are never invented.",
] as const;
