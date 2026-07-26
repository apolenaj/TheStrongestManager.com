/**
 * Timezone system service (Prompt 150).
 */

import {
  buildTimezoneSystemSnapshot,
  normalizeTimezone,
  type TimezoneSystemSnapshot,
} from "@/domain/timezone-system";
import { prisma } from "@/lib/db";

export async function getAthleteTimezone(userId: string): Promise<string> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { timezone: true },
  });
  return normalizeTimezone(profile?.timezone);
}

export async function updateAthleteTimezone(
  userId: string,
  timezoneRaw: string,
): Promise<{ ok: true; timezone: string } | { ok: false; error: string }> {
  const timezone = normalizeTimezone(timezoneRaw);
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!profile) return { ok: false, error: "Athlete profile required." };
  await prisma.athleteProfile.update({
    where: { id: profile.id },
    data: { timezone },
  });
  return { ok: true, timezone };
}

export function getTimezoneSystemSnapshot(): TimezoneSystemSnapshot {
  return buildTimezoneSystemSnapshot();
}
