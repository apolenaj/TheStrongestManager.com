"use server";

import { revalidatePath } from "next/cache";
import {
  getOptionalSession,
  requireSession,
} from "@/services/auth/session";
import {
  closeMarketplaceInquiry,
  createMarketplaceInquiry,
  upsertCoachMarketplaceListing,
} from "@/services/marketplace";
import type { MarketplaceAvailabilityStatus } from "@/domain/marketplace";

export type MarketplaceActionState = {
  ok: boolean;
  error?: string;
  message?: string;
  slug?: string;
};

export async function requestConsultationAction(
  _prev: MarketplaceActionState,
  formData: FormData,
): Promise<MarketplaceActionState> {
  const session = await getOptionalSession();
  const slug = String(formData.get("slug") ?? "");
  const message = String(formData.get("message") ?? "");

  const result = await createMarketplaceInquiry({
    slug,
    message,
    athleteUserId: session?.user?.id ?? null,
  });
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath(`/coaching/${slug}`);
  revalidatePath("/app/coach/marketplace");
  return {
    ok: true,
    message:
      "Request sent. This is a consultation request only — no payment was processed.",
  };
}

export async function saveCoachListingAction(
  _prev: MarketplaceActionState,
  formData: FormData,
): Promise<MarketplaceActionState> {
  const session = await requireSession();

  const availabilityStatus = String(
    formData.get("availabilityStatus") ?? "closed",
  ) as MarketplaceAvailabilityStatus;
  const status: MarketplaceAvailabilityStatus = [
    "closed",
    "limited",
    "open",
  ].includes(availabilityStatus)
    ? availabilityStatus
    : "closed";

  const amountRaw = String(formData.get("pricingAmount") ?? "").trim();
  const amountNum = amountRaw ? Number(amountRaw) : null;

  const result = await upsertCoachMarketplaceListing(session.user.id, {
    displayName: String(formData.get("displayName") ?? ""),
    slug: String(formData.get("slug") ?? "") || null,
    bio: String(formData.get("bio") ?? "") || null,
    specializations: String(formData.get("specializations") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    languages: String(formData.get("languages") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    experienceSummary: String(formData.get("experienceSummary") ?? "") || null,
    goalTags: String(formData.get("goalTags") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    experienceLevels: String(formData.get("experienceLevels") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    coachingStyles: String(formData.get("coachingStyles") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    timezone: String(formData.get("timezone") ?? "") || null,
    locationLabel: String(formData.get("locationLabel") ?? "") || null,
    sponsoredPlacement: false,
    availabilityStatus: status,
    availabilityNotes: String(formData.get("availabilityNotes") ?? "") || null,
    pricing: {
      label: String(formData.get("pricingLabel") ?? "").trim() || undefined,
      currency: String(formData.get("pricingCurrency") ?? "USD").trim() || "USD",
      billingPeriod:
        String(formData.get("pricingPeriod") ?? "session").trim() || "session",
      amountCents:
        amountNum != null && Number.isFinite(amountNum)
          ? Math.round(amountNum * 100)
          : null,
      notes: "Displayed for information — payments not processed in MVP.",
    },
    publish: formData.get("publish") === "on",
  });

  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/coach/marketplace");
  revalidatePath("/coaching");
  revalidatePath(`/coaching/${result.slug}`);
  return {
    ok: true,
    message: "Marketplace listing saved.",
    slug: result.slug,
  };
}

export async function closeInquiryAction(
  _prev: MarketplaceActionState,
  formData: FormData,
): Promise<MarketplaceActionState> {
  const session = await requireSession();
  const result = await closeMarketplaceInquiry(
    session.user.id,
    String(formData.get("inquiryId") ?? ""),
  );
  if (!result.ok) return { ok: false, error: result.error };

  revalidatePath("/app/coach/marketplace");
  return { ok: true, message: "Inquiry closed." };
}
