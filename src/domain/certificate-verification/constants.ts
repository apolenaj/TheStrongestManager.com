/**
 * Public Certificate Verification (Prompt 175).
 * Verifies Academy Certificates of Completion by unique code.
 * Never implies accreditation unless an officially accredited program is wired later.
 */

export const CERTIFICATE_VERIFICATION_HONESTY = [
  "This page verifies Performance OS Academy Certificates of Completion by unique ID.",
  "A valid result means the learner completed the listed Academy course in this product — not an accredited professional certification.",
  "We do not claim NASM, CSCS, university credit, or other official credentials unless a real accredited partnership is launched and labeled as such.",
  "Status reflects our issuance record (valid / not found). It is not a government or federation license status.",
] as const;

export type CertificateVerifyStatus = "valid" | "not_found";

export type PublicCertificateRecord = {
  /** Unique verification ID (opaque code). */
  uniqueId: string;
  /** Display name — never email. */
  name: string;
  /** Course title from catalog when available. */
  course: string;
  courseSlug: string;
  /** Certificate display title (Certificate of Completion — …). */
  certificateTitle: string;
  /** Always certificate_of_completion unless a real accredited program is wired later. */
  certificateKind: string;
  /** ISO issued date. */
  issuedAt: string;
  status: "valid";
  /** Explicit human-readable status label. */
  statusLabel: string;
  /** Accreditation claim — always false until an official accredited program ships. */
  isAccredited: false;
  accreditationNote: string;
};

export type CertificateVerifyResult =
  | { found: true; record: PublicCertificateRecord }
  | {
      found: false;
      status: "not_found";
      statusLabel: string;
      uniqueId: string | null;
      isAccredited: false;
      accreditationNote: string;
    };

export const ACCREDITATION_NOTE =
  "Not an accredited professional certification. Certificate of Completion only.";

export function normalizeCertificateCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, "");
}

export function isPlausibleCertificateCode(code: string): boolean {
  // AOC- + hex, or any future opaque codes — keep loose but reject empty / tiny.
  if (code.length < 6 || code.length > 64) return false;
  return /^[A-Z0-9\-]+$/.test(code);
}

export function displayLearnerName(input: {
  userName: string | null | undefined;
  athleteDisplayName: string | null | undefined;
}): string {
  const fromUser = input.userName?.trim();
  if (fromUser) return fromUser;
  const fromAthlete = input.athleteDisplayName?.trim();
  if (fromAthlete) return fromAthlete;
  return "Academy learner";
}

export function getCertificateVerificationSnapshot(): {
  honesty: readonly string[];
  fields: string[];
  accreditationNote: string;
  routes: string[];
} {
  return {
    honesty: CERTIFICATE_VERIFICATION_HONESTY,
    fields: ["uniqueId", "name", "course", "date", "status"],
    accreditationNote: ACCREDITATION_NOTE,
    routes: ["/verify/certificate", "/verify/certificate/[code]"],
  };
}

export function publicVerifyPath(code: string): string {
  return `/verify/certificate/${encodeURIComponent(code)}`;
}
