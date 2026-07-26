/**
 * Build modification suggestions from user-declared limitations.
 * Never diagnoses; never auto-applies.
 */

import {
  INJURY_DECLARATION_LABELS,
  INJURY_MODIFICATION_ENGINE_VERSION,
  INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER,
  INJURY_MODIFICATION_HONESTY,
  INJURY_SUGGESTION_LABELS,
  type InjuryDeclarationKind,
} from "@/domain/injury-modification/constants";
import type {
  InjuryModificationPlan,
  InjuryModificationRecord,
  InjuryModificationSuggestion,
} from "@/domain/injury-modification/types";

function suggestionsFor(
  kind: InjuryDeclarationKind,
): InjuryModificationSuggestion[] {
  const base: InjuryModificationSuggestion[] = [
    {
      kind: "alternative_exercise",
      label: INJURY_SUGGESTION_LABELS.alternative_exercise,
      summary:
        "Swap the uncomfortable lift for a catalog-backed alternative that keeps a similar training effect when possible.",
      coachingCue:
        "Use Smart Exercise Substitutions to pick a regression or variation — you decide what to run.",
      href: "/app/exercise-substitutions",
    },
    {
      kind: "reduced_range",
      label: INJURY_SUGGESTION_LABELS.reduced_range,
      summary:
        "Shorten the working range (e.g. board press, rack pull, box squat patterns) when full ROM is uncomfortable.",
      coachingCue:
        "Prefer controlled or partial-range catalog options — this is a temporary training choice, not a clinical ROM prescription.",
      href: "/app/exercise-prescription",
    },
    {
      kind: "lower_loading",
      label: INJURY_SUGGESTION_LABELS.lower_loading,
      summary:
        "Reduce load or volume so you can keep moving without chasing progression while limited.",
      coachingCue:
        "Adaptation proposals may favor keep/reduce load — accept only if it matches your plan and clinician guidance.",
      href: "/app/adaptations",
    },
  ];

  if (kind === "avoid_painful_movement") {
    return [
      {
        ...base[0],
        summary:
          "Prioritize alternatives so you can avoid the movement that currently hurts without inventing a diagnosis.",
      },
      base[1],
      base[2],
    ];
  }

  if (kind === "temporary_restriction") {
    return [
      base[2],
      base[1],
      {
        ...base[0],
        summary:
          "While the restriction lasts, alternatives keep sessions productive without forcing the limited pattern.",
      },
    ];
  }

  // professional_instruction — emphasize following their clinician/coach, still show options
  return [
    {
      ...base[0],
      summary:
        "When your clinician or coach allows training, alternatives help you stay within their instructions.",
      coachingCue:
        "Match swaps to the instruction you were given. When unsure, ask your clinician — this app does not reinterpret medical advice.",
    },
    {
      ...base[1],
      coachingCue:
        "Only shorten range if it aligns with professional instruction you received.",
    },
    {
      ...base[2],
      coachingCue:
        "Lower loading when instructed or when it helps you stay within their guidance.",
    },
  ];
}

/**
 * Resolve a modification plan from active user declarations.
 */
export function resolveInjuryModificationPlan(input: {
  records: InjuryModificationRecord[];
  painSafeActive?: boolean;
}): InjuryModificationPlan {
  const active = input.records.filter((r) => r.status === "active");
  const declarations = [
    ...new Set(active.map((r) => r.declarationKind)),
  ] as InjuryDeclarationKind[];

  const deferToPainSafe = Boolean(input.painSafeActive);

  const suggestionMap = new Map<string, InjuryModificationSuggestion>();
  if (!deferToPainSafe) {
    for (const kind of declarations) {
      for (const s of suggestionsFor(kind)) {
        if (!suggestionMap.has(s.kind)) suggestionMap.set(s.kind, s);
      }
    }
  }

  const explanation: string[] = [];
  if (deferToPainSafe) {
    explanation.push(
      "Pain-Safe Response is active — aggressive workarounds are withheld. Seek clinical evaluation; Injury Modification suggestions stay paused.",
    );
  } else if (active.length === 0) {
    explanation.push(
      "No active declared limitations. Add one below if you want modification suggestions.",
    );
  } else {
    explanation.push(
      `Active declarations: ${declarations
        .map((d) => INJURY_DECLARATION_LABELS[d])
        .join(", ")}.`,
    );
    explanation.push(
      "Suggestions below are optional coaching options — not a treatment plan and not a diagnosis.",
    );
    for (const r of active) {
      if (r.affectedArea?.trim()) {
        explanation.push(`Noted focus: ${r.affectedArea.trim()}.`);
      }
      if (r.instructionSource?.trim()) {
        explanation.push(
          `Instruction source noted: ${r.instructionSource.trim()} (for your records — not verified by this app).`,
        );
      }
    }
  }

  return {
    engineVersion: INJURY_MODIFICATION_ENGINE_VERSION,
    active: active.length > 0,
    declarations,
    suggestions: [...suggestionMap.values()],
    explanation,
    honesty: INJURY_MODIFICATION_HONESTY,
    healthcareDisclaimer: INJURY_MODIFICATION_HEALTHCARE_DISCLAIMER,
    neverDiagnose: true,
    deferToPainSafe,
  };
}

/**
 * Soft adaptation bias when a limitation is active (Pain-Safe still wins).
 */
export function injuryModificationPrefersLowerLoading(input: {
  planActive: boolean;
  painSafeActive: boolean;
  changeKind: string;
}): boolean {
  if (input.painSafeActive) return false;
  if (!input.planActive) return false;
  return (
    input.changeKind === "increase_load" ||
    input.changeKind === "increase_volume"
  );
}

export function injuryModificationAdaptationHold(exerciseName: string): {
  changeKind: "reduce_load" | "keep_load";
  recommendedChange: string;
  reason: string;
  confidence: "low" | "medium";
  params: { loadDeltaPercent: number };
  source: "recommended";
} {
  return {
    changeKind: "reduce_load",
    recommendedChange: `Lower loading on ${exerciseName} while a declared limitation is active`,
    reason:
      "User-declared training limitation — prefer lower loading over progression. Follow guidance from a qualified healthcare professional. Not a diagnosis.",
    confidence: "medium",
    params: { loadDeltaPercent: -10 },
    source: "recommended",
  };
}

export function isInjuryDeclarationKind(
  value: string,
): value is InjuryDeclarationKind {
  return (
    value === "avoid_painful_movement" ||
    value === "temporary_restriction" ||
    value === "professional_instruction"
  );
}
