/**
 * Gather Multi-Sport Athlete Mode from a single AthleteProfile.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  assembleMultiSportMode,
  type MultiSportModePayload,
} from "@/domain/multi-sport-mode";
import { prisma } from "@/lib/db";

function parsePreferredSports(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export async function getMultiSportMode(input: {
  userId: string;
}): Promise<
  | { ok: true; mode: MultiSportModePayload }
  | { ok: false; error: string }
> {
  if (!featureFlags.multiSportAthleteMode) {
    return { ok: false, error: "Multi-Sport Athlete Mode is not enabled." };
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: input.userId },
    select: {
      id: true,
      primaryDiscipline: true,
      trainingExperience: { select: { preferredSports: true } },
      goals: {
        where: { status: "active" },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        take: 8,
        select: { title: true, category: true, priority: true },
      },
      progressMetrics: {
        orderBy: { recordedAt: "desc" },
        take: 80,
        select: {
          metricKey: true,
          value: true,
          unit: true,
          recordedAt: true,
        },
      },
    },
  });

  if (!profile) {
    return { ok: false, error: "Athlete profile required." };
  }

  const mode = assembleMultiSportMode({
    preferredSports: parsePreferredSports(
      profile.trainingExperience?.preferredSports,
    ),
    primaryDiscipline: profile.primaryDiscipline,
    goals: profile.goals,
    loggedPrs: profile.progressMetrics.map((m) => ({
      metricKey: m.metricKey,
      value: m.value,
      unit: m.unit,
      recordedAt: m.recordedAt,
    })),
  });

  return { ok: true, mode };
}
