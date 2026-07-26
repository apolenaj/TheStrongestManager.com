/**
 * Pure route-guard helpers — unit-tested for unauthorized access behavior.
 */

export function resolveAuthRedirect(input: {
  pathname: string;
  search?: string;
  isAuthenticated: boolean;
}): string | null {
  const search = input.search ?? "";

  if (input.pathname.startsWith("/app") && !input.isAuthenticated) {
    const callback = `${input.pathname}${search}`;
    return `/login?callbackUrl=${encodeURIComponent(callback)}`;
  }

  if (
    input.isAuthenticated &&
    (input.pathname === "/login" ||
      input.pathname === "/signup" ||
      input.pathname === "/forgot-password")
  ) {
    return "/app";
  }

  return null;
}

export function isProtectedAppPath(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/");
}
