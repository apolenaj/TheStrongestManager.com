export const siteConfig = {
  name: "TheStrongestManager",
  domain: "thestrongestmanager.com",
  description:
    "Training, technique review, recovery, and progress tools for strength athletes and coaches.",
  tagline: "What should I do next to improve?",
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
