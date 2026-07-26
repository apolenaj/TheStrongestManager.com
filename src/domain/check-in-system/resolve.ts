/**
 * Validate coach-configured question sets — allowlist only.
 */

import {
  CHECK_IN_FORBIDDEN_SENSITIVE_TOPICS,
  catalogByKey,
  defaultEnabledQuestionKeys,
  isAllowlistedQuestionKey,
  type CheckInQuestionDef,
} from "@/domain/check-in-system/constants";

/**
 * Filter coach-selected keys to allowlisted catalog only.
 * Drops unknown and never admits forbidden sensitive topics.
 */
export function sanitizeEnabledQuestionKeys(
  raw: readonly string[] | null | undefined,
): string[] {
  if (!raw?.length) return defaultEnabledQuestionKeys();
  const seen = new Set<string>();
  const out: string[] = [];
  for (const key of raw) {
    const k = key.trim();
    if (!k || seen.has(k)) continue;
    if (!isAllowlistedQuestionKey(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out.length > 0 ? out : defaultEnabledQuestionKeys();
}

export function resolveQuestionsForKeys(
  keys: readonly string[],
): CheckInQuestionDef[] {
  const map = catalogByKey();
  return keys
    .map((k) => map.get(k))
    .filter((q): q is CheckInQuestionDef => Boolean(q))
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

/**
 * Guard: proposed custom prompts must not match forbidden sensitive topics.
 * Catalog keys are always safe; this protects free-text coach attempts.
 */
export function containsForbiddenSensitiveHealthAsk(text: string): boolean {
  const lower = text.toLowerCase();
  return CHECK_IN_FORBIDDEN_SENSITIVE_TOPICS.some((topic) =>
    lower.includes(topic.toLowerCase()),
  );
}

export function weekKeyFromDate(d: Date): string {
  // ISO week-ish: YYYY-Www using UTC Monday start
  const date = new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
  const day = date.getUTCDay() || 7;
  if (day !== 1) date.setUTCDate(date.getUTCDate() - (day - 1));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${date.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export function weekStartFromWeekKey(weekKey: string): Date {
  const m = /^(\d{4})-W(\d{2})$/.exec(weekKey);
  if (!m) {
    const now = new Date();
    return new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
  }
  const year = Number(m[1]);
  const week = Number(m[2]);
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const day = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - (day - 1) + (week - 1) * 7);
  return monday;
}
