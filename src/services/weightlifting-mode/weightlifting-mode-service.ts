/**
 * Gather Weightlifting Mode signals.
 * Technique analysis is never invoked — advanced video flag is pass-through only.
 */

import { featureFlags } from "@/config/feature-flags";
import { daysUntil } from "@/domain/competition-mode";
import {
  WEIGHTLIFTING_LIFT_IDS,
  assembleWeightliftingMode,
  parseWeightliftingPrMetricKey,
  type WeightliftingLiftId,
  type WeightliftingModePayload,
  type WeightliftingModeSignals,
} from "@/domain/weightlifting-mode";
import { normalizeTimezone } from "@/domain/timezone-system";
import { prisma } from "@/lib/db";
import { toCanonicalKg } from "@/services/units/convert";

async function gatherSignals(
  athleteProfileId: string,
  now: Date,
): Promise<WeightliftingModeSignals> {
  const keys = WEIGHTLIFTING_LIFT_IDS.map((id) => `wl_${id}_weight`);

  const [profile, metrics, prep] = await Promise.all([
    prisma.athleteProfile.findUnique({
      where: { id: athleteProfileId },
      select: { timezone: true },
    }),
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId,
        metricKey: { in: keys },
      },
      orderBy: { recordedAt: "desc" },
      take: 100,
      select: {
        metricKey: true,
        value: true,
        unit: true,
        recordedAt: true,
      },
    }),
    prisma.competitionPrep.findFirst({
      where: {
        athleteProfileId,
        status: { in: ["planned", "active"] },
      },
      orderBy: { competitionDate: "asc" },
      select: { name: true, competitionDate: true },
    }),
  ]);
  const timeZone = normalizeTimezone(profile?.timezone);

  const lifts = {} as WeightliftingModeSignals["lifts"];
  const seen = new Set<WeightliftingLiftId>();
  for (const row of metrics) {
    const liftId = parseWeightliftingPrMetricKey(row.metricKey);
    if (!liftId || seen.has(liftId)) continue;
    seen.add(liftId);
    lifts[liftId] = {
      loadKg: toCanonicalKg(row.value, row.unit ?? "kg"),
      recordedAt: row.recordedAt,
    };
  }

  return {
    now,
    lifts,
    advancedVideoAnalysisEnabled:
      featureFlags.weightliftingAdvancedVideoAnalysis,
    competition: prep
      ? {
          hasPrep: true,
          name: prep.name,
          dateIso: prep.competitionDate.toISOString(),
          daysUntil: daysUntil(prep.competitionDate, now, timeZone),
        }
      : {
          hasPrep: false,
          name: null,
          dateIso: null,
          daysUntil: null,
        },
  };
}

export async function getWeightliftingMode(input: {
  userId: string;
}): Promise<
  | { ok: true; mode: WeightliftingModePayload }
  | { ok: false; error: string }
> {
  if (!featureFlags.weightliftingMode) {
    return { ok: false, error: "Weightlifting Mode is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const signals = await gatherSignals(profile.id, new Date());
  return { ok: true, mode: assembleWeightliftingMode(signals) };
}
