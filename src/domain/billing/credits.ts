/**
 * Technique analysis credit constants & packs (Prompt 34).
 */

export const CREDIT_TRANSACTION_KINDS = [
  "grant_monthly",
  "grant_trial",
  "grant_pack",
  "grant_referral",
  "spend_analysis",
  "refund_analysis",
  "expire",
  "adjust",
] as const;

export type CreditTransactionKind = (typeof CREDIT_TRANSACTION_KINDS)[number];

export const CREDIT_RELATED_TECHNIQUE = "technique_analysis" as const;

/** Credits consumed per technique analysis upload (when plan is metered). */
export const TECHNIQUE_ANALYSIS_CREDIT_COST = 1;

export type CreditPackDefinition = {
  id: string;
  name: string;
  credits: number;
  /** List price cents — central catalog only. */
  amountCents: number;
  currency: "usd";
  stripePriceIdEnv: string;
  /** Packs do not expire by default (null). */
  expiresInDays: number | null;
};

/**
 * Optional top-up packs. Checkout stays behind billing provider (same as plans).
 */
export const CREDIT_PACKS: readonly CreditPackDefinition[] = [
  {
    id: "credits_5",
    name: "5 analysis credits",
    credits: 5,
    amountCents: 900,
    currency: "usd",
    stripePriceIdEnv: "STRIPE_PRICE_CREDITS_5",
    expiresInDays: null,
  },
  {
    id: "credits_20",
    name: "20 analysis credits",
    credits: 20,
    amountCents: 2900,
    currency: "usd",
    stripePriceIdEnv: "STRIPE_PRICE_CREDITS_20",
    expiresInDays: null,
  },
] as const;

export function getCreditPackById(
  id: string,
): CreditPackDefinition | undefined {
  return CREDIT_PACKS.find((p) => p.id === id);
}

/** UTC calendar month key YYYY-MM */
export function creditPeriodKey(date = new Date()): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** End of UTC month (exclusive of next month start, used as expiresAt). */
export function endOfUtcMonth(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 1, 0, 0, 0, 0),
  );
}

export const CREDIT_HONESTY = [
  "Technique analysis credits are deducted only after an upload is accepted into storage.",
  "Credits are restored if the upload fails due to a system error — never charged for infrastructure failures.",
  "Monthly allocations may expire at period end; purchased packs do not expire unless configured.",
] as const;
