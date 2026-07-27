/**
 * Privacy rules for product analytics payloads.
 * Rejects sensitive keys even if a caller tries to smuggle them in.
 */

/** Property keys that must never appear on product analytics events. */
export const FORBIDDEN_ANALYTICS_PROP_KEYS = [
  // Identity / contact
  "email",
  "password",
  "name",
  "fullName",
  "firstName",
  "lastName",
  "phone",
  "address",
  // Free-text notes
  "notes",
  "note",
  "coachNote",
  "sessionNotes",
  "comment",
  "message",
  "body",
  "summary",
  // Raw health / biometrics
  "bodyweight",
  "bodyWeight",
  "weightKg",
  "heightCm",
  "heartRate",
  "hrv",
  "sleepHours",
  "bloodPressure",
  "injury",
  "injuries",
  "medical",
  "diagnosis",
  "health",
  // Private video / pose content
  "video",
  "videoUrl",
  "storageKey",
  "fileBuffer",
  "buffer",
  "landmarks",
  "frames",
  "poseFrames",
  "movementReport",
  "movementReportJson",
  "originalFileName",
  "fileName",
  "mimeType",
] as const;

const FORBIDDEN_SET = new Set<string>(
  FORBIDDEN_ANALYTICS_PROP_KEYS.map((k) => k.toLowerCase()),
);

export type AnalyticsPrivacyResult =
  | { ok: true; props: Record<string, unknown> }
  | { ok: false; error: string; rejectedKeys: string[] };

/**
 * Strip / reject forbidden keys from a props bag.
 * Returns a shallow copy of allowed keys only.
 */
export function sanitizeAnalyticsProps(
  props: Record<string, unknown> | null | undefined,
): AnalyticsPrivacyResult {
  if (props == null) {
    return { ok: true, props: {} };
  }

  const rejectedKeys: string[] = [];
  const clean: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(props)) {
    if (FORBIDDEN_SET.has(key.toLowerCase())) {
      rejectedKeys.push(key);
      continue;
    }
    // Nested objects can hide video/health blobs — only allow primitives + null.
    if (
      value !== null &&
      typeof value === "object" &&
      !Array.isArray(value)
    ) {
      rejectedKeys.push(key);
      continue;
    }
    if (Array.isArray(value)) {
      const allPrimitive = value.every(
        (item) =>
          item === null ||
          typeof item === "string" ||
          typeof item === "number" ||
          typeof item === "boolean",
      );
      if (!allPrimitive) {
        rejectedKeys.push(key);
        continue;
      }
    }
    clean[key] = value;
  }

  if (rejectedKeys.length > 0) {
    return {
      ok: false,
      error: `Forbidden analytics properties: ${rejectedKeys.join(", ")}`,
      rejectedKeys,
    };
  }

  return { ok: true, props: clean };
}

/** Keys allowed across the catalog (documentation / tests). */
export const ALLOWED_ANALYTICS_PROP_KEYS = [
  "method",
  "athleteProfileId",
  "sessionId",
  "resumed",
  "analysisId",
  "exerciseSlug",
  "movementMvp",
  "backendStatus",
  "supportedExercise",
  "checkoutEnabled",
  "planId",
  "interval",
  "fromPlanId",
  "relatedType",
  "verdict",
  "role",
  "applicationId",
  "goal",
  "experienceLevel",
  "budgetBand",
  "fromStage",
  "toStage",
  "referralId",
  "rewardKind",
  "beneficiaryRole",
  "voidReason",
  "codeLength",
  "partnerId",
  "linkId",
  "conversionId",
  "eventType",
  "amountCents",
  "commissionStatus",
  "partnerType",
  "partnershipId",
  "capabilityCount",
  "toStatus",
  "listingId",
  "purchaseId",
  "priceCents",
  "stars",
  "platformCents",
  "commissionBps",
  "sport",
  "difficulty",
  "reportId",
  "target",
  "reason",
  "action",
  "experimentId",
  "armId",
  "surface",
  "outcome",
  "productSlug",
  "productId",
  "userProgramId",
  "orderId",
  "isFree",
] as const;
