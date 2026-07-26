/**
 * Gather Powerlifting Mode signals from PRs + competition prep.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  daysUntil,
  phaseLabel,
  resolveCompetitionPhase,
} from "@/domain/competition-mode";
import {
  assemblePowerliftingMode,
  type PowerliftingModePayload,
  type PowerliftingModeSignals,
} from "@/domain/powerlifting-mode";
import { normalizeTimezone } from "@/domain/timezone-system";
import { prisma } from "@/lib/db";
import { MAJOR_LIFTS } from "@/services/onboarding/options";
import { parseTargetLiftsJson } from "@/services/competition-mode";
import { toCanonicalKg } from "@/services/units/convert";

type LiftSource = PowerliftingModeSignals["lifts"]["squatSource"];

async function bestReportedLiftKg(
  athleteProfileId: string,
  metricKey: string,
): Promise<number | null> {
  const row = await prisma.progressMetric.findFirst({
    where: { athleteProfileId, metricKey },
    orderBy: { value: "desc" },
    select: { value: true, unit: true },
  });
  if (!row) return null;
  return toCanonicalKg(row.value, row.unit ?? "kg");
}

function pickLift(
  reported: number | null,
  target: number | null,
): { kg: number | null; source: LiftSource } {
  if (target != null && target > 0 && reported != null && reported > 0) {
    // Prefer the higher of target vs PR for display priority; label source honestly
    if (reported >= target) return { kg: reported, source: "reported_pr" };
    return { kg: target, source: "target" };
  }
  if (reported != null && reported > 0) {
    return { kg: reported, source: "reported_pr" };
  }
  if (target != null && target > 0) {
    return { kg: target, source: "target" };
  }
  return { kg: null, source: "missing" };
}

async function gatherSignals(
  athleteProfileId: string,
  now: Date,
): Promise<PowerliftingModeSignals> {
  const [profile, prep, squatPr, benchPr, deadliftPr] = await Promise.all([
    prisma.athleteProfile.findUnique({
      where: { id: athleteProfileId },
      select: { timezone: true },
    }),
    prisma.competitionPrep.findFirst({
      where: {
        athleteProfileId,
        status: { in: ["planned", "active"] },
        sport: { in: ["powerlifting", "deadlift_only"] },
      },
      orderBy: { competitionDate: "asc" },
    }),
    bestReportedLiftKg(
      athleteProfileId,
      MAJOR_LIFTS.find((l) => l.id === "squat")!.metricKey,
    ),
    bestReportedLiftKg(
      athleteProfileId,
      MAJOR_LIFTS.find((l) => l.id === "bench")!.metricKey,
    ),
    bestReportedLiftKg(
      athleteProfileId,
      MAJOR_LIFTS.find((l) => l.id === "deadlift")!.metricKey,
    ),
  ]);
  const timeZone = normalizeTimezone(profile?.timezone);

  const targets = prep
    ? parseTargetLiftsJson(prep.targetLiftsJson)
    : { squatKg: null, benchKg: null, deadliftKg: null, notes: null };

  const squat = pickLift(squatPr, targets.squatKg);
  const bench = pickLift(benchPr, targets.benchKg);
  const deadlift = pickLift(deadliftPr, targets.deadliftKg);

  let competition: PowerliftingModeSignals["competition"] = {
    hasPrep: false,
    name: null,
    dateIso: null,
    daysUntil: null,
    weightClassLabel: null,
    weightClassLimitKg: null,
    phaseLabel: null,
  };

  if (prep) {
    const until = daysUntil(prep.competitionDate, now, timeZone);
    const phase = resolveCompetitionPhase(until);
    competition = {
      hasPrep: true,
      name: prep.name,
      dateIso: prep.competitionDate.toISOString(),
      daysUntil: until,
      weightClassLabel: prep.weightClassLabel,
      weightClassLimitKg: prep.weightClassLimitKg,
      phaseLabel: phaseLabel(phase),
    };
  }

  return {
    now,
    lifts: {
      squatKg: squat.kg,
      benchKg: bench.kg,
      deadliftKg: deadlift.kg,
      squatSource: squat.source,
      benchSource: bench.source,
      deadliftSource: deadlift.source,
    },
    competition,
  };
}

export async function getPowerliftingMode(input: {
  userId: string;
}): Promise<
  | { ok: true; mode: PowerliftingModePayload }
  | { ok: false; error: string }
> {
  if (!featureFlags.powerliftingMode) {
    return { ok: false, error: "Powerlifting Mode is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const signals = await gatherSignals(profile.id, new Date());
  return { ok: true, mode: assemblePowerliftingMode(signals) };
}
