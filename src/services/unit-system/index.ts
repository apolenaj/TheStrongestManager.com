/**
 * Unit system service (Prompt 149).
 */

import {
  buildUnitSystemSnapshot,
  resolveUnitPreference,
  type UnitPreference,
  type UnitSystemSnapshot,
} from "@/domain/unit-system";
import { prisma } from "@/lib/db";

export async function getAthleteUnitPreference(
  userId: string,
): Promise<UnitPreference> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { units: true },
  });
  return resolveUnitPreference(profile?.units);
}

export function getUnitSystemSnapshot(): UnitSystemSnapshot {
  return buildUnitSystemSnapshot();
}
