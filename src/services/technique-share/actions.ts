"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { createTechniqueShare } from "@/services/technique-share";
import type { TechniqueShareCardModel } from "@/domain/technique-share-cards";

export type TechniqueShareActionState = {
  ok: boolean;
  error?: string;
  path?: string;
  token?: string;
  referralCode?: string;
  referralPath?: string;
};

export async function shareTechniqueCardAction(
  analysisId: string,
  card: TechniqueShareCardModel,
): Promise<TechniqueShareActionState> {
  const session = await requireSession();
  const result = await createTechniqueShare(session.user.id, {
    analysisId,
    card,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/app/technique/${analysisId}`);
  return {
    ok: true,
    path: result.path,
    token: result.token,
    referralCode: result.referralCode,
    referralPath: result.referralPath,
  };
}
