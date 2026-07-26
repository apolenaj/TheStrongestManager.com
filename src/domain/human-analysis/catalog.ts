/**
 * Expert Technique Review product catalog.
 * Display prices only from env — never hard-code dollars in UI.
 */

import { formatMoneyCents } from "@/domain/billing/catalog";
import type { HumanAnalysisProductSku } from "@/domain/human-analysis/constants";

export type HumanAnalysisProductDefinition = {
  sku: HumanAnalysisProductSku;
  name: string;
  tagline: string;
  /** What the athlete uploads / attaches. */
  uploadRequirements: string[];
  /** What the expert delivers. */
  deliverables: string[];
  /** Self-serve only when amountCents + stripePriceId published. */
  purchasable: boolean;
  amountCents: number | null;
  currency: "usd";
  stripePriceId: string | null;
  /** Honest note when not purchasable yet. */
  availabilityNote: string | null;
  formattedPrice: string | null;
};

function envCentsOptional(key: string): number | null {
  const raw = process.env[key];
  if (raw == null || raw.trim() === "") return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

function envPriceId(key: string): string | null {
  const raw = process.env[key]?.trim();
  return raw ? raw : null;
}

function publishedPrice(input: {
  centsKey: string;
  stripeKey: string;
}): {
  amountCents: number | null;
  stripePriceId: string | null;
  purchasable: boolean;
  formattedPrice: string | null;
  availabilityNote: string | null;
} {
  const amountCents = envCentsOptional(input.centsKey);
  const stripePriceId = envPriceId(input.stripeKey);
  if (amountCents == null) {
    return {
      amountCents: null,
      stripePriceId,
      purchasable: false,
      formattedPrice: null,
      availabilityNote: "Price not published yet.",
    };
  }
  const formattedPrice = formatMoneyCents(amountCents, "usd");
  if (!stripePriceId) {
    return {
      amountCents,
      stripePriceId: null,
      purchasable: false,
      formattedPrice,
      availabilityNote:
        "List price published; Stripe price id not configured — checkout unavailable.",
    };
  }
  return {
    amountCents,
    stripePriceId,
    purchasable: true,
    formattedPrice,
    availabilityNote: null,
  };
}

export function getHumanAnalysisCatalog(): HumanAnalysisProductDefinition[] {
  const single = publishedPrice({
    centsKey: "PRICING_HUMAN_SINGLE_LIFT_CENTS",
    stripeKey: "STRIPE_PRICE_HUMAN_SINGLE_LIFT",
  });
  const training = publishedPrice({
    centsKey: "PRICING_HUMAN_TRAINING_REVIEW_CENTS",
    stripeKey: "STRIPE_PRICE_HUMAN_TRAINING_REVIEW",
  });
  const competition = publishedPrice({
    centsKey: "PRICING_HUMAN_COMP_PREP_CENTS",
    stripeKey: "STRIPE_PRICE_HUMAN_COMP_PREP",
  });

  return [
    {
      sku: "single_lift_review",
      name: "Single lift review",
      tagline: "One lift video reviewed by a verified expert.",
      uploadRequirements: [
        "One technique video (or attach an existing analysis)",
        "Camera angle and optional load / reps",
      ],
      deliverables: [
        "Expert written lift report",
        "Confirm / correct / comment on AI findings when attached",
        "Priority cues for the next session",
      ],
      purchasable: single.purchasable,
      amountCents: single.amountCents,
      currency: "usd",
      stripePriceId: single.stripePriceId,
      availabilityNote: single.availabilityNote,
      formattedPrice: single.formattedPrice,
    },
    {
      sku: "full_training_review",
      name: "Full training review",
      tagline: "Program block or recent training reviewed end-to-end.",
      uploadRequirements: [
        "Active program or training audit export",
        "Optional key lift videos",
      ],
      deliverables: [
        "Expert training review report",
        "Volume / intensity / weak-point commentary",
        "Suggested next-block priorities (not auto-applied)",
      ],
      purchasable: training.purchasable,
      amountCents: training.amountCents,
      currency: "usd",
      stripePriceId: training.stripePriceId,
      availabilityNote: training.availabilityNote,
      formattedPrice: training.formattedPrice,
    },
    {
      sku: "competition_prep_review",
      name: "Competition preparation review",
      tagline: "Meet-prep package reviewed by a verified expert.",
      uploadRequirements: [
        "Competition prep profile (meet date / attempts intent)",
        "Recent competition lifts or technique videos",
      ],
      deliverables: [
        "Expert competition prep report",
        "Attempt / taper commentary (never guarantees makes)",
        "Risk notes — no dehydration or unsafe cut prescriptions",
      ],
      purchasable: competition.purchasable,
      amountCents: competition.amountCents,
      currency: "usd",
      stripePriceId: competition.stripePriceId,
      availabilityNote: competition.availabilityNote,
      formattedPrice: competition.formattedPrice,
    },
  ];
}

export function getHumanAnalysisProduct(
  sku: HumanAnalysisProductSku,
): HumanAnalysisProductDefinition | undefined {
  return getHumanAnalysisCatalog().find((p) => p.sku === sku);
}
