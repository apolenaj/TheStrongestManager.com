import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { PageIntro } from "@/components/ui/PageIntro";
import { ButtonLink } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/domain/seo";
import {
  allSportGoalLandingSlugs,
  evaluateSportGoalLandingQuality,
  getSportGoalLanding,
} from "@/domain/sport-goal-landings";
import { resolveIndexableSportGoalLanding } from "@/services/sport-goal-landings";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  if (!featureFlags.sportGoalLandings) return [];
  return allSportGoalLandingSlugs()
    .filter((slug) => {
      const page = getSportGoalLanding(slug);
      return page ? evaluateSportGoalLandingQuality(page).passed : false;
    })
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const page = resolveIndexableSportGoalLanding(slug);
  if (!page) {
    return {
      title: "Goal not found",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/goals/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/goals/${page.slug}`,
      type: "article",
    },
  };
}

export default async function SportGoalLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const page = resolveIndexableSportGoalLanding(slug);
  if (!page) notFound();

  const path = `/goals/${page.slug}`;
  const faq = faqPageJsonLd(page.faqs);
  const jsonLd = [
    articleJsonLd({
      headline: page.title,
      description: page.description,
      path,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Goals", path: "/goals" },
      { name: page.title, path },
    ]),
    ...(faq ? [faq] : []),
  ];

  const publicLinks = page.productLinks.filter((l) => l.surface === "public");
  const appLinks = page.productLinks.filter((l) => l.surface === "app");

  return (
    <MarketingContainer>
      <JsonLdScript data={jsonLd} />
      <PageIntro
        eyebrow={page.goalLabel}
        title={page.title}
        description={page.description}
      />
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={page.primaryCta.href} size="lg">
          {page.primaryCta.label}
        </ButtonLink>
        <ButtonLink href="/features" variant="secondary" size="lg">
          See what&apos;s included
        </ButtonLink>
      </div>

      <article className="mt-12 max-w-3xl space-y-8">
        <p className="text-base leading-relaxed text-[var(--color-muted)]">
          {page.overview}
        </p>
        {page.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
              {section.heading}
            </h2>
            <p className="mt-3 text-base leading-relaxed text-[var(--color-muted)]">
              {section.body}
            </p>
          </section>
        ))}

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
            Product features this goal uses
          </h2>
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium">Explore now</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                {publicLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </Link>
                    <span className="text-[var(--color-muted)]">
                      {" — "}
                      {link.reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium">In the app (after signup)</h3>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
                {appLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {link.label}
                    </Link>
                    <span className="text-[var(--color-muted)]">
                      {" — "}
                      {link.reason}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {page.faqs.length > 0 ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight">
              FAQ
            </h2>
            <dl className="mt-4 space-y-4">
              {page.faqs.map((faq) => (
                <div key={faq.question}>
                  <dt className="font-medium">{faq.question}</dt>
                  <dd className="mt-1 text-sm text-[var(--color-muted)]">
                    {faq.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
      </article>
    </MarketingContainer>
  );
}
