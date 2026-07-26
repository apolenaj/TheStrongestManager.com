import {
  COMP_STRONGMAN_COMING_LATER,
  COMP_WEIGHT_CUT_SAFETY_WARNINGS,
  COMP_WEIGHT_GAP_MODERATE_KG,
  COMP_WEIGHT_GAP_NEGLIGIBLE_KG,
} from "@/domain/competition-mode/constants";
import type {
  BodyweightSignal,
  WeightCutGuidance,
} from "@/domain/competition-mode/types";

/**
 * Weight-class messaging — never auto-prescribes dehydration or cut protocols.
 */
export function buildWeightCutGuidance(
  limitKg: number | null,
  bodyweight: BodyweightSignal,
): WeightCutGuidance {
  const warnings = [...COMP_WEIGHT_CUT_SAFETY_WARNINGS];
  const base = {
    safetyWarnings: warnings,
    autoPrescribesDehydration: false as const,
  };

  if (limitKg == null || !(limitKg > 0)) {
    return {
      ...base,
      stance: "not_applicable",
      headline: "No weight-class limit set",
      detail:
        "Add a class limit if you need weigh-in context. Making weight stays your decision with qualified support.",
      gapKg: null,
    };
  }

  if (bodyweight.latestKg == null) {
    return {
      ...base,
      stance: "insufficient_data",
      headline: "Bodyweight unknown",
      detail:
        "Log bodyweight to compare against your class. We still will not prescribe a cut.",
      gapKg: null,
    };
  }

  const gap = bodyweight.latestKg - limitKg;

  if (gap <= 0) {
    return {
      ...base,
      stance: "on_or_under",
      headline: "At or under class limit (latest log)",
      detail: `Latest bodyweight ${bodyweight.latestKg} kg vs limit ${limitKg} kg. Stay consistent — no cut protocol suggested.`,
      gapKg: gap,
    };
  }

  if (gap <= COMP_WEIGHT_GAP_NEGLIGIBLE_KG) {
    return {
      ...base,
      stance: "negligible_gap",
      headline: "Small gap — normal fluctuation territory",
      detail: `About ${gap.toFixed(1)} kg over ${limitKg} kg. Often manageable with food timing and hydration habits your coach already uses — not a dehydration prescription from this app.`,
      gapKg: gap,
    };
  }

  if (gap <= COMP_WEIGHT_GAP_MODERATE_KG) {
    return {
      ...base,
      stance: "discuss_gradual",
      headline: "Gap needs a plan — not an automatic cut",
      detail: `About ${gap.toFixed(1)} kg over the ${limitKg} kg class. Discuss gradual options with a qualified coach/clinician. This app will not prescribe dehydration, saunas, or diuretics.`,
      gapKg: gap,
    };
  }

  return {
    ...base,
    stance: "high_risk_no_protocol",
    headline: "Large gap — high risk if rushed",
    detail: `About ${gap.toFixed(1)} kg over ${limitKg} kg. Aggressive last-minute cutting is unsafe and can wreck performance. Do not attempt extreme cuts. We provide no dehydration protocol — seek professional guidance or consider a higher class.`,
    gapKg: gap,
  };
}

export function strongmanNotice(
  sport: string,
): string | null {
  if (sport === "strongman") return COMP_STRONGMAN_COMING_LATER;
  return null;
}
