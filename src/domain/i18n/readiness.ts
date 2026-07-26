import { listCatalogKeys, t } from "@/domain/i18n/catalog";
import {
  DEFAULT_LOCALE,
  listActiveLocales,
  listLocaleDefinitions,
  listPlannedLocales,
} from "@/domain/i18n/locales";
import { EN_MESSAGES } from "@/domain/i18n/messages/en";
import {
  countTerminologyReviewStatus,
  FITNESS_TERMINOLOGY,
} from "@/domain/i18n/terminology";
import {
  I18N_ENGINE_VERSION,
  I18N_HONESTY,
  type I18nArchitectureSnapshot,
  type LocaleId,
  type LocaleReadiness,
} from "@/domain/i18n/types";

function readinessFor(locale: LocaleId): LocaleReadiness {
  const def = listLocaleDefinitions().find((d) => d.id === locale)!;
  const enKeys = Object.keys(EN_MESSAGES);
  const localKeys = new Set(listCatalogKeys(locale));
  const covered =
    locale === DEFAULT_LOCALE
      ? enKeys.length
      : enKeys.filter((k) => localKeys.has(k)).length;
  const coverage =
    enKeys.length === 0 ? 1 : covered / enKeys.length;

  let terminologyReviewed = FITNESS_TERMINOLOGY.length;
  let terminologyPending = 0;
  if (locale !== "en") {
    const status = countTerminologyReviewStatus(locale);
    terminologyReviewed = status.reviewed;
    terminologyPending = status.pending;
  }

  return {
    locale,
    status: def.status,
    messageCoverage: coverage,
    terminologyReviewed,
    terminologyPending,
    textDirection: def.textDirection,
  };
}

export function buildI18nArchitectureSnapshot(
  generatedAt: string = new Date().toISOString(),
): I18nArchitectureSnapshot {
  return {
    engineVersion: I18N_ENGINE_VERSION,
    defaultLocale: DEFAULT_LOCALE,
    activeLocales: listActiveLocales(),
    plannedLocales: listPlannedLocales(),
    englishMessageCount: Object.keys(EN_MESSAGES).length,
    terminologyCount: FITNESS_TERMINOLOGY.length,
    readiness: listLocaleDefinitions().map((d) => readinessFor(d.id)),
    honesty: I18N_HONESTY,
    generatedAt,
  };
}

/** Convenience for server components that need a labeled locale name. */
export function localeDisplayName(locale: LocaleId): string {
  return t(`locale.${locale}`, DEFAULT_LOCALE);
}
