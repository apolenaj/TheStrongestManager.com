/**
 * App-level i18n entry — re-exports routing config for middleware and docs.
 * Request config lives in `src/i18n/request.ts` (next-intl plugin entry).
 */
export {
  routing,
  locales,
  defaultLocale,
  LOCALE_COOKIE_NAME,
  LOCALE_COOKIE_MAX_AGE,
  type AppLocale,
} from "@/i18n/routing";
