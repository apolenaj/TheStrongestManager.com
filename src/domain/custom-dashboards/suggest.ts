import {
  DASHBOARD_FOCUS_FALLBACK,
  DASHBOARD_FOCUS_IDS,
  type DashboardFocusId,
} from "@/domain/custom-dashboards/constants";
import type {
  DashboardFocusSignals,
  DashboardFocusSuggestion,
} from "@/domain/custom-dashboards/types";

function includesAny(hay: string[], needles: string[]): boolean {
  const lower = hay.map((h) => h.toLowerCase());
  return needles.some((n) => lower.some((h) => h.includes(n)));
}

/**
 * Suggest a focus from profile signals — never invents missing sports/goals.
 * Falls back to strength with an explicit reason when signals are thin.
 */
export function suggestDashboardFocus(
  signals: DashboardFocusSignals,
): DashboardFocusSuggestion {
  const pool = [
    signals.primaryDiscipline,
    ...signals.preferredSports,
    ...signals.goalCategories,
  ]
    .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
    .map((x) => x.toLowerCase());

  if (pool.length === 0) {
    return {
      focusId: DASHBOARD_FOCUS_FALLBACK,
      reason:
        "No discipline or goal signals yet — defaulting to Strength layout. Change anytime.",
      fromSignals: false,
    };
  }

  if (includesAny(pool, ["competition", "meet", "powerlifting", "weightlifting"])) {
    if (includesAny(pool, ["competition", "meet"])) {
      return {
        focusId: "competition",
        reason: "Profile mentions competition / meet context.",
        fromSignals: true,
      };
    }
    return {
      focusId: "strength",
      reason: "Strength / powerlifting-style discipline on profile.",
      fromSignals: true,
    };
  }

  if (includesAny(pool, ["bodybuilding", "physique", "hypertrophy"])) {
    return {
      focusId: "bodybuilding",
      reason: "Bodybuilding / hypertrophy signal on profile.",
      fromSignals: true,
    };
  }

  if (includesAny(pool, ["technique", "form", "mobility"])) {
    return {
      focusId: "technique",
      reason: "Technique-oriented goal or discipline on profile.",
      fromSignals: true,
    };
  }

  if (includesAny(pool, ["recovery", "rehab", "deload"])) {
    return {
      focusId: "recovery",
      reason: "Recovery-oriented signal on profile.",
      fromSignals: true,
    };
  }

  if (includesAny(pool, ["nutrition", "diet", "cut", "bulk"])) {
    return {
      focusId: "nutrition",
      reason: "Nutrition-related goal category on profile.",
      fromSignals: true,
    };
  }

  if (includesAny(pool, ["strength", "strongman"])) {
    return {
      focusId: "strength",
      reason: "Strength-oriented discipline on profile.",
      fromSignals: true,
    };
  }

  return {
    focusId: DASHBOARD_FOCUS_FALLBACK,
    reason:
      "Signals present but no specific focus match — Strength smart default applied.",
    fromSignals: false,
  };
}

export function isDashboardFocusId(value: unknown): value is DashboardFocusId {
  return (
    typeof value === "string" &&
    (DASHBOARD_FOCUS_IDS as readonly string[]).includes(value)
  );
}
