import type { Metadata } from "next";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import { CALCULATOR_DEFINITIONS } from "@/domain/calculator-suite";
import { evaluateCalculatorQuality } from "@/domain/calculator-suite";
import { CALCULATOR_SUITE_HONESTY } from "@/domain/calculator-suite";

export const metadata: Metadata = {
  title: "Training calculators",
  description:
    "Estimated 1RM, plate loading, DOTS, volume, attempt planning, and training max — useful tools that lead into The Strongest without overpromising precision.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Training calculators",
    description:
      "Practical strength tools with cited formulas and links into real product features.",
    url: "/tools",
  },
};

export default function ToolsHubPage() {
  if (!featureFlags.calculatorSuite) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Calculator suite"
          description="Training calculators are not enabled yet."
          reason="This surface ships behind NEXT_PUBLIC_FF_CALCULATOR_SUITE."
        />
      </MarketingContainer>
    );
  }

  const tools = CALCULATOR_DEFINITIONS.filter(
    (c) => evaluateCalculatorQuality(c).passed,
  );

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Tools"
        title="Training calculators"
        description="Useful numbers for planning — estimated 1RM, plates, DOTS, volume, attempts, and training max. Outputs are aids, not guarantees. Each tool links into the platform."
      />

      <ul className="mt-10 grid gap-6 sm:grid-cols-2">
        {tools.map((tool) => (
          <li key={tool.slug}>
            <Link
              href={`/tools/${tool.slug}`}
              className="block border-t border-[var(--color-border)] pt-4 transition-colors hover:text-[var(--color-accent)]"
            >
              <h2 className="font-[family-name:var(--font-display)] text-xl">
                {tool.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                {tool.description}
              </p>
              <p className="mt-3 text-xs text-[var(--color-muted)]">
                {tool.precisionNote}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="mt-14 max-w-2xl">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Precision honesty
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
