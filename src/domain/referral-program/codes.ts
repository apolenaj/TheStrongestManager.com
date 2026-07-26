/**
 * Referral code format + invite path builders (Prompt 135).
 * Compatible with existing ?ref= signup query (6–16 alphanumerics).
 */

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

/** Same shape as technique-share codes so one ?ref= namespace works. */
export function isValidUserReferralCode(code: string): boolean {
  return /^[a-zA-Z0-9]{6,16}$/.test(code);
}

export function generateUserReferralCode(length = 8): string {
  const bytes = new Uint8Array(length);
  globalThis.crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length]!;
  }
  return out;
}

/** Path-only invite URL with program UTMs (not technique_card). */
export function buildReferralInvitePath(code: string): string {
  const params = new URLSearchParams({
    ref: code,
    utm_source: "referral_program",
    utm_medium: "invite",
    utm_campaign: "referral_program",
  });
  return `/signup?${params.toString()}`;
}
