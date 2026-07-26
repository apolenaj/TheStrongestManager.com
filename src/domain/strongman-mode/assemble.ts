/**
 * Assemble Strongman Mode — event PRs only, no forced powerlifting metrics.
 */

import {
  STRONGMAN_DASHBOARD_PRIORITIES,
  STRONGMAN_EVENT_IDS,
  STRONGMAN_EVENT_LABELS,
  STRONGMAN_EVENT_METRICS,
  STRONGMAN_EXCLUDED_POWERLIFTING_METRICS,
  STRONGMAN_METRIC_LABELS,
  STRONGMAN_METRIC_UNITS,
  STRONGMAN_MODE_ENGINE_VERSION,
  STRONGMAN_MODE_HONESTY,
  STRONGMAN_PRIORITY_LABELS,
  strongmanPrMetricKey,
  type StrongmanEventId,
  type StrongmanMetricKind,
} from "@/domain/strongman-mode/constants";
import type {
  StrongmanEventCard,
  StrongmanEventPr,
  StrongmanModePayload,
  StrongmanModeSignals,
  StrongmanPriorityCard,
} from "@/domain/strongman-mode/types";

function bestPr(
  signals: StrongmanModeSignals,
  eventId: StrongmanEventId,
  metric: StrongmanMetricKind,
): StrongmanEventPr | null {
  const matches = signals.loggedPrs.filter(
    (p) => p.eventId === eventId && p.metric === metric,
  );
  if (matches.length === 0) return null;

  // Higher is better for weight/distance/reps; lower is better for time
  const sorted = [...matches].sort((a, b) => {
    if (metric === "time") return a.value - b.value;
    return b.value - a.value;
  });
  const best = sorted[0]!;
  return {
    eventId,
    eventLabel: STRONGMAN_EVENT_LABELS[eventId],
    metric,
    metricLabel: STRONGMAN_METRIC_LABELS[metric],
    value: best.value,
    unit: best.unit || STRONGMAN_METRIC_UNITS[metric],
    metricKey: strongmanPrMetricKey(eventId, metric),
    recordedAtIso: best.recordedAt?.toISOString() ?? null,
  };
}

function buildEventCards(signals: StrongmanModeSignals): StrongmanEventCard[] {
  return STRONGMAN_EVENT_IDS.map((eventId) => {
    const tracked = STRONGMAN_EVENT_METRICS[eventId];
    const prs: StrongmanEventPr[] = [];
    const missingMetrics: StrongmanMetricKind[] = [];
    for (const metric of tracked) {
      const pr = bestPr(signals, eventId, metric);
      if (pr) prs.push(pr);
      else missingMetrics.push(metric);
    }
    return {
      eventId,
      label: STRONGMAN_EVENT_LABELS[eventId],
      trackedMetrics: [...tracked],
      prs,
      missingMetrics,
    };
  });
}

function buildPriorities(
  signals: StrongmanModeSignals,
  events: StrongmanEventCard[],
  eventPrs: StrongmanEventPr[],
): StrongmanPriorityCard[] {
  const eventsWithPrs = events.filter((e) => e.prs.length > 0).length;

  return STRONGMAN_DASHBOARD_PRIORITIES.map((id) => {
    if (id === "events") {
      return {
        id,
        label: STRONGMAN_PRIORITY_LABELS.events,
        headline: `${STRONGMAN_EVENT_IDS.length} event types`,
        detail:
          "Log press, axle, farmer’s walk, yoke, stones, and deadlift variations — each with its own metrics.",
        href: "/app/strongman",
        metricValue: STRONGMAN_EVENT_IDS.length,
        metricUnit: "events",
        available: true,
        missingNote: null,
      };
    }
    if (id === "event_prs") {
      return {
        id,
        label: STRONGMAN_PRIORITY_LABELS.event_prs,
        headline:
          eventPrs.length > 0
            ? `${eventPrs.length} event PR(s) across ${eventsWithPrs} event(s)`
            : "No event-specific PRs logged",
        detail:
          "PRs use weight, distance, time, and reps as relevant — not a powerlifting total.",
        href: "/app/progress",
        metricValue: eventPrs.length > 0 ? eventPrs.length : null,
        metricUnit: eventPrs.length > 0 ? "PRs" : null,
        available: eventPrs.length > 0,
        missingNote:
          eventPrs.length === 0
            ? "Log strongman event PRs (sm_<event>_<metric> keys) when ready."
            : null,
      };
    }
    if (id === "competition") {
      return {
        id,
        label: STRONGMAN_PRIORITY_LABELS.competition,
        headline: signals.competition.hasPrep
          ? signals.competition.name ??
            (signals.competition.daysUntil != null
              ? `Contest in ${signals.competition.daysUntil} day${signals.competition.daysUntil === 1 ? "" : "s"}`
              : "Strongman contest on file")
          : "No strongman contest set",
        detail:
          "Competition Mode supports a strongman sport tag. Event programming stays implement-based.",
        href: "/app/competition",
        metricValue: signals.competition.daysUntil,
        metricUnit: signals.competition.daysUntil != null ? "days" : null,
        available: signals.competition.hasPrep,
        missingNote: signals.competition.hasPrep
          ? null
          : "Optional: add a strongman competition date when useful.",
      };
    }
    return {
      id: "implements",
      label: STRONGMAN_PRIORITY_LABELS.implements,
      headline: "Specialty implements",
      detail:
        "Bias equipment and alternatives toward specialty implements — not a forced SBD bar path.",
      href: "/app/profile",
      metricValue: null,
      metricUnit: null,
      available: true,
      missingNote: null,
    };
  });
}

export function assembleStrongmanMode(
  signals: StrongmanModeSignals,
): StrongmanModePayload {
  const events = buildEventCards(signals);
  const eventPrs = events.flatMap((e) => e.prs);

  return {
    engineVersion: STRONGMAN_MODE_ENGINE_VERSION,
    generatedAtIso: signals.now.toISOString(),
    events,
    eventPrs,
    priorities: buildPriorities(signals, events, eventPrs),
    competition: { ...signals.competition },
    powerliftingMetricsForced: false,
    excludedPowerliftingMetrics: [...STRONGMAN_EXCLUDED_POWERLIFTING_METRICS],
    honesty: STRONGMAN_MODE_HONESTY,
  };
}

export function strongmanModeText(payload: StrongmanModePayload): string {
  return [
    ...payload.honesty,
    ...payload.priorities.flatMap((p) => [
      p.headline,
      p.detail,
      p.missingNote ?? "",
    ]),
    ...payload.events.map((e) => e.label),
    ...payload.excludedPowerliftingMetrics,
  ]
    .join("\n")
    .toLowerCase();
}
