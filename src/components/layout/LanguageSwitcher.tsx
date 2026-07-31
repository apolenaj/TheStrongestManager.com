"use client";

import { useLocale } from "next-intl";
import { useTransition } from "react";
import { cn } from "@/design-system/utils/cn";
import { usePathname, useRouter } from "@/i18n/navigation";
import {
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  type AppLocale,
  locales,
} from "@/i18n/routing";

const LOCALE_LABELS: Record<AppLocale, string> = {
  en: "EN",
  cs: "CZ",
};

/**
 * Persist the manual locale choice so middleware prioritizes NEXT_LOCALE
 * over Accept-Language on future visits.
 */
function persistLocalePreference(locale: AppLocale) {
  if (typeof document === "undefined") return;
  document.cookie = [
    `${LOCALE_COOKIE_NAME}=${locale}`,
    "path=/",
    `max-age=${LOCALE_COOKIE_MAX_AGE}`,
    "samesite=lax",
  ].join("; ");
}

/**
 * Premium EN | CZ toggle.
 *
 * Uses `usePathname` + `useRouter` from `next-intl/navigation` only
 * (never `next/navigation`). Pathname is locale-stripped, so:
 *   /en/programs              → /cs/programs
 *   /en/legendary-methods/x   → /cs/legendary-methods/x
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(nextLocale: AppLocale) {
    if (nextLocale === locale) return;

    persistLocalePreference(nextLocale);

    startTransition(() => {
      router.replace(pathname, { locale: nextLocale });
    });
  }

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em]",
        isPending && "opacity-70",
        className,
      )}
    >
      {locales.map((code, index) => {
        const active = code === locale;
        return (
          <span key={code} className="inline-flex items-center gap-1.5">
            {index > 0 ? (
              <span aria-hidden className="text-zinc-600">
                |
              </span>
            ) : null}
            <button
              type="button"
              onClick={() => switchTo(code)}
              aria-pressed={active}
              aria-label={code === "en" ? "English" : "Czech"}
              disabled={isPending}
              className={cn(
                "min-h-9 px-0.5 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                active
                  ? "font-bold text-white"
                  : "font-medium text-zinc-500 hover:text-zinc-300",
              )}
            >
              {LOCALE_LABELS[code]}
            </button>
          </span>
        );
      })}
    </div>
  );
}
