"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  appendBodyMetric,
  appendPersonalRecord,
  updateEquipment,
  updateGoal,
  updateRecoveryHabits,
  updateSportFocus,
  updateTrainingAge,
  updateTrainingPreferences,
  updateUnitPreference,
  updateTimezonePreference,
} from "@/services/athlete-profile/profile-service";
import {
  EQUIPMENT_OPTIONS,
  EXPERIENCE_LEVELS,
  MAJOR_LIFTS,
  PRIMARY_GOALS,
  SPORTS,
  type EquipmentId,
  type ExperienceLevelId,
  type MajorLiftId,
  type SportId,
} from "@/services/onboarding/options";
import { normalizeMassUnit } from "@/services/units/convert";
import { isValidTimeZone, normalizeTimezone } from "@/domain/timezone-system";

export type ProfileActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

function revalidateProfile() {
  revalidatePath("/app/profile");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/multi-sport");
}

export async function updateUnitsAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  const units = normalizeMassUnit(String(formData.get("units") ?? "kg"));
  await updateUnitPreference(session.user.id, { units });
  revalidateProfile();
  return { ok: true, message: `Units set to ${units}.` };
}

export async function updateTimezoneAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  const raw = String(formData.get("timezone") ?? "").trim();
  if (raw && !isValidTimeZone(raw)) {
    return { ok: false, error: "Choose a valid IANA timezone." };
  }
  const timezone = await updateTimezonePreference(session.user.id, raw);
  revalidateProfile();
  revalidatePath("/app/competition");
  revalidatePath("/app/notifications");
  revalidatePath("/app/messages");
  revalidatePath("/app/today");
  return {
    ok: true,
    message: `Timezone set to ${normalizeTimezone(timezone)}. Dates display in local time; storage stays UTC.`,
  };
}

export async function updateGoalAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  const goalId = String(formData.get("goalId") ?? "");
  const goal = PRIMARY_GOALS.find((item) => item.id === goalId);
  if (!goal) {
    return { ok: false, error: "Select a valid goal." };
  }
  await updateGoal(session.user.id, {
    title: goal.label,
    category: goal.category,
  });
  // Keep sport focus aligned when goal implies a discipline and sports empty — deterministic, not AI.
  revalidateProfile();
  return { ok: true, message: "Goal updated." };
}

export async function updateSportFocusAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  const primaryDiscipline = String(formData.get("primaryDiscipline") ?? "").trim();
  const sports = formData
    .getAll("sports")
    .map(String)
    .filter((id): id is SportId =>
      SPORTS.some((sport) => sport.id === id),
    );

  if (!primaryDiscipline) {
    return { ok: false, error: "Choose a primary sport focus." };
  }

  await updateSportFocus(session.user.id, { primaryDiscipline, sports });
  revalidateProfile();
  return {
    ok: true,
    message:
      sports.length >= 2
        ? "Multi-sport focuses updated — one profile, PRs stay separated by sport."
        : "Sport focus updated.",
  };
}

export async function updateTrainingAgeAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  const levelRaw = String(formData.get("level") ?? "");
  const level = EXPERIENCE_LEVELS.some((item) => item.id === levelRaw)
    ? (levelRaw as ExperienceLevelId)
    : null;
  const yearsRaw = String(formData.get("yearsTraining") ?? "").trim();
  const yearsTraining = yearsRaw ? Number(yearsRaw) : null;
  if (yearsRaw && (!Number.isFinite(yearsTraining) || (yearsTraining ?? 0) < 0)) {
    return { ok: false, error: "Enter a valid training age in years." };
  }

  await updateTrainingAge(session.user.id, {
    level,
    yearsTraining,
  });
  revalidateProfile();
  return { ok: true, message: "Training age updated." };
}

export async function updatePreferencesAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  const daysRaw = String(formData.get("daysPerWeek") ?? "").trim();
  const sessionRaw = String(formData.get("sessionLengthMinutes") ?? "").trim();
  const coachingStatus = String(formData.get("coachingStatus") ?? "").trim() || null;
  const recentHistory = String(formData.get("recentHistory") ?? "").trim() || null;

  const daysPerWeek = daysRaw ? Number(daysRaw) : null;
  const sessionLengthMinutes = sessionRaw ? Number(sessionRaw) : null;

  if (daysRaw && (!Number.isInteger(daysPerWeek) || (daysPerWeek ?? 0) < 1 || (daysPerWeek ?? 0) > 7)) {
    return { ok: false, error: "Days per week must be between 1 and 7." };
  }
  if (
    sessionRaw &&
    (!Number.isFinite(sessionLengthMinutes) || (sessionLengthMinutes ?? 0) <= 0)
  ) {
    return { ok: false, error: "Enter a valid session length in minutes." };
  }

  await updateTrainingPreferences(session.user.id, {
    daysPerWeek,
    sessionLengthMinutes,
    coachingStatus,
    recentHistory,
  });
  revalidateProfile();
  return { ok: true, message: "Training preferences updated." };
}

export async function updateEquipmentAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  const equipment = formData
    .getAll("equipment")
    .map(String)
    .filter((id): id is EquipmentId =>
      EQUIPMENT_OPTIONS.some((item) => item.id === id),
    );

  await updateEquipment(session.user.id, { equipment });
  revalidateProfile();
  return { ok: true, message: "Equipment updated." };
}

export async function updateRecoveryAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  await updateRecoveryHabits(session.user.id, {
    recoveryHabits: String(formData.get("recoveryHabits") ?? "").trim() || null,
    movementNotes: String(formData.get("movementNotes") ?? "").trim() || null,
  });
  revalidateProfile();
  return { ok: true, message: "Recovery habits updated." };
}

export async function appendBodyMetricAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  const metricKey = String(formData.get("metricKey") ?? "");
  if (metricKey !== "bodyweight" && metricKey !== "height") {
    return { ok: false, error: "Unknown metric." };
  }
  const result = await appendBodyMetric(session.user.id, {
    metricKey,
    rawValue: String(formData.get("value") ?? ""),
  });
  if (!result.ok) return result;
  revalidateProfile();
  return {
    ok: true,
    message: "Measurement saved as a new historical entry (previous values kept).",
  };
}

export async function appendPersonalRecordAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const session = await requireSession();
  const liftId = String(formData.get("liftId") ?? "");
  if (!MAJOR_LIFTS.some((lift) => lift.id === liftId)) {
    return { ok: false, error: "Unknown lift." };
  }
  const repsRaw = String(formData.get("reps") ?? "").trim();
  const reps = repsRaw === "" ? null : Number(repsRaw);
  const result = await appendPersonalRecord(session.user.id, {
    liftId: liftId as MajorLiftId,
    rawValue: String(formData.get("value") ?? ""),
    reps: reps == null || Number.isNaN(reps) ? null : reps,
  });
  if (!result.ok) return result;
  revalidateProfile();
  return {
    ok: true,
    message: result.isNewBest
      ? "New personal record logged. Previous PRs remain in history. Multi-rep sets produce Estimated 1RM only — never shown as verified PRs."
      : "Lift logged. Previous PRs remain in history.",
  };
}
