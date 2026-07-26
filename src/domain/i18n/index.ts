export type {
  LocaleId,
  LocaleStatus,
  TextDirection,
  LocaleDefinition,
  MessageKey,
  MessageParams,
  MessageCatalog,
  TerminologyCategory,
  TerminologyEntry,
  LocaleReadiness,
  I18nArchitectureSnapshot,
} from "@/domain/i18n/types";
export {
  I18N_ENGINE_VERSION,
  I18N_HONESTY,
  LOCALE_IDS,
} from "@/domain/i18n/types";

export {
  DEFAULT_LOCALE,
  LOCALE_DEFINITIONS,
  isLocaleId,
  getLocaleDefinition,
  listLocaleDefinitions,
  listActiveLocales,
  listPlannedLocales,
  resolveActiveLocale,
} from "@/domain/i18n/locales";

export {
  FITNESS_TERMINOLOGY,
  getTerminologyEntry,
  isTerminologyKey,
  resolveTerminology,
  countTerminologyReviewStatus,
} from "@/domain/i18n/terminology";

export { EN_MESSAGES } from "@/domain/i18n/messages/en";
export type { EnMessageKey } from "@/domain/i18n/messages/en";
export { MESSAGE_CATALOGS, getMessageCatalog } from "@/domain/i18n/messages";

export {
  interpolateMessage,
  t,
  hasMessage,
  listCatalogKeys,
} from "@/domain/i18n/catalog";

export {
  buildI18nArchitectureSnapshot,
  localeDisplayName,
} from "@/domain/i18n/readiness";
