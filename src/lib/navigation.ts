import { routes, type AppRoute } from "@/config/routes";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

/**
 * Match a pathname to the best route definition (supports [param] segments).
 */
export function matchAppRoute(pathname: string): AppRoute | undefined {
  const normalized = pathname.replace(/\/$/, "") || "/";

  const exact = routes.find((route) => route.href === normalized);
  if (exact) return exact;

  return routes.find((route) => {
    if (!route.href.includes("[")) return false;
    const pattern = route.href
      .split("/")
      .map((segment) =>
        segment.startsWith("[") && segment.endsWith("]") ? "[^/]+" : segment,
      )
      .join("/");
    return new RegExp(`^${pattern}$`).test(normalized);
  });
}

export function buildAppBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const normalized = pathname.replace(/\/$/, "") || "/app";
  const crumbs: BreadcrumbItem[] = [
    { label: "App", href: "/app/dashboard" },
  ];

  if (normalized === "/app" || normalized === "/app/dashboard") {
    crumbs.push({ label: "Dashboard" });
    return crumbs;
  }

  const parts = normalized.split("/").filter(Boolean);
  // parts: ["app", "programs", "123"] etc.
  let accumulated = "";
  for (let i = 1; i < parts.length; i += 1) {
    accumulated += `/${parts[i]}`;
    const fullPath = `/app${accumulated}`;
    const route = matchAppRoute(fullPath);
    const isLast = i === parts.length - 1;
    const label =
      route?.label ??
      parts[i].replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());

    crumbs.push({
      label,
      href: isLast ? undefined : fullPath,
    });
  }

  return crumbs;
}

/** Primary destinations for mobile bottom navigation (max 4 + More). */
export const MOBILE_PRIMARY_NAV_IDS = [
  "dashboard",
  "today",
  "training",
  "progress",
] as const;

export function getMobilePrimaryNavRoutes(
  all: AppRoute[],
): AppRoute[] {
  return MOBILE_PRIMARY_NAV_IDS.map((id) =>
    all.find((route) => route.id === id),
  ).filter((route): route is AppRoute => Boolean(route));
}
