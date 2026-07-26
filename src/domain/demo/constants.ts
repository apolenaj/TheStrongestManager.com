/** Reserved identity for the isolated Demo Mode athlete — never a production signup. */
export const DEMO_ATHLETE_EMAIL = "demo-athlete@demo.thestrongest.local";

/** Display name shown in Demo Mode UI and seed. */
export const DEMO_ATHLETE_DISPLAY_NAME = "Demo Athlete";

/** Public-facing labels — must stay obvious on every demo surface. */
export const DEMO_MODE_LABEL = "Demo athlete";
export const DEMO_MODE_EXPLORE_LABEL = "Explore example dashboard.";

/** Email domain reserved for Demo Mode accounts (signup blocked). */
export const DEMO_EMAIL_DOMAIN = "@demo.thestrongest.local";

export function isReservedDemoEmail(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (
    normalized === DEMO_ATHLETE_EMAIL ||
    normalized.endsWith(DEMO_EMAIL_DOMAIN)
  );
}

/** Map authenticated app paths onto public Demo Mode paths. */
export function toDemoHref(href: string): string {
  if (href === "/app" || href === "/app/") return "/demo";
  if (href.startsWith("/app/")) {
    return `/demo/${href.slice("/app/".length)}`;
  }
  return href;
}
