import type { AppLocale } from "@/i18n/routing";

/** Readable copy that must exist in both site locales. */
export type LocalizedString = {
  en: string;
  cs: string;
};

/** Authoring helper — omit `cs` to mirror English until a Czech pass lands. */
export function L(en: string, cs?: string): LocalizedString {
  return { en, cs: cs ?? en };
}

export function isLocalizedString(value: unknown): value is LocalizedString {
  return (
    typeof value === "object" &&
    value !== null &&
    "en" in value &&
    "cs" in value &&
    typeof (value as LocalizedString).en === "string" &&
    typeof (value as LocalizedString).cs === "string"
  );
}

/** Accept legacy plain strings during migration and normalize. */
export function ensureL(value: string | LocalizedString): LocalizedString {
  return typeof value === "string" ? L(value) : value;
}

export function pickLocalized(
  value: LocalizedString | string,
  locale: string,
): string {
  if (typeof value === "string") return value;
  return locale === "cs" ? value.cs : value.en;
}

export function localizedTrimmedLength(value: LocalizedString): number {
  return Math.max(value.en.trim().length, value.cs.trim().length);
}

export function resolveLocale(locale: string | undefined | null): AppLocale {
  return locale === "cs" ? "cs" : "en";
}
