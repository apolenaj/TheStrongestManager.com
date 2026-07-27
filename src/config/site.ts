export const siteConfig = {
  name: "TheStrongestManager",
  domain: "thestrongestmanager.com",
  description:
    "Online powerlifting coach tools, powerlifting programs, technique feedback, and evidence-led training systems for serious strength athletes.",
  tagline: "Build strength that survives the platform.",
} as const;

/** Absolute site origin for sitemaps, canonicals, and JSON-LD. */
export function getSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    `https://${siteConfig.domain}`
  );
}

/** Build an absolute URL from a path starting with `/`. */
export function absoluteUrl(path: string): string {
  const origin = getSiteOrigin();
  if (!path || path === "/") return origin;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}
