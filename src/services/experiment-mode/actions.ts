"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { prisma } from "@/lib/db";
import {
  abandonPersonalTrainingExperiment,
  completePersonalTrainingExperiment,
  createPersonalTrainingExperiment,
  startPersonalTrainingExperiment,
} from "@/services/experiment-mode";
import { EXPERIMENT_MEASURES } from "@/domain/experiment-mode";

export type ExperimentActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  experimentId?: string;
};

async function profileIdFor(userId: string): Promise<string | null> {
  const profile = await prisma.athleteProfile.findUnique({
    where: { userId },
    select: { id: true },
  });
  return profile?.id ?? null;
}

export async function createExperimentAction(
  _prev: ExperimentActionState,
  formData: FormData,
): Promise<ExperimentActionState> {
  const session = await requireSession();
  const athleteProfileId = await profileIdFor(session.user.id);
  if (!athleteProfileId) {
    return { ok: false, error: "Complete onboarding first." };
  }

  const measures = EXPERIMENT_MEASURES.filter(
    (m) => formData.get(`measure_${m}`) === "on",
  );

  const result = await createPersonalTrainingExperiment({
    athleteProfileId,
    draft: {
      title: String(formData.get("title") ?? ""),
      intervention: String(formData.get("intervention") ?? ""),
      hypothesis: String(formData.get("hypothesis") ?? ""),
      durationWeeks: Number(formData.get("durationWeeks") ?? 0),
      athleteNotes: String(formData.get("athleteNotes") ?? "") || null,
      measures,
    },
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/experiments");
  return {
    ok: true,
    message: "Personal training experiment created.",
    experimentId: result.experiment.id,
  };
}

export async function startExperimentAction(
  _prev: ExperimentActionState,
  formData: FormData,
): Promise<ExperimentActionState> {
  const session = await requireSession();
  const athleteProfileId = await profileIdFor(session.user.id);
  if (!athleteProfileId) return { ok: false, error: "Profile not found." };

  const id = String(formData.get("experimentId") ?? "");
  const result = await startPersonalTrainingExperiment({
    id,
    athleteProfileId,
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/experiments");
  revalidatePath(`/app/experiments/${id}`);
  return { ok: true, message: "Experiment started — baseline captured." };
}

export async function completeExperimentAction(
  _prev: ExperimentActionState,
  formData: FormData,
): Promise<ExperimentActionState> {
  const session = await requireSession();
  const athleteProfileId = await profileIdFor(session.user.id);
  if (!athleteProfileId) return { ok: false, error: "Profile not found." };

  const id = String(formData.get("experimentId") ?? "");
  const result = await completePersonalTrainingExperiment({
    id,
    athleteProfileId,
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/experiments");
  revalidatePath(`/app/experiments/${id}`);
  return {
    ok: true,
    message: "Experiment completed — before/after comparison ready.",
  };
}

export async function abandonExperimentAction(
  _prev: ExperimentActionState,
  formData: FormData,
): Promise<ExperimentActionState> {
  const session = await requireSession();
  const athleteProfileId = await profileIdFor(session.user.id);
  if (!athleteProfileId) return { ok: false, error: "Profile not found." };

  const id = String(formData.get("experimentId") ?? "");
  const result = await abandonPersonalTrainingExperiment({
    id,
    athleteProfileId,
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/experiments");
  revalidatePath(`/app/experiments/${id}`);
  return { ok: true, message: "Experiment abandoned." };
}
