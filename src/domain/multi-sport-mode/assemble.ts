/**
 * Assemble Multi-Sport Athlete Mode — one profile, focuses from preferredSports.
 */

import {
  MULTI_SPORT_FOCUS_LABELS,
  MULTI_SPORT_MODE_ENGINE_VERSION,
  MULTI_SPORT_MODE_HONESTY,
  MULTI_SPORT_MODE_HREF,
  MULTI_SPORT_PR_NAMESPACE,
  isMultiSportAthlete,
  normalizeSportFocuses,
  type MultiSportFocusId,
} from "@/domain/multi-sport-mode/constants";
import type {
  MultiSportFocusCard,
  MultiSportLoggedPr,
  MultiSportModePayload,
  MultiSportModeSignals,
  MultiSportPrGroup,
  MultiSportPrItem,
} from "@/domain/multi-sport-mode/types";
import {
  STRONGMAN_EVENT_LABELS,
  STRONGMAN_METRIC_LABELS,
  parseStrongmanPrMetricKey,
} from "@/domain/strongman-mode/constants";
import {
  WEIGHTLIFTING_LIFT_LABELS,
  parseWeightliftingPrMetricKey,
} from "@/domain/weightlifting-mode/constants";

/** Shared with onboarding MAJOR_LIFTS — powerlifting / general strength PR keys. */
const LIFT_PR_CATALOG = [
  { metricKey: "lift_squat", label: "Back squat" },
  { metricKey: "lift_bench", label: "Bench press" },
  { metricKey: "lift_deadlift", label: "Deadlift" },
  { metricKey: "lift_press", label: "Overhead press" },
] as const;

const LIFT_LABEL_BY_KEY = Object.fromEntries(
  LIFT_PR_CATALOG.map((l) => [l.metricKey, l.label]),
) as Record<string, string>;

function bestByKey(
  rows: MultiSportLoggedPr[],
  metricKey: string,
  preferLower = false,
): MultiSportLoggedPr | null {
  const matches = rows.filter((r) => r.metricKey === metricKey);
  if (matches.length === 0) return null;
  return matches.reduce((best, row) => {
    if (preferLower) return row.value < best.value ? row : best;
    return row.value > best.value ? row : best;
  });
}

function labelForMetricKey(metricKey: string): string {
  if (LIFT_LABEL_BY_KEY[metricKey]) return LIFT_LABEL_BY_KEY[metricKey]!;
  const sm = parseStrongmanPrMetricKey(metricKey);
  if (sm) {
    return `${STRONGMAN_EVENT_LABELS[sm.eventId]} (${STRONGMAN_METRIC_LABELS[sm.metric]})`;
  }
  const wl = parseWeightliftingPrMetricKey(metricKey);
  if (wl) return WEIGHTLIFTING_LIFT_LABELS[wl];
  return metricKey;
}

function unitFor(row: MultiSportLoggedPr): string {
  return row.unit?.trim() || "kg";
}

function prsForNamespace(
  sportId: MultiSportFocusId,
  namespace: "lift" | "sm" | "wl" | "none",
  logged: MultiSportLoggedPr[],
): MultiSportPrItem[] {
  if (namespace === "none") return [];

  const keys =
    namespace === "lift"
      ? LIFT_PR_CATALOG.map((l) => l.metricKey)
      : [
          ...new Set(
            logged
              .map((r) => r.metricKey)
              .filter((k) =>
                namespace === "sm"
                  ? k.startsWith("sm_")
                  : k.startsWith("wl_"),
              ),
          ),
        ];

  const items: MultiSportPrItem[] = [];
  for (const metricKey of keys) {
    const preferLower =
      namespace === "sm" && metricKey.endsWith("_time");
    const best = bestByKey(logged, metricKey, preferLower);
    if (!best) continue;
    // Only include parsed sm/wl keys when namespace matches
    if (namespace === "sm" && !parseStrongmanPrMetricKey(metricKey)) continue;
    if (namespace === "wl" && !parseWeightliftingPrMetricKey(metricKey)) {
      continue;
    }
    items.push({
      sportId,
      metricKey,
      label: labelForMetricKey(metricKey),
      value: best.value,
      unit: unitFor(best),
      recordedAtIso: best.recordedAt?.toISOString() ?? null,
    });
  }
  return items;
}

function buildPrGroup(
  sportId: MultiSportFocusId,
  logged: MultiSportLoggedPr[],
): MultiSportPrGroup {
  const namespace = MULTI_SPORT_PR_NAMESPACE[sportId];
  const prs = prsForNamespace(sportId, namespace, logged);
  let emptyNote: string | null = null;
  if (namespace === "none") {
    emptyNote =
      "Bodybuilding tracks volume and progression in Bodybuilding Mode — not mixed into lift/event PR lists.";
  } else if (prs.length === 0) {
    emptyNote = `No ${MULTI_SPORT_FOCUS_LABELS[sportId]} PRs logged yet.`;
  }
  return {
    sportId,
    sportLabel: MULTI_SPORT_FOCUS_LABELS[sportId],
    href: MULTI_SPORT_MODE_HREF[sportId],
    namespace,
    prs,
    emptyNote,
  };
}

function buildFocusCards(
  focuses: MultiSportFocusId[],
  prGroups: MultiSportPrGroup[],
): MultiSportFocusCard[] {
  const countBySport = Object.fromEntries(
    prGroups.map((g) => [g.sportId, g.prs.length]),
  ) as Partial<Record<MultiSportFocusId, number>>;

  return focuses.map((id) => ({
    id,
    label: MULTI_SPORT_FOCUS_LABELS[id],
    href: MULTI_SPORT_MODE_HREF[id],
    prNamespace: MULTI_SPORT_PR_NAMESPACE[id],
    prCount: countBySport[id] ?? 0,
  }));
}

export function assembleMultiSportMode(
  signals: MultiSportModeSignals,
): MultiSportModePayload {
  const focuses = normalizeSportFocuses({
    preferredSports: signals.preferredSports,
    primaryDiscipline: signals.primaryDiscipline,
  });
  const prGroups = focuses.map((id) => buildPrGroup(id, signals.loggedPrs));
  const focusCards = buildFocusCards(focuses, prGroups);

  return {
    engineVersion: MULTI_SPORT_MODE_ENGINE_VERSION,
    isMultiSport: isMultiSportAthlete(focuses),
    focuses: focusCards,
    leadDiscipline: signals.primaryDiscipline,
    prGroups,
    goals: signals.goals.map((g) => ({
      title: g.title,
      category: g.category,
      priority: g.priority,
    })),
    mixedGoalsAllowed: true,
    singleProfile: true,
    honesty: MULTI_SPORT_MODE_HONESTY,
  };
}

export function multiSportModeText(mode: MultiSportModePayload): string {
  if (!mode.isMultiSport) {
    return mode.focuses.length === 1
      ? `Single focus: ${mode.focuses[0]!.label}.`
      : "No sport focuses selected yet.";
  }
  return `Multi-sport: ${mode.focuses.map((f) => f.label).join(" + ")}.`;
}
