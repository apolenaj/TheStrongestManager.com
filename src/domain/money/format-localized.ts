/**
 * Locale-aware display money formatting.
 *
 * Canonical catalog amounts stay in their settlement currency (GBP pence / USD cents).
 * On `cs`, amounts are converted to CZK for native Czech display only —
 * checkout still charges the Stripe Price currency unless a CZK Price exists.
 */

export type DisplayMoneyLocale = "en" | "cs";

/** Approximate display FX → CZK (major units). Not a live market rate. */
const CZK_PER_MAJOR: Record<string, number> = {
  gbp: 30.4,
  usd: 23,
  eur: 25,
  czk: 1,
};

/** Preferred round Kč list prices for common GBP program SKUs. */
const GBP_MAJOR_TO_CZK: Record<number, number> = {
  49: 1490,
  59: 1790,
  69: 2090,
  199: 5990,
};

/** Preferred round Kč for common USD SaaS monthly/annual majors. */
const USD_MAJOR_TO_CZK: Record<number, number> = {
  19: 449,
  39: 899,
  190: 4490,
  390: 8990,
};

export function resolveMoneyLocale(locale: string | undefined | null): DisplayMoneyLocale {
  return locale === "cs" ? "cs" : "en";
}

function roundMarketingCzk(value: number): number {
  if (value < 100) return Math.round(value);
  return Math.round(value / 10) * 10;
}

function toCzkMajor(amountMinor: number, currency: string): number {
  const cur = currency.toLowerCase();
  const major = amountMinor / 100;

  if (cur === "czk") return Math.round(major);

  if (cur === "gbp") {
    const exact = GBP_MAJOR_TO_CZK[major];
    if (exact != null) return exact;
  }
  if (cur === "usd") {
    const exact = USD_MAJOR_TO_CZK[major];
    if (exact != null) return exact;
  }

  const rate = CZK_PER_MAJOR[cur] ?? CZK_PER_MAJOR.usd;
  return roundMarketingCzk(major * rate);
}

/**
 * Format a minor-unit amount for the active site locale.
 * @example formatLocalizedMoney(4900, "gbp", "en") → "£49"
 * @example formatLocalizedMoney(4900, "gbp", "cs") → "1 490 Kč"
 */
export function formatLocalizedMoney(
  amountMinor: number,
  currency: string = "gbp",
  localeInput: string = "en",
): string {
  const locale = resolveMoneyLocale(localeInput);
  if (amountMinor <= 0) {
    return locale === "cs" ? "Zdarma" : "Free";
  }

  const cur = currency.toLowerCase() || "gbp";

  if (locale === "cs") {
    const czk = toCzkMajor(amountMinor, cur);
    return new Intl.NumberFormat("cs-CZ", {
      style: "currency",
      currency: "CZK",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(czk);
  }

  const intlLocale = cur === "gbp" ? "en-GB" : "en-US";
  return new Intl.NumberFormat(intlLocale, {
    style: "currency",
    currency: cur.toUpperCase(),
    minimumFractionDigits: amountMinor % 100 === 0 ? 0 : 2,
  }).format(amountMinor / 100);
}
