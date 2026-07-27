import Link from "next/link";
import { siteConfig } from "@/config/site";

const FOOTER_LINKS = [
  { href: "/methods", label: "Methods" },
  { href: "/pricing", label: "Pricing" },
  { href: "/academy", label: "Academy" },
  { href: "/trust", label: "Trust" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
] as const;

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 sm:py-14">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold uppercase tracking-[0.04em] text-[var(--color-foreground)]">
              The Strongest{" "}
              <span className="text-[var(--color-accent)]">Manager</span>
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-muted)]">
              Strength training and mental discipline for people who lead under
              pressure.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
          >
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-[var(--color-border)] pt-6 text-xs text-[var(--color-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.domain}
          </p>
          <p>
            Nutrition partner planned:{" "}
            <a
              href="https://mealnexio.com"
              className="text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-foreground)] hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              Mealnexio.com
            </a>{" "}
            (not live yet)
          </p>
        </div>
      </div>
    </footer>
  );
}
