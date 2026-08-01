import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { CalculatorTool } from "@/components/calculator-suite/CalculatorTool";
import { Estimated1rmExperience } from "@/components/calculator-suite/Estimated1rmExperience";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { PageIntro } from "@/components/ui/PageIntro";
import { ButtonLink } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  allCalculatorSlugs,
  evaluateCalculatorQuality,
  getCalculatorDefinition,
  type CalculatorId,
} from "@/domain/calculator-suite";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/domain/seo";
import { resolveIndexableCalculator } from "@/services/calculator-suite";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  if (!featureFlags.calculatorSuite) return [];
  return allCalculatorSlugs()
    .filter((slug) => {
      const calc = getCalculatorDefinition(slug);
      return calc ? evaluateCalculatorQuality(calc).passed : false;
    })
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (slug === "estimated-1rm") {
    const t = await getTranslations("Tool_1RM");
    return {
      title: t("title"),
      description: t("subtitle"),
      alternates: { canonical: "/tools/estimated-1rm" },
      openGraph: {
        title: t("title"),
        description: t("subtitle"),
        url: "/tools/estimated-1rm",
        type: "article",
      },
    };
  }
  const calc = resolveIndexableCalculator(slug);
  if (!calc) {
    return {
      title: "Calculator not found",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: calc.title,
    description: calc.description,
    alternates: { canonical: `/tools/${calc.slug}` },
    openGraph: {
      title: calc.title,
      description: calc.description,
      url: `/tools/${calc.slug}`,
      type: "article",
    },
  };
}

export default async function CalculatorPage({ params }: PageProps) {
  const { slug } = await params;
  const calc = resolveIndexableCalculator(slug);
  if (!calc) notFound();

  if (slug === "estimated-1rm") {
    const t = await getTranslations("Tool_1RM");
    const path = "/tools/estimated-1rm";
    const jsonLd = [
      articleJsonLd({
        headline: t("title"),
        description: t("subtitle"),
        path,
      }),
      breadcrumbJsonLd([
        { name: "Home", path: "/" },
        { name: "Tools", path: "/tools" },
        { name: t("title"), path },
      ]),
    ];
    return (
      <>
        <JsonLdScript data={jsonLd} />
        <Estimated1rmExperience />
      </>
    );
  }

  const path = `/tools/${calc.slug}`;
  const faq = faqPageJsonLd(calc.faqs);
  const jsonLd = [
    articleJsonLd({
      headline: calc.title,
      description: calc.description,
      path,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Tools", path: "/tools" },
      { name: calc.title, path },
    ]),
    ...(faq ? [faq] : []),
  ];

  const publicLinks = calc.productLinks.filter((l) => l.surface === "public");
  const appLinks = calc.productLinks.filter((l) => l.surface === "app");

  return (
    <MarketingContainer>
      <JsonLdScript data={jsonLd} />
      <PageIntro
        eyebrow={calc.shortLabel}
        title={calc.title}
        description={calc.description}
      />

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={calc.primaryCta.href} size="lg">
          {calc.primaryCta.label}
        </ButtonLink>
        <ButtonLink href="/tools" variant="secondary" size="lg">
          All calculators
        </ButtonLink>
      </div>

      <section className="mt-10 max-w-3xl">
        <p className="text-sm leading-relaxed text-[var(--color-muted)]">
          {calc.overview}
        </p>
        <p className="mt-3 text-xs text-[var(--color-muted)]">
          {calc.formulaCitation}
        </p>
        <p className="mt-2 text-xs font-medium text-[var(--color-muted)]">
          {calc.precisionNote}
        </p>
      </section>

      <section className="mt-10 max-w-3xl rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <h2 className="font-[family-name:var(--font-display)] text-lg">
          Calculator
        </h2>
        <div className="mt-4">
          <CalculatorTool slug={calc.slug as CalculatorId} />
        </div>
      </section>

      <section className="mt-12 max-w-3xl">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Continue in the product
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Numbers are more useful when they become logged training.
        </p>
        {publicLinks.length > 0 ? (
          <ul className="mt-6 space-y-4">
            {publicLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-medium transition-colors hover:text-[var(--color-accent)]"
                >
                  {l.label}
                </Link>
                <p className="mt-1 text-sm text-[var(--color-muted)]">
                  {l.reason}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
        {appLinks.length > 0 ? (
          <>
            <h3 className="mt-8 text-sm font-medium uppercase tracking-wide text-[var(--color-muted)]">
              In the app
            </h3>
            <ul className="mt-4 space-y-4">
              {appLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="font-medium transition-colors hover:text-[var(--color-accent)]"
                  >
                    {l.label}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {l.reason}
                  </p>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </section>

      {calc.faqs.length > 0 ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="font-[family-name:var(--font-display)] text-xl">FAQ</h2>
          <dl className="mt-6 space-y-6">
            {calc.faqs.map((f) => (
              <div key={f.question}>
                <dt className="font-medium">{f.question}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {f.answer}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </MarketingContainer>
  );
}
