"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  CALCULATOR_DEFINITIONS,
  CALCULATOR_SUITE_HONESTY,
  evaluateCalculatorQuality,
  type CalculatorId,
} from "@/domain/calculator-suite";

const TOOL_COPY_KEYS: Record<
  CalculatorId,
  { title: string; desc: string; disc: string }
> = {
  "estimated-1rm": {
    title: "calc_1rm_title",
    desc: "calc_1rm_desc",
    disc: "calc_1rm_disc",
  },
  "plate-calculator": {
    title: "calc_plate_title",
    desc: "calc_plate_desc",
    disc: "calc_plate_disc",
  },
  dots: {
    title: "calc_dots_title",
    desc: "calc_dots_desc",
    disc: "calc_dots_disc",
  },
  "volume-calculator": {
    title: "calc_vol_title",
    desc: "calc_vol_desc",
    disc: "calc_vol_disc",
  },
  "attempt-planner": {
    title: "calc_attempt_title",
    desc: "calc_attempt_desc",
    disc: "calc_attempt_disc",
  },
  "training-max": {
    title: "calc_tm_title",
    desc: "calc_tm_desc",
    disc: "calc_tm_disc",
  },
};

/**
 * Localized marketing hub for the public training calculators suite.
 */
export function ToolsHub() {
  const t = useTranslations("ToolsPage");

  const tools = CALCULATOR_DEFINITIONS.filter(
    (c) => evaluateCalculatorQuality(c).passed,
  );

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow={t("label")}
        title={t("title")}
        description={t("subtitle")}
      />

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {tools.map((tool) => {
          const keys = TOOL_COPY_KEYS[tool.slug];
          return (
            <li key={tool.slug}>
              <Link
                href={`/tools/${tool.slug}`}
                className="block border-t border-[var(--color-border)] pt-4 transition-colors hover:text-[var(--color-accent)]"
              >
                <h2 className="font-[family-name:var(--font-display)] text-xl">
                  {t(keys.title)}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {t(keys.desc)}
                </p>
                <p className="mt-3 text-xs text-[var(--color-muted)]">
                  {t(keys.disc)}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="mt-14 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          {t("precision_title")}
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {CALCULATOR_SUITE_HONESTY.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </MarketingContainer>
  );
}
