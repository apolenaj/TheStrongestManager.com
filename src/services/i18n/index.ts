/**
 * i18n service (Prompt 148).
 * Preference resolution + architecture snapshot for admin.
 */

import { cookies } from "next/headers";
import {
  buildI18nArchitectureSnapshot,
  DEFAULT_LOCALE,
  getLocaleDefinition,
  resolveActiveLocale,
  type I18nArchitectureSnapshot,
  type LocaleId,
} from "@/domain/i18n";

/** Cookie used for future locale preference — English-only runtime today. */
export const LOCALE_COOKIE_NAME = "tsm_locale";

export async function getRequestedLocale(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(LOCALE_COOKIE_NAME)?.value ?? null;
}

/**
 * Active UI locale. Planned locales are accepted as preferences but
 * resolve to English until catalogs + terminology reviews ship.
 */
export async function getUiLocale(): Promise<LocaleId> {
  const requested = await getRequestedLocale();
  return resolveActiveLocale(requested);
}

export async function getUiLocaleMeta(): Promise<{
  locale: LocaleId;
  bcp47: string;
  textDirection: "ltr" | "rtl";
  requested: string | null;
}> {
  const requested = await getRequestedLocale();
  const locale = resolveActiveLocale(requested);
  const def = getLocaleDefinition(locale);
  return {
    locale,
    bcp47: def.bcp47,
    textDirection: def.textDirection,
    requested,
  };
}

export function getI18nArchitectureSnapshot(): I18nArchitectureSnapshot {
  return buildI18nArchitectureSnapshot();
}

export function getDefaultLocale(): LocaleId {
  return DEFAULT_LOCALE;
}
