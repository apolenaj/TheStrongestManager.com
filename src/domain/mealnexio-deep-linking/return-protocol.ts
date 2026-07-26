import type { NutritionDailySummary } from "@/domain/nutrition";
import type {
  MealnexioReturnAcceptResult,
  MealnexioReturnPayload,
} from "@/domain/mealnexio-deep-linking/types";
import type { MealnexioReturnProtocolStatus } from "@/domain/mealnexio-deep-linking/constants";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseSummary(raw: unknown): NutritionDailySummary | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.date !== "string" || !raw.date.trim()) return null;
  if (raw.source !== "mealnexio" && raw.source !== "provider") return null;

  const syncedAt =
    raw.syncedAt instanceof Date
      ? raw.syncedAt
      : typeof raw.syncedAt === "string" || typeof raw.syncedAt === "number"
        ? new Date(raw.syncedAt)
        : null;
  if (!syncedAt || Number.isNaN(syncedAt.getTime())) return null;

  const macrosRaw = raw.macros;
  let macros: NutritionDailySummary["macros"] = null;
  if (macrosRaw != null) {
    if (!isRecord(macrosRaw)) return null;
    const proteinG = macrosRaw.proteinG;
    const carbsG = macrosRaw.carbsG;
    const fatG = macrosRaw.fatG;
    if (
      typeof proteinG !== "number" ||
      typeof carbsG !== "number" ||
      typeof fatG !== "number"
    ) {
      return null;
    }
    macros = { proteinG, carbsG, fatG };
  }

  return {
    date: raw.date,
    caloriesKcal:
      raw.caloriesKcal === null || typeof raw.caloriesKcal === "number"
        ? (raw.caloriesKcal as number | null)
        : null,
    macros,
    adherencePct:
      raw.adherencePct === null || typeof raw.adherencePct === "number"
        ? (raw.adherencePct as number | null)
        : null,
    mealTimingNotes:
      raw.mealTimingNotes === null || typeof raw.mealTimingNotes === "string"
        ? (raw.mealTimingNotes as string | null)
        : null,
    trainingDayTagged:
      raw.trainingDayTagged === null ||
      typeof raw.trainingDayTagged === "boolean"
        ? (raw.trainingDayTagged as boolean | null)
        : null,
    source: raw.source,
    syncedAt,
  };
}

/**
 * Accept a Mealnexio return payload only when the return protocol is live.
 * Default status is `not_live` — never invent a summary from query noise.
 */
export function acceptMealnexioReturnPayload(
  raw: unknown,
  options?: {
    protocolStatus?: MealnexioReturnProtocolStatus;
    /** When true and protocol live, require a non-empty signature field. */
    requireSignature?: boolean;
  },
): MealnexioReturnAcceptResult {
  const protocolStatus = options?.protocolStatus ?? "not_live";

  if (protocolStatus !== "ready") {
    return {
      ok: false,
      reason: "protocol_not_live",
      detail:
        "Mealnexio return handshake is not live. No nutrition summary is accepted or invented.",
    };
  }

  if (!isRecord(raw) || raw.version !== "mealnexio_return.v1") {
    return {
      ok: false,
      reason: "invalid_payload",
      detail: "Payload must be mealnexio_return.v1 with a valid summary.",
    };
  }

  if (options?.requireSignature && !String(raw.signature ?? "").trim()) {
    return {
      ok: false,
      reason: "signature_required",
      detail: "Return protocol requires a signature; none was provided.",
    };
  }

  const summary = parseSummary(raw.summary);
  if (!summary) {
    return {
      ok: false,
      reason: "missing_summary",
      detail:
        "Summary missing or invalid — calories/macros are never invented here.",
    };
  }

  const payload = raw as MealnexioReturnPayload;
  return {
    ok: true,
    summary,
    ref: typeof payload.ref === "string" ? payload.ref : null,
  };
}
