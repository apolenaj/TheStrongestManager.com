"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { startFreeProgramOnboarding } from "@/services/program-catalog/start-free-program";
import type { UnitSystem } from "@/types/programs";

export type StartFreeProgramActionState = {
  ok: boolean;
  error?: string;
};

function optionalNumber(raw: FormDataEntryValue | null): number | null {
  if (raw == null) return null;
  const text = String(raw).trim();
  if (!text) return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : Number.NaN;
}

export async function startFreeProgramAction(
  _prev: StartFreeProgramActionState,
  formData: FormData,
): Promise<StartFreeProgramActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    const slug = String(formData.get("productSlug") ?? "").trim();
    const callback = slug
      ? `/programs/start/${encodeURIComponent(slug)}`
      : "/programs/find-my-program";
    redirect(`/login?callbackUrl=${encodeURIComponent(callback)}`);
  }

  const productSlug = String(formData.get("productSlug") ?? "").trim();
  const scheduleVariant = String(formData.get("scheduleVariant") ?? "").trim();
  const unitSystem = String(formData.get("unitSystem") ?? "kg").trim() as UnitSystem;
  const competitionDate = String(formData.get("competitionDate") ?? "").trim();
  const weakestLiftRaw = String(formData.get("weakestLift") ?? "none").trim();
  const weakestLift =
    weakestLiftRaw === "squat" ||
    weakestLiftRaw === "bench" ||
    weakestLiftRaw === "deadlift"
      ? weakestLiftRaw
      : "none";

  if (!productSlug) {
    return { ok: false, error: "Missing program." };
  }
  if (!scheduleVariant) {
    return { ok: false, error: "Choose a schedule preference." };
  }
  if (unitSystem !== "kg" && unitSystem !== "lb") {
    return { ok: false, error: "Choose kg or lb." };
  }

  const squat = optionalNumber(formData.get("squat1rm"));
  const bench = optionalNumber(formData.get("bench1rm"));
  const deadlift = optionalNumber(formData.get("deadlift1rm"));
  if (
    (squat != null && Number.isNaN(squat)) ||
    (bench != null && Number.isNaN(bench)) ||
    (deadlift != null && Number.isNaN(deadlift))
  ) {
    return { ok: false, error: "1RM fields must be valid numbers." };
  }

  const result = await startFreeProgramOnboarding({
    userId: session.user.id,
    productSlug,
    scheduleVariant,
    unitSystem,
    oneRms: { squat, bench, deadlift },
    competitionDate: competitionDate || null,
    weakestLift,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  redirect(
    `/programs/start/complete?id=${encodeURIComponent(result.userProgramId)}`,
  );
}
