"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { upsertCompetitionPrep } from "@/services/competition-mode";
import type { CompetitionSport } from "@/domain/competition-mode";
import { localDateInputToUtc } from "@/domain/timezone-system";
import { getAthleteTimezone } from "@/services/timezone-system";

export type CompetitionActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

function parseOptionalKg(raw: FormDataEntryValue | null): number | null {
  if (raw == null || String(raw).trim() === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export async function saveCompetitionPrepAction(
  _prev: CompetitionActionState,
  formData: FormData,
): Promise<CompetitionActionState> {
  const session = await requireSession();

  const sportRaw = String(formData.get("sport") ?? "");
  if (
    sportRaw !== "powerlifting" &&
    sportRaw !== "deadlift_only" &&
    sportRaw !== "strongman"
  ) {
    return { ok: false, error: "Choose powerlifting, deadlift-only, or strongman." };
  }
  const sport: CompetitionSport = sportRaw;

  const dateRaw = String(formData.get("competitionDate") ?? "");
  const timeZone = await getAthleteTimezone(session.user.id);
  const competitionDate =
    localDateInputToUtc(dateRaw, timeZone, "noon") ??
    new Date(`${dateRaw}T12:00:00.000Z`);
  if (!dateRaw || Number.isNaN(competitionDate.getTime())) {
    return { ok: false, error: "Enter a valid competition date." };
  }

  const result = await upsertCompetitionPrep(session.user.id, {
    sport,
    name: String(formData.get("name") ?? "") || null,
    competitionDate,
    weightClassLabel: String(formData.get("weightClassLabel") ?? "") || null,
    weightClassLimitKg: parseOptionalKg(formData.get("weightClassLimitKg")),
    targets: {
      squatKg: parseOptionalKg(formData.get("squatKg")),
      benchKg: parseOptionalKg(formData.get("benchKg")),
      deadliftKg: parseOptionalKg(formData.get("deadliftKg")),
      notes: String(formData.get("notes") ?? "") || null,
    },
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/competition");
  return { ok: true, message: "Competition Mode saved." };
}
