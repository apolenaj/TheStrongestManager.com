/**
 * Explicit licensing / permission records for rare cases where otherwise
 * prohibited wording or a licensed asset is intentionally allowed.
 * Empty by default — add a record only with documented permission.
 *
 * Historical diet/routine sections use a field-scoped wording exception in
 * `prohibited-wording.ts` (editorial policy for labelled historical documentation).
 */

export type LegendaryLicensingRecord = {
  id: string;
  /** What the permission covers (e.g. phrase exception or asset use). */
  subject: string;
  /** Profile slug(s) covered, or "*" for site-wide. */
  scope: string;
  permissionType: "wording-exception" | "asset-licence" | "endorsement";
  grantedBy: string;
  documentedAt: string;
  notes: string;
};

/** Only entries with documented permission belong here. */
export const LEGENDARY_LICENSING_RECORDS: readonly LegendaryLicensingRecord[] =
  [] as const;

export function hasLegendaryLicensingException(
  subject: string,
  scope = "*",
): boolean {
  const needle = subject.toLowerCase();
  return LEGENDARY_LICENSING_RECORDS.some((record) => {
    if (record.scope !== "*" && record.scope !== scope) return false;
    return (
      record.subject.toLowerCase() === needle ||
      needle.includes(record.subject.toLowerCase())
    );
  });
}
