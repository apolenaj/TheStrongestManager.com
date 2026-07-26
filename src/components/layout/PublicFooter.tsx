import Link from "next/link";
import { siteConfig } from "@/config/site";

const FOOTER_LINKS = [
  { href: "/search", label: "Search" },
  { href: "/learn", label: "Learn" },
  { href: "/exercises", label: "Exercises" },
  { href: "/methods", label: "Methods" },
  { href: "/history", label: "History" },
  { href: "/academy", label: "Academy" },
  { href: "/pricing", label: "Pricing" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/trust", label: "Trust Center" },
] as const;

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-[var(--color-muted)] sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="font-[family-name:var(--font-display)] text-[var(--color-foreground)]">
              {siteConfig.name}
            </span>
            <span className="mx-2 text-[var(--color-border-strong)]">·</span>
            Strength training tools
          </p>
          <p>
            Planned nutrition connection with{" "}
            <a
              href="https://mealnexio.com"
              className="text-[var(--color-foreground)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
              rel="noopener noreferrer"
              target="_blank"
            >
              Mealnexio.com
            </a>
            {" "}
            (not live yet).
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-4 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-foreground)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
