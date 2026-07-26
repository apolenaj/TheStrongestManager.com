import { DEFAULT_LOCALE } from "@/domain/i18n/locales";
import { getMessageCatalog } from "@/domain/i18n/messages";
import {
  isTerminologyKey,
  resolveTerminology,
} from "@/domain/i18n/terminology";
import type { LocaleId, MessageKey, MessageParams } from "@/domain/i18n/types";

const PARAM_RE = /\{(\w+)\}/g;

export function interpolateMessage(
  template: string,
  params?: MessageParams,
): string {
  if (!params) return template;
  return template.replace(PARAM_RE, (match, name: string) => {
    const value = params[name];
    return value === undefined ? match : String(value);
  });
}

/**
 * Resolve a user-facing string for a locale.
 * - Terminology keys: English until a reviewed translation exists.
 * - UI keys: locale catalog → English fallback → key (dev-visible miss).
 * Never invents translations for missing planned-locale entries.
 */
export function t(
  key: MessageKey,
  locale: LocaleId = DEFAULT_LOCALE,
  params?: MessageParams,
): string {
  if (isTerminologyKey(key)) {
    const term = resolveTerminology(key, locale);
    if (term !== null) return interpolateMessage(term, params);
  }

  const local = getMessageCatalog(locale)[key];
  if (typeof local === "string") return interpolateMessage(local, params);

  if (locale !== DEFAULT_LOCALE) {
    const fallback = getMessageCatalog(DEFAULT_LOCALE)[key];
    if (typeof fallback === "string") return interpolateMessage(fallback, params);
  }

  return key;
}

export function hasMessage(key: MessageKey, locale: LocaleId): boolean {
  if (isTerminologyKey(key)) return resolveTerminology(key, locale) !== null;
  return typeof getMessageCatalog(locale)[key] === "string";
}

export function listCatalogKeys(locale: LocaleId): string[] {
  return Object.keys(getMessageCatalog(locale)).sort();
}
