import { defineRouting } from "next-intl/routing";

export const locales = ["en", "cs"] as const;
export type AppLocale = (typeof locales)[number];
export const defaultLocale: AppLocale = "en";

/** Cookie name next-intl reads/writes for locale preference. */
export const LOCALE_COOKIE_NAME = "NEXT_LOCALE";

/** Persist manual language choice for one year across sessions. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Shared next-intl routing — English default, always-prefixed locales.
 *
 * Locale negotiation priority (middleware):
 * 1. Locale prefix in the URL (e.g. `/cs/about`)
 * 2. `NEXT_LOCALE` cookie (manual LanguageSwitcher choice)
 * 3. `Accept-Language` header (automatic browser detection)
 * 4. `defaultLocale` (`en`)
 */
export const routing = defineRouting({
  locales,
  defaultLocale,
  localePrefix: "always",
  localeDetection: true,
  localeCookie: {
    name: LOCALE_COOKIE_NAME,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    sameSite: "lax",
    path: "/",
  },
});
