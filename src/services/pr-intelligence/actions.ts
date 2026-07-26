"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/services/auth/session";
import { createPrShare } from "@/services/pr-intelligence";
import type { PrEvent, PrSharePayload } from "@/domain/pr-intelligence";
import type { ShareCardModel } from "@/domain/share-cards";

export type SharePrActionState = {
  ok: boolean;
  error?: string;
  path?: string;
  token?: string;
};

export async function sharePrEventAction(
  event: PrEvent,
  options?: {
    formatId?: string;
    selectedMetrics?: string[];
    card?: ShareCardModel;
  },
): Promise<SharePrActionState> {
  const session = await requireSession();

  let shareCard: PrSharePayload["shareCard"];
  if (options?.card) {
    shareCard = {
      formatId: options.card.formatId,
      eyebrow: options.card.eyebrow,
      cardHeadline: options.card.headline,
      stats: options.card.lines
        .filter((l) => l.kind === "stat")
        .map((l) => ({ label: l.label, value: l.value })),
      brand: options.card.brand,
      includedMetrics: options.card.includedMetrics,
    };
  }

  const result = await createPrShare(session.user.id, event, { shareCard });
  if (!result.ok) return { ok: false, error: result.error };
  revalidatePath("/app/prs");
  return { ok: true, path: result.path, token: result.token };
}
