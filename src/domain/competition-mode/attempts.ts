import { selectAttempts } from "@/domain/attempt-selector";
import type {
  AttemptPlan,
  CompetitionSport,
  CompetitionTargetLifts,
  LiftEstimateKg,
} from "@/domain/competition-mode/types";

function liftsForSport(
  sport: CompetitionSport,
): Array<"squat" | "bench" | "deadlift"> {
  if (sport === "deadlift_only") return ["deadlift"];
  if (sport === "strongman") return ["deadlift"];
  return ["squat", "bench", "deadlift"];
}

function labelFor(lift: "squat" | "bench" | "deadlift"): string {
  if (lift === "squat") return "Squat";
  if (lift === "bench") return "Bench";
  return "Deadlift";
}

function targetFor(
  lift: "squat" | "bench" | "deadlift",
  targets: CompetitionTargetLifts,
): number | null {
  if (lift === "squat") return targets.squatKg;
  if (lift === "bench") return targets.benchKg;
  return targets.deadliftKg;
}

/**
 * Attempt sketches for Competition Mode dashboard (balanced risk).
 * Full risk control lives on /app/attempt-selector.
 */
export function buildAttemptPlans(
  sport: CompetitionSport,
  targets: CompetitionTargetLifts,
  estimates: LiftEstimateKg[],
): AttemptPlan[] {
  const plans: AttemptPlan[] = [];

  for (const lift of liftsForSport(sport)) {
    const target = targetFor(lift, targets);
    const est = estimates.find((e) => e.lift === lift)?.rangeKg ?? null;

    const result = selectAttempts({
      lift,
      recentStrength: est
        ? {
            lowKg: est.low,
            highKg: est.high,
            sourceLabel: "Competition Mode estimate",
          }
        : null,
      history: [],
      confidence: "moderate",
      goalKg: target,
      risk: "balanced",
    });

    if (!result.ok) {
      plans.push({
        lift,
        label: labelFor(lift),
        targetThirdKg: target,
        openerKg: null,
        secondKg: null,
        thirdKg: null,
        basis: result.reason,
      });
      continue;
    }

    const s = result.selection;
    plans.push({
      lift,
      label: labelFor(lift),
      targetThirdKg: target,
      openerKg: s.openerKg,
      secondKg: s.secondKg,
      thirdKg: s.third.highKg,
      basis: `${s.third.condition} Open full Attempt Selector to change risk preference. Never a guarantee.`,
    });
  }

  return plans;
}
