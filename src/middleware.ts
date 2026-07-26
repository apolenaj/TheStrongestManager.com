import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { resolveAuthRedirect } from "@/services/auth/route-guard";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const redirectTo = resolveAuthRedirect({
    pathname: req.nextUrl.pathname,
    search: req.nextUrl.search,
    isAuthenticated: Boolean(req.auth),
  });

  if (redirectTo) {
    return Response.redirect(new URL(redirectTo, req.nextUrl.origin));
  }

  return undefined;
});

export const config = {
  matcher: ["/app/:path*", "/login", "/signup", "/forgot-password"],
};
