import { locales, type AppLocale } from "@/i18n/routing";

/**
 * Pure route-guard helpers — unit-tested for unauthorized access behavior.
 */

export function stripLocalePrefix(pathname: string): {
  locale: AppLocale | null;
  pathnameWithoutLocale: string;
} {
  const segments = pathname.split("/");
  const maybeLocale = segments[1];
  if (
    maybeLocale &&
    (locales as readonly string[]).includes(maybeLocale)
  ) {
    const rest = segments.slice(2).join("/");
    return {
      locale: maybeLocale as AppLocale,
      pathnameWithoutLocale: rest ? `/${rest}` : "/",
    };
  }
  return { locale: null, pathnameWithoutLocale: pathname };
}

export function resolveAuthRedirect(input: {
  pathname: string;
  search?: string;
  isAuthenticated: boolean;
}): string | null {
  const search = input.search ?? "";
  const { locale, pathnameWithoutLocale } = stripLocalePrefix(input.pathname);
  const prefix = locale ? `/${locale}` : "";

  if (
    (pathnameWithoutLocale === "/app" ||
      pathnameWithoutLocale.startsWith("/app/")) &&
    !input.isAuthenticated
  ) {
    const callback = `${input.pathname}${search}`;
    return `${prefix}/login?callbackUrl=${encodeURIComponent(callback)}`;
  }

  if (
    input.isAuthenticated &&
    (pathnameWithoutLocale === "/login" ||
      pathnameWithoutLocale === "/signup" ||
      pathnameWithoutLocale === "/forgot-password")
  ) {
    return `${prefix}/app`;
  }

  return null;
}

export function isProtectedAppPath(pathname: string): boolean {
  const { pathnameWithoutLocale } = stripLocalePrefix(pathname);
  return (
    pathnameWithoutLocale === "/app" ||
    pathnameWithoutLocale.startsWith("/app/")
  );
}
