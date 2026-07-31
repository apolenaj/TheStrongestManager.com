import createIntlMiddleware from "next-intl/middleware";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { routing } from "@/i18n/routing";
import { resolveAuthRedirect } from "@/services/auth/route-guard";

/**
 * next-intl middleware — enables Accept-Language detection and honors
 * the NEXT_LOCALE cookie above the browser language on return visits.
 */
const intlMiddleware = createIntlMiddleware(routing);
const { auth } = NextAuth(authConfig);

/**
 * Compose Auth.js protection with next-intl locale negotiation.
 *
 * Auth redirects run first (locale-aware via route-guard). All other
 * requests pass through intl middleware so:
 * - Czech browsers land on `/cs…` when no cookie is set
 * - `NEXT_LOCALE` (set by LanguageSwitcher) wins over Accept-Language
 */
export default auth((req) => {
  const redirectTo = resolveAuthRedirect({
    pathname: req.nextUrl.pathname,
    search: req.nextUrl.search,
    isAuthenticated: Boolean(req.auth),
  });

  if (redirectTo) {
    return Response.redirect(new URL(redirectTo, req.nextUrl.origin));
  }

  return intlMiddleware(req);
});

export const config = {
  // Match all pathnames except API, Next internals, Vercel, and static files.
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
