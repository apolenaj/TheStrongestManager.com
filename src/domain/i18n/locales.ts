import type { LocaleDefinition, LocaleId } from "@/domain/i18n/types";
import { LOCALE_IDS } from "@/domain/i18n/types";

export const DEFAULT_LOCALE: LocaleId = "en";

/**
 * Locale registry — initial English; future CS / DE / ES / AR.
 */
export const LOCALE_DEFINITIONS: Record<LocaleId, LocaleDefinition> = {
  en: {
    id: "en",
    bcp47: "en-US",
    englishName: "English",
    nativeName: "English",
    status: "active",
    textDirection: "ltr",
  },
  cs: {
    id: "cs",
    bcp47: "cs-CZ",
    englishName: "Czech",
    nativeName: "Čeština",
    status: "planned",
    textDirection: "ltr",
  },
  de: {
    id: "de",
    bcp47: "de-DE",
    englishName: "German",
    nativeName: "Deutsch",
    status: "planned",
    textDirection: "ltr",
  },
  es: {
    id: "es",
    bcp47: "es-ES",
    englishName: "Spanish",
    nativeName: "Español",
    status: "planned",
    textDirection: "ltr",
  },
  ar: {
    id: "ar",
    bcp47: "ar",
    englishName: "Arabic",
    nativeName: "العربية",
    status: "planned",
    textDirection: "rtl",
  },
};

export function isLocaleId(value: string): value is LocaleId {
  return (LOCALE_IDS as readonly string[]).includes(value);
}

export function getLocaleDefinition(locale: LocaleId): LocaleDefinition {
  return LOCALE_DEFINITIONS[locale];
}

export function listLocaleDefinitions(): LocaleDefinition[] {
  return LOCALE_IDS.map((id) => LOCALE_DEFINITIONS[id]);
}

export function listActiveLocales(): LocaleId[] {
  return LOCALE_IDS.filter((id) => LOCALE_DEFINITIONS[id].status === "active");
}

export function listPlannedLocales(): LocaleId[] {
  return LOCALE_IDS.filter((id) => LOCALE_DEFINITIONS[id].status === "planned");
}

/**
 * Resolve a requested locale to a shippable one.
 * Planned locales fall back to English until catalogs are reviewed.
 */
export function resolveActiveLocale(requested: string | null | undefined): LocaleId {
  if (!requested || !isLocaleId(requested)) return DEFAULT_LOCALE;
  const def = LOCALE_DEFINITIONS[requested];
  return def.status === "active" ? requested : DEFAULT_LOCALE;
}
