"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import {
  SITE_FOOTER_COLUMNS,
  STRENGTH_AUDIT_CTA,
  STRENGTH_AUDIT_HREF,
} from "@/components/layout/site-nav";
import { trackLegendaryAnalytics } from "@/components/legendary-methods/LegendaryAnalytics";
import { BrandLogo } from "@/components/brand/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-10 border-b border-[var(--color-border)] pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <BrandLogo />
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-muted)]">
              Strength systems for people who lead under pressure — powerlifting
              standards, structured coaching, and tools that only claim what they
              can measure.
            </p>
          </div>
          <Link
            href={STRENGTH_AUDIT_HREF}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-all duration-300 hover:bg-[var(--color-accent-hover)]"
          >
            {STRENGTH_AUDIT_CTA}
          </Link>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {SITE_FOOTER_COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                {column.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.href}-${link.label}`}>
                    <Link
                      href={link.href}
                      onClick={() => {
                        if (link.href === "/legendary-methods") {
                          trackLegendaryAnalytics("legendary_methods_nav_click", {
                            surface: "footer",
                          });
                        }
                      }}
                      className="text-sm text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[var(--color-border)] pt-8 text-xs text-[var(--color-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.domain}
          </p>
          <p className="max-w-xl sm:text-right">
            Nutrition connection with Mealnexio is planned and not live yet. We
            do not invent macros, athlete counts, or success rates.
          </p>
        </div>
      </div>
    </footer>
  );
}
