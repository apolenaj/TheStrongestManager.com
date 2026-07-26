import {
  ATTEMPT_FRACTIONS,
  ATTEMPT_GOAL_UPLIFT_CAP,
  ATTEMPT_HONESTY,
  ATTEMPT_LOW_CONFIDENCE_LOW_WEIGHT,
  ATTEMPT_ROUND_KG,
} from "@/domain/attempt-selector/constants";
import type {
  AttemptConfidence,
  AttemptLift,
  AttemptRiskPreference,
  AttemptSelection,
  AttemptSelectorInput,
  AttemptSelectorResult,
  MeetAttemptHistoryEntry,
  StrengthEstimate,
} from "@/domain/attempt-selector/types";

export function roundAttemptKg(kg: number): number {
  return Math.round(kg / ATTEMPT_ROUND_KG) * ATTEMPT_ROUND_KG;
}

function liftLabel(lift: AttemptLift): string {
  if (lift === "squat") return "Squat";
  if (lift === "bench") return "Bench";
  return "Deadlift";
}

function riskLabel(risk: AttemptRiskPreference): string {
  if (risk === "conservative") return "Conservative";
  if (risk === "balanced") return "Balanced";
  return "Aggressive";
}

/**
 * Blend recent strength + goal into a planning ceiling.
 * Low confidence pulls toward estimate low; goals cannot invent huge jumps.
 */
export function resolvePlanningCeiling(parts: {
  strength: StrengthEstimate | null;
  goalKg: number | null;
  confidence: AttemptConfidence;
  historyBestMadeKg: number | null;
}): number | null {
  const { strength, goalKg, confidence, historyBestMadeKg } = parts;

  if (strength == null && goalKg == null && historyBestMadeKg == null) {
    return null;
  }

  let fromStrength: number | null = null;
  if (strength) {
    const wLow =
      confidence === "low"
        ? ATTEMPT_LOW_CONFIDENCE_LOW_WEIGHT
        : confidence === "moderate"
          ? 0.4
          : 0.25;
    fromStrength = strength.lowKg * wLow + strength.highKg * (1 - wLow);
  }

  // Start from strength, else history, else goal alone.
  let ceiling = fromStrength ?? historyBestMadeKg ?? goalKg!;

  if (historyBestMadeKg != null) {
    ceiling = Math.max(ceiling, historyBestMadeKg);
  }

  if (goalKg != null && goalKg > 0) {
    if (fromStrength != null) {
      const capped = fromStrength * (1 + ATTEMPT_GOAL_UPLIFT_CAP);
      // Goal may pull up slightly, or pull down if the meet intent is lower.
      if (goalKg >= ceiling) {
        ceiling = Math.min(goalKg, Math.max(ceiling, capped));
      } else {
        ceiling = Math.max(goalKg, historyBestMadeKg ?? goalKg);
      }
    } else if (historyBestMadeKg != null) {
      const capped = historyBestMadeKg * (1 + ATTEMPT_GOAL_UPLIFT_CAP);
      ceiling = Math.min(Math.max(goalKg, historyBestMadeKg), Math.max(goalKg, capped));
    } else {
      ceiling = goalKg;
    }
  }

  return ceiling;
}

function latestHistoryForLift(
  history: MeetAttemptHistoryEntry[],
  lift: AttemptLift,
): MeetAttemptHistoryEntry | null {
  const rows = history
    .filter((h) => h.lift === lift)
    .sort((a, b) => b.meetDate.getTime() - a.meetDate.getTime());
  return rows[0] ?? null;
}

function bestMadeFromHistory(
  history: MeetAttemptHistoryEntry[],
  lift: AttemptLift,
): number | null {
  let best: number | null = null;
  for (const h of history) {
    if (h.lift !== lift || h.bestMadeKg == null) continue;
    if (best == null || h.bestMadeKg > best) best = h.bestMadeKg;
  }
  return best;
}

/**
 * Select opener / second / conditional third for one lift.
 * Never guarantees a make.
 */
export function selectAttempts(
  input: AttemptSelectorInput,
): AttemptSelectorResult {
  const historyBest = bestMadeFromHistory(input.history, input.lift);
  const lastMeet = latestHistoryForLift(input.history, input.lift);

  const ceiling = resolvePlanningCeiling({
    strength: input.recentStrength,
    goalKg: input.goalKg,
    confidence: input.confidence,
    historyBestMadeKg: historyBest,
  });

  if (ceiling == null || !(ceiling > 0)) {
    return {
      ok: false,
      reason:
        "Need recent strength (estimated range), a goal load, or competition history to sketch attempts.",
    };
  }

  const frac = ATTEMPT_FRACTIONS[input.risk];
  let opener = roundAttemptKg(ceiling * frac.opener);
  let second = roundAttemptKg(ceiling * frac.second);
  let thirdLow = roundAttemptKg(ceiling * frac.thirdLow);
  let thirdHigh = roundAttemptKg(ceiling * frac.thirdHigh);

  // Competition history adjustments
  if (lastMeet?.missedOpener === true && lastMeet.openerKg != null) {
    opener = roundAttemptKg(Math.min(opener, lastMeet.openerKg * 0.975));
  } else if (
    lastMeet?.openerKg != null &&
    lastMeet.missedOpener === false &&
    input.risk !== "aggressive"
  ) {
    // Anchor opener near a previously made opener when not chasing aggression
    const anchored = roundAttemptKg(
      (opener + lastMeet.openerKg) / 2,
    );
    opener = Math.min(opener, Math.max(anchored, lastMeet.openerKg));
  }

  if (second <= opener) {
    second = roundAttemptKg(opener + ATTEMPT_ROUND_KG * 2);
  }
  if (thirdLow <= second) {
    thirdLow = roundAttemptKg(second + ATTEMPT_ROUND_KG);
  }
  if (thirdHigh < thirdLow) {
    thirdHigh = roundAttemptKg(thirdLow + ATTEMPT_ROUND_KG * 2);
  }

  // Goal: if goal sits between third band, tighten toward it without promising
  if (input.goalKg != null && input.goalKg > second) {
    const g = roundAttemptKg(input.goalKg);
    if (g >= thirdLow && g <= thirdHigh) {
      // keep band
    } else if (g > thirdHigh && input.risk === "aggressive") {
      thirdHigh = g;
    } else if (g < thirdLow && input.risk === "conservative") {
      thirdLow = g;
      thirdHigh = Math.max(thirdHigh, roundAttemptKg(g + ATTEMPT_ROUND_KG * 2));
    }
  }

  const strategy: string[] = [
    `${riskLabel(input.risk)} risk: opener aims to put points on the board; second builds; third is conditional — not promised.`,
    `Planning ceiling ≈ ${roundAttemptKg(ceiling)} kg from recent strength${input.goalKg != null ? ", goal" : ""}${historyBest != null ? ", and meet history" : ""} (not a guaranteed max).`,
  ];

  if (input.recentStrength) {
    strategy.push(
      `Recent strength used: ${input.recentStrength.lowKg}–${input.recentStrength.highKg} kg (${input.recentStrength.sourceLabel}).`,
    );
  } else {
    strategy.push("No recent strength range — ceiling leans on goal and/or history.");
  }

  strategy.push(`Confidence: ${input.confidence} — ${confidenceBlurb(input.confidence)}`);

  if (lastMeet) {
    strategy.push(
      `Last meet signal (${lastMeet.meetDate.toISOString().slice(0, 10)}): opener ${lastMeet.openerKg ?? "—"} kg${lastMeet.missedOpener === true ? " (missed — opener pulled down)" : lastMeet.missedOpener === false ? " (made)" : ""}.`,
    );
  } else {
    strategy.push("No competition history on file for this lift — strategy is strength/goal based only.");
  }

  if (input.goalKg != null) {
    strategy.push(
      `Goal third intent: ${roundAttemptKg(input.goalKg)} kg — informs the ceiling; does not guarantee the attempt.`,
    );
  }

  strategy.push(ATTEMPT_HONESTY);

  const selection: AttemptSelection = {
    lift: input.lift,
    liftLabel: liftLabel(input.lift),
    risk: input.risk,
    riskLabel: riskLabel(input.risk),
    openerKg: opener,
    secondKg: second,
    third: {
      lowKg: thirdLow,
      highKg: thirdHigh,
      condition:
        thirdLow === thirdHigh
          ? `Third ≈ ${thirdLow} kg if the second is made — call audible if it grinds or misses.`
          : `Third: ${thirdLow}–${thirdHigh} kg depending on the second attempt (lower if grindy/missed feel; upper if it moves well).`,
    },
    planningCeilingKg: roundAttemptKg(ceiling),
    strategy,
    inputsUsed: {
      hasRecentStrength: input.recentStrength != null,
      historyMeetCount: input.history.filter((h) => h.lift === input.lift).length,
      confidence: input.confidence,
      goalKg: input.goalKg,
    },
    honestyNote: ATTEMPT_HONESTY,
  };

  return { ok: true, selection };
}

function confidenceBlurb(c: AttemptConfidence): string {
  if (c === "high") {
    return "more weight on the upper estimate; still not a guarantee.";
  }
  if (c === "moderate") {
    return "balanced blend of the estimate range.";
  }
  return "pulls planning toward the lower estimate so openers stay safer.";
}

/**
 * Convenience: selections for all three lifts with shared risk/confidence.
 */
export function selectAttemptsForMeet(parts: {
  lifts: AttemptLift[];
  strengthByLift: Partial<Record<AttemptLift, StrengthEstimate | null>>;
  history: MeetAttemptHistoryEntry[];
  confidence: AttemptConfidence;
  goals: Partial<Record<AttemptLift, number | null>>;
  risk: AttemptRiskPreference;
}): Array<AttemptSelectorResult & { lift: AttemptLift }> {
  return parts.lifts.map((lift) => ({
    lift,
    ...selectAttempts({
      lift,
      recentStrength: parts.strengthByLift[lift] ?? null,
      history: parts.history,
      confidence: parts.confidence,
      goalKg: parts.goals[lift] ?? null,
      risk: parts.risk,
    }),
  }));
}
