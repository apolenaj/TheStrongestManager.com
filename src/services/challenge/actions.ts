"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import {
  abandonChallenge,
  enrollInChallenge,
  setChallengeLeaderboardOptIn,
} from "@/services/challenge";

export type ChallengeActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function enrollChallengeAction(
  _prev: ChallengeActionState,
  formData: FormData,
): Promise<ChallengeActionState> {
  const session = await requireSession();
  const challengeId = String(formData.get("challengeId") ?? "");
  const leaderboardOptIn = formData.get("leaderboardOptIn") === "on";

  const result = await enrollInChallenge(
    session.user.id,
    challengeId,
    leaderboardOptIn,
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/challenges");
  return { ok: true, message: "Joined challenge." };
}

export async function abandonChallengeAction(
  _prev: ChallengeActionState,
  formData: FormData,
): Promise<ChallengeActionState> {
  const session = await requireSession();
  const result = await abandonChallenge(
    session.user.id,
    String(formData.get("challengeId") ?? ""),
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/challenges");
  return { ok: true, message: "Left challenge." };
}

export async function challengeLeaderboardOptInAction(
  _prev: ChallengeActionState,
  formData: FormData,
): Promise<ChallengeActionState> {
  const session = await requireSession();
  const result = await setChallengeLeaderboardOptIn(
    session.user.id,
    String(formData.get("challengeId") ?? ""),
    formData.get("leaderboardOptIn") === "on",
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/challenges");
  return { ok: true, message: "Leaderboard preference saved." };
}
