/**
 * Affiliate tracking codes + disclosure gating (Prompt 136).
 */

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Affiliate tracking codes — distinct from personal referral ?ref= codes. */
export function isValidAffiliateTrackingCode(code: string): boolean {
  return /^[a-zA-Z0-9]{6,20}$/.test(code);
}

export function generateAffiliateTrackingCode(length = 10): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length]!;
  }
  return out;
}

/**
 * Public click landing (always shows disclosure before continue).
 * Destination after continue carries ?aff= for signup attribution.
 */
export function buildAffiliateLandingPath(code: string): string {
  return `/a/${encodeURIComponent(code)}`;
}

export function buildAffiliateSignupPath(code: string): string {
  const params = new URLSearchParams({
    aff: code,
    utm_source: "affiliate_system",
    utm_medium: "affiliate",
    utm_campaign: "affiliate_tracking",
  });
  return `/signup?${params.toString()}`;
}

/**
 * Hard gate: never return partnership content for display without disclosure.
 */
export function canDisplayAffiliatePartnerships(input: {
  disclosureVisible: boolean;
}): boolean {
  return input.disclosureVisible === true;
}

/**
 * Filter partners for any public/partner listing UI.
 * Returns [] when disclosure is not visible — fail closed.
 */
export function filterPartnersForDisplay<T>(
  partners: readonly T[],
  input: { disclosureVisible: boolean },
): T[] {
  if (!canDisplayAffiliatePartnerships(input)) return [];
  return [...partners];
}
