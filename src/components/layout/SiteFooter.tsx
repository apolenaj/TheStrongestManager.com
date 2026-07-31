"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { siteConfig } from "@/config/site";
import {
  SITE_FOOTER_COLUMNS,
  STRENGTH_AUDIT_HREF,
} from "@/components/layout/site-nav";
import { trackLegendaryAnalytics } from "@/components/legendary-methods/LegendaryAnalytics";
import { BrandLogo } from "@/components/brand/BrandLogo";

const COLUMN_KEY: Record<string, string> = {
  Coaching: "coaching",
  Programs: "programs",
  "Free Tools": "free_tools",
  Learn: "learn",
  Company: "company",
  Legal: "legal",
};

const LINK_KEY: Record<string, string> = {
  "1:1 Coaching": "one_to_one",
  "Coach matching": "coach_matching",
  "Competition Prep": "competition_prep",
  "Strength Audit": "strength_audit",
  "Program catalog": "program_catalog",
  "Find my program": "find_my_program",
  "Method collection": "method_collection",
  "Creator marketplace": "creator_marketplace",
  Calculators: "calculators",
  "Program audit": "program_audit",
  "Technique check": "technique_check",
  "Athlete assessment": "athlete_assessment",
  "Method compare": "method_compare",
  "Learning paths": "learning_paths",
  "Legendary Methods": "legendary_methods",
  Methods: "methods",
  Academy: "academy",
  Exercises: "exercises",
  Guides: "guides",
  About: "about",
  "Trust Center": "trust_center",
  Pricing: "pricing",
  Affiliates: "affiliates",
  Demo: "demo",
  Privacy: "privacy",
  Terms: "terms",
  Cookies: "cookies",
};

export function SiteFooter() {
  const t = useTranslations("SiteFooter");
  const tNav = useTranslations("Navigation");

  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-10 border-b border-[var(--color-border)] pb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-md">
            <BrandLogo />
            <p className="mt-5 text-sm leading-relaxed text-[var(--color-muted)]">
              {t("blurb")}
            </p>
          </div>
          <Link
            href={STRENGTH_AUDIT_HREF}
            className="inline-flex min-h-12 items-center justify-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-all duration-300 hover:bg-[var(--color-accent-hover)]"
          >
            {tNav("strengthAuditCta")}
          </Link>
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {SITE_FOOTER_COLUMNS.map((column) => {
            const columnKey = COLUMN_KEY[column.title];
            return (
              <div key={column.title}>
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
                  {columnKey ? t(`columns.${columnKey}`) : column.title}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => {
                    const linkKey = LINK_KEY[link.label];
                    return (
                      <li key={`${column.title}-${link.href}-${link.label}`}>
                        <Link
                          href={link.href}
                          onClick={() => {
                            if (link.href === "/legendary-methods") {
                              trackLegendaryAnalytics(
                                "legendary_methods_nav_click",
                                { surface: "footer" },
                              );
                            }
                          }}
                          className="text-sm text-[var(--color-muted)] transition-colors duration-300 hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                        >
                          {linkKey ? t(`links.${linkKey}`) : link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[var(--color-border)] pt-8 text-xs text-[var(--color-subtle)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.domain}
          </p>
          <p className="max-w-xl sm:text-right">{t("disclaimer")}</p>
        </div>
      </div>
    </footer>
  );
}
