"use server";

import { revalidatePath } from "next/cache";
import {
  isProgramMarketplaceDifficulty,
  isProgramMarketplaceDurationWeeks,
  isProgramMarketplaceEquipment,
  isProgramMarketplaceGoal,
  isProgramMarketplaceSport,
  PROGRAM_MARKETPLACE_EQUIPMENT,
} from "@/domain/program-marketplace";
import { requireSession } from "@/services/auth/session";
import {
  rateProgramMarketplaceListing,
  recordProgramMarketplacePurchase,
  reviewProgramMarketplaceListing,
  submitProgramMarketplaceListing,
} from "@/services/program-marketplace/program-marketplace-service";

export type ProgramMarketplaceActionState = {
  ok: boolean;
  error?: string;
  message?: string;
};

export async function submitProgramListingAction(
  _prev: ProgramMarketplaceActionState,
  formData: FormData,
): Promise<ProgramMarketplaceActionState> {
  const session = await requireSession();
  const equipment: string[] = [];
  for (const eq of PROGRAM_MARKETPLACE_EQUIPMENT) {
    if (
      formData.get(`eq_${eq}`) === "on" ||
      formData.get(`eq_${eq}`) === "true"
    ) {
      equipment.push(eq);
    }
  }

  const durationWeeks = Number(formData.get("durationWeeks"));
  const priceCents = Math.round(Number(formData.get("priceDollars") ?? 0) * 100);
  const sport = String(formData.get("sport") ?? "");
  const goal = String(formData.get("goal") ?? "");
  const difficulty = String(formData.get("difficulty") ?? "");

  if (!isProgramMarketplaceSport(sport)) {
    return { ok: false, error: "Choose a valid sport." };
  }
  if (!isProgramMarketplaceGoal(goal)) {
    return { ok: false, error: "Choose a valid goal." };
  }
  if (!isProgramMarketplaceDifficulty(difficulty)) {
    return { ok: false, error: "Choose a valid difficulty." };
  }
  if (!isProgramMarketplaceDurationWeeks(durationWeeks)) {
    return { ok: false, error: "Choose a valid duration." };
  }

  const result = await submitProgramMarketplaceListing({
    userId: session.user.id,
    title: String(formData.get("title") ?? ""),
    preview: String(formData.get("preview") ?? ""),
    sport,
    goal,
    durationWeeks,
    difficulty,
    equipment: equipment.filter(isProgramMarketplaceEquipment),
    priceCents: Number.isFinite(priceCents) ? priceCents : 0,
    copyrightAttested:
      formData.get("copyrightAttested") === "on" ||
      formData.get("copyrightAttested") === "true",
  });

  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/program-marketplace");
  revalidatePath("/programs/marketplace");
  return { ok: true, message: result.message };
}

export async function reviewProgramListingAction(
  formData: FormData,
): Promise<void> {
  const session = await requireSession();
  const listingId = String(formData.get("listingId") ?? "");
  const toStatus = String(formData.get("toStatus") ?? "");
  if (
    toStatus !== "published" &&
    toStatus !== "rejected" &&
    toStatus !== "suspended"
  ) {
    return;
  }
  await reviewProgramMarketplaceListing({
    listingId,
    actorUserId: session.user.id,
    toStatus,
  });
  revalidatePath("/app/program-marketplace/review");
  revalidatePath("/programs/marketplace");
}

export async function purchaseProgramListingAction(
  formData: FormData,
): Promise<ProgramMarketplaceActionState> {
  const session = await requireSession();
  const listingId = String(formData.get("listingId") ?? "");
  const result = await recordProgramMarketplacePurchase({
    listingId,
    buyerUserId: session.user.id,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/programs/marketplace/${listingId}`);
  return {
    ok: true,
    message:
      "Purchase recorded (architecture stub). You can now leave a rating. Checkout payouts are not live.",
  };
}

export async function rateProgramListingAction(
  _prev: ProgramMarketplaceActionState,
  formData: FormData,
): Promise<ProgramMarketplaceActionState> {
  const session = await requireSession();
  const listingId = String(formData.get("listingId") ?? "");
  const stars = Number(formData.get("stars"));
  const result = await rateProgramMarketplaceListing({
    listingId,
    buyerUserId: session.user.id,
    stars,
    comment: String(formData.get("comment") ?? "") || null,
  });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath(`/programs/marketplace/${listingId}`);
  return { ok: true, message: "Rating saved. Thanks for the verified review." };
}
