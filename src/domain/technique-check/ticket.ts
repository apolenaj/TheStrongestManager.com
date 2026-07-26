/**
 * Guest claim ticket payload (Prompt 169).
 * Signed in the service layer — domain only defines shape + validation rules.
 */

export type TechniqueCheckTicketPayload = {
  /** Opaque ticket id. */
  tid: string;
  /** Unix seconds expiry. */
  exp: number;
  /** Scope — only free technique check. */
  scope: "technique_check";
};

export function isTechniqueCheckTicketPayload(
  value: unknown,
): value is TechniqueCheckTicketPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.tid === "string" &&
    v.tid.length >= 8 &&
    typeof v.exp === "number" &&
    v.scope === "technique_check"
  );
}
