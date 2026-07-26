import { FORBIDDEN_LOG_PROP_KEYS } from "@/domain/observability/constants";

const FORBIDDEN = new Set(
  FORBIDDEN_LOG_PROP_KEYS.map((k) => k.toLowerCase()),
);

export function isForbiddenLogProp(key: string): boolean {
  return FORBIDDEN.has(key.toLowerCase());
}

/**
 * Strip forbidden keys. Never rejects the whole record — drops bad keys.
 * Safe for production logs.
 */
export function sanitizeLogProps(
  props: Record<string, unknown> | null | undefined,
): Record<string, unknown> {
  if (props == null) return {};
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (isForbiddenLogProp(key)) continue;
    if (value == null) {
      out[key] = value;
      continue;
    }
    const t = typeof value;
    if (t === "string" || t === "number" || t === "boolean") {
      // Cap string length to avoid accidental dumps.
      out[key] =
        t === "string" && (value as string).length > 200
          ? `${(value as string).slice(0, 200)}…`
          : value;
      continue;
    }
    // Nested objects / arrays are not logged — too easy to leak.
  }
  return out;
}

/** Truncate error messages for logs — no stacks. */
export function safeErrorCode(error: unknown): string {
  if (error instanceof Error) {
    const msg = error.name || "Error";
    return msg.slice(0, 80);
  }
  return "unknown_error";
}
