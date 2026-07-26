/**
 * Gather Strongman Mode signals — event-specific PRs only (sm_* keys).
 * Never maps powerlifting SBD totals into this mode.
 */

import { featureFlags } from "@/config/feature-flags";
import { daysUntil } from "@/domain/competition-mode";
import {
  assembleStrongmanMode,
  parseStrongmanPrMetricKey,
  type StrongmanModePayload,
  type StrongmanModeSignals,
} from "@/domain/strongman-mode";
import { normalizeTimezone } from "@/domain/timezone-system";
import { prisma } from "@/lib/db";

async function gatherSignals(
  athleteProfileId: string,
  now: Date,
): Promise<StrongmanModeSignals> {
  const [profile, metrics, prep] = await Promise.all([
    prisma.athleteProfile.findUnique({
      where: { id: athleteProfileId },
      select: { timezone: true },
    }),
    prisma.progressMetric.findMany({
      where: {
        athleteProfileId,
        metricKey: { startsWith: "sm_" },
      },
      orderBy: { recordedAt: "desc" },
      take: 200,
      select: {
        metricKey: true,
        value: true,
        unit: true,
        reps: true,
        recordedAt: true,
      },
    }),
    prisma.competitionPrep.findFirst({
      where: {
        athleteProfileId,
        status: { in: ["planned", "active"] },
        sport: "strongman",
      },
      orderBy: { competitionDate: "asc" },
      select: { name: true, competitionDate: true },
    }),
  ]);
  const timeZone = normalizeTimezone(profile?.timezone);

  const loggedPrs: StrongmanModeSignals["loggedPrs"] = [];
  for (const row of metrics) {
    const parsed = parseStrongmanPrMetricKey(row.metricKey);
    if (!parsed) continue;

    if (parsed.metric === "reps" && row.reps != null) {
      loggedPrs.push({
        eventId: parsed.eventId,
        metric: "reps",
        value: row.reps,
        unit: "reps",
        recordedAt: row.recordedAt,
      });
      continue;
    }

    loggedPrs.push({
      eventId: parsed.eventId,
      metric: parsed.metric,
      value: row.value,
      unit: row.unit ?? (parsed.metric === "weight" ? "kg" : parsed.metric === "distance" ? "m" : parsed.metric === "time" ? "s" : "reps"),
      recordedAt: row.recordedAt,
    });

    // Also surface reps attached to a weight PR row when present
    if (parsed.metric === "weight" && row.reps != null && row.reps > 0) {
      loggedPrs.push({
        eventId: parsed.eventId,
        metric: "reps",
        value: row.reps,
        unit: "reps",
        recordedAt: row.recordedAt,
      });
    }
  }

  return {
    now,
    loggedPrs,
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

export async function getStrongmanMode(input: {
  userId: string;
}): Promise<
  | { ok: true; mode: StrongmanModePayload }
  | { ok: false; error: string }
> {
  if (!featureFlags.strongmanMode) {
    return { ok: false, error: "Strongman Mode is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: { id: true },
  });
  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const signals = await gatherSignals(profile.id, new Date());
  return { ok: true, mode: assembleStrongmanMode(signals) };
}
