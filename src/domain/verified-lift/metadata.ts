/**
 * Claim metadata for verified lifts — video + meet context for review.
 */

export type LiftClaimMetadata = {
  /** ISO date the lift was performed. */
  performedAt?: string;
  bodyweightKg?: number;
  equipment?: string;
  cameraAngle?: string;
  /** Competition path */
  federation?: string;
  meetName?: string;
  meetDate?: string;
  attemptNumber?: number;
  resultStatus?: "good" | "no_lift" | "unknown";
  notes?: string;
};

export function parseLiftClaimMetadata(
  raw: string | null | undefined,
): LiftClaimMetadata {
  if (!raw?.trim()) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: LiftClaimMetadata = {};
    if (typeof parsed.performedAt === "string") {
      out.performedAt = parsed.performedAt;
    }
    if (typeof parsed.bodyweightKg === "number" && Number.isFinite(parsed.bodyweightKg)) {
      out.bodyweightKg = parsed.bodyweightKg;
    }
    if (typeof parsed.equipment === "string") out.equipment = parsed.equipment;
    if (typeof parsed.cameraAngle === "string") {
      out.cameraAngle = parsed.cameraAngle;
    }
    if (typeof parsed.federation === "string") out.federation = parsed.federation;
    if (typeof parsed.meetName === "string") out.meetName = parsed.meetName;
    if (typeof parsed.meetDate === "string") out.meetDate = parsed.meetDate;
    if (
      typeof parsed.attemptNumber === "number" &&
      Number.isFinite(parsed.attemptNumber)
    ) {
      out.attemptNumber = parsed.attemptNumber;
    }
    if (
      parsed.resultStatus === "good" ||
      parsed.resultStatus === "no_lift" ||
      parsed.resultStatus === "unknown"
    ) {
      out.resultStatus = parsed.resultStatus;
    }
    if (typeof parsed.notes === "string") out.notes = parsed.notes;
    return out;
  } catch {
    return {};
  }
}

export function serializeLiftClaimMetadata(meta: LiftClaimMetadata): string {
  return JSON.stringify(meta);
}

export function hasBasicLiftMetadata(meta: LiftClaimMetadata): boolean {
  return Boolean(meta.performedAt?.trim());
}

export function hasCompetitionMetadata(meta: LiftClaimMetadata): boolean {
  return Boolean(
    meta.meetName?.trim() &&
      meta.meetDate?.trim() &&
      (meta.federation?.trim() || meta.meetName.trim().length > 0),
  );
}
