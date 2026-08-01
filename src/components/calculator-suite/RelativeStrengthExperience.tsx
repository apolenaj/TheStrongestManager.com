"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalculatorTool } from "@/components/calculator-suite/CalculatorTool";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PageIntro } from "@/components/ui/PageIntro";
import { ButtonLink } from "@/design-system";

/**
 * Localized relative strength tool page (DOTS + IPF GL Classic).
 */
export function RelativeStrengthExperience() {
  const t = useTranslations("Tool_RelativeStrength");

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="DOTS / IPF GL"
        title={t("title")}
        description={t("subtitle")}
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/app/powerlifting" size="lg">
          {t("btn_mode")}
        </ButtonLink>
        <ButtonLink href="/tools" variant="secondary" size="lg">
          {t("btn_all")}
        </ButtonLink>
      </div>

      <section className="mt-10 max-w-3xl">
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          {t("body_text")}
        </p>
        <p className="mt-2 text-xs font-medium text-[var(--color-muted)]">
          {t("disclaimer")}
        </p>
      </section>

      <section className="mt-10 max-w-3xl rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <h2 className="font-[family-name:var(--font-heading)] text-lg font-black uppercase tracking-normal">
          {t("calc_title")}
        </h2>
        <div className="mt-4">
          <CalculatorTool slug="dots" />
        </div>
      </section>

      <p className="mt-10 max-w-3xl text-sm text-[var(--color-muted)]">
        <Link
          href="/tools"
          className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:text-[var(--color-accent)] hover:underline"
        >
          {t("btn_all")}
        </Link>
      </p>
    </MarketingContainer>
  );
}
