/**
 * Guest claim ticket payload for Free Program Audit (Prompt 170).
 */

export type ProgramAuditTicketPayload = {
  tid: string;
  exp: number;
  scope: "program_audit";
};

export function isProgramAuditTicketPayload(
  value: unknown,
): value is ProgramAuditTicketPayload {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.tid === "string" &&
    v.tid.length >= 8 &&
    typeof v.exp === "number" &&
    v.scope === "program_audit"
  );
}
