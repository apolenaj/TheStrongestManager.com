/**
 * Internationalization architecture (Prompt 148).
 * English ships today; Czech / German / Spanish / Arabic are planned shells.
 * Technical fitness terminology must not auto-translate without review.
 */

export const I18N_ENGINE_VERSION = "i18n.v1" as const;

/** Supported + planned locale ids (stable keys). */
export const LOCALE_IDS = ["en", "cs", "de", "es", "ar"] as const;
export type LocaleId = (typeof LOCALE_IDS)[number];

export type LocaleStatus = "active" | "planned";

export type TextDirection = "ltr" | "rtl";

export type LocaleDefinition = {
  id: LocaleId;
  /** BCP 47 tag for Intl / HTML lang. */
  bcp47: string;
  englishName: string;
  nativeName: string;
  status: LocaleStatus;
  textDirection: TextDirection;
};

/** Dot-separated message key — never hard-code UI copy in components. */
export type MessageKey = string;

export type MessageParams = Record<string, string | number>;

/** Flat catalog: key → template string (`Hello, {name}`). */
export type MessageCatalog = Readonly<Record<MessageKey, string>>;

export type TerminologyCategory =
  | "metric"
  | "lift"
  | "method"
  | "equipment"
  | "coaching";

/**
 * Fitness / coaching term that stays in the source form until a human
 * reviews a locale-specific rendering. No machine auto-fill.
 */
export type TerminologyEntry = {
  id: MessageKey;
  canonicalEn: string;
  category: TerminologyCategory;
  requiresHumanReview: true;
  /** Only reviewed strings may appear for planned locales. */
  reviewedTranslations: Partial<Record<Exclude<LocaleId, "en">, string>>;
};

export type LocaleReadiness = {
  locale: LocaleId;
  status: LocaleStatus;
  messageCoverage: number;
  terminologyReviewed: number;
  terminologyPending: number;
  textDirection: TextDirection;
};

export type I18nArchitectureSnapshot = {
  engineVersion: typeof I18N_ENGINE_VERSION;
  defaultLocale: LocaleId;
  activeLocales: LocaleId[];
  plannedLocales: LocaleId[];
  englishMessageCount: number;
  terminologyCount: number;
  readiness: LocaleReadiness[];
  honesty: readonly string[];
  generatedAt: string;
};

export const I18N_HONESTY = [
  "English is the only active locale today — Czech, German, Spanish, and Arabic are architecture shells, not shipped catalogs.",
  "User-facing copy belongs in message catalogs keyed by id — components must not hard-code strings once they adopt i18n.",
  "Technical fitness terminology (RPE, RIR, 1RM, lift names, method labels) must not auto-translate; human review is required.",
  "Arabic is marked RTL in locale metadata; layout mirroring is not fully productized yet.",
] as const;
