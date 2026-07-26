/**
 * Referral-ready URL builders for technique share cards.
 */

export type ReferralDestination = "signup" | "technique";

/**
 * Build a path (no origin) that carries referral + campaign UTMs.
 * Safe to append to any site origin.
 */
export function buildTechniqueReferralPath(input: {
  referralCode: string;
  destination?: ReferralDestination;
}): string {
  const dest = input.destination ?? "signup";
  const base = dest === "technique" ? "/app/technique" : "/signup";
  const params = new URLSearchParams({
    ref: input.referralCode,
    utm_source: "technique_card",
    utm_medium: "share",
    utm_campaign: "analyze_your_lift",
  });
  return `${base}?${params.toString()}`;
}

export function buildTechniqueReferralUrl(input: {
  origin: string;
  referralCode: string;
  destination?: ReferralDestination;
}): string {
  const origin = input.origin.replace(/\/$/, "");
  return `${origin}${buildTechniqueReferralPath({
    referralCode: input.referralCode,
    destination: input.destination,
  })}`;
}

/** Validate short referral codes we generate. */
export function isValidReferralCode(code: string): boolean {
  return /^[a-zA-Z0-9]{6,16}$/.test(code);
}
