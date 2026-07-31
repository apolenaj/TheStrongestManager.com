import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/domain/seo";
import {
  allProgrammaticSeoSlugs,
  evaluateProgrammaticSeoQuality,
  getProgrammaticSeoPage,
} from "@/domain/programmatic-seo-safety";
import { featureFlags } from "@/config/feature-flags";
import { resolveIndexableProgrammaticSeoPage } from "@/services/programmatic-seo-safety";

/** Legacy guide slugs superseded by the Exercise Comparison Engine (Prompt 166). */
const EXERCISE_COMPARE_REDIRECTS: Record<string, string> = {
  "deadlift-vs-romanian-deadlift":
    "/compare/exercises/deadlift-vs-romanian-deadlift",
  "back-squat-vs-front-squat": "/compare/exercises/back-squat-vs-front-squat",
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  if (!featureFlags.programmaticSeoSafety) return [];
  return allProgrammaticSeoSlugs()
    .filter((slug) => {
      const page = getProgrammaticSeoPage(slug);
      return page ? evaluateProgrammaticSeoQuality(page).passed : false;
    })
    .map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (EXERCISE_COMPARE_REDIRECTS[slug]) {
    return { title: "Redirecting…", robots: { index: false, follow: true } };
  }
  const page = resolveIndexableProgrammaticSeoPage(slug);
  if (!page) {
    return {
      title: "Guide not found",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: `/guides/${page.slug}` },
    openGraph: {
      title: page.title,
      description: page.description,
      url: `/guides/${page.slug}`,
      type: "article",
    },
  };
}

export default async function ProgrammaticSeoGuidePage({ params }: PageProps) {
  const { slug } = await params;
  const dest = EXERCISE_COMPARE_REDIRECTS[slug];
  if (dest) redirect(dest);

  const page = resolveIndexableProgrammaticSeoPage(slug);
  if (!page) notFound();

  const path = `/guides/${page.slug}`;
  const faq = faqPageJsonLd(page.faqs);
  const jsonLd = [
    articleJsonLd({
      headline: page.title,
      description: page.description,
      path,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Guides", path: "/guides" },
      { name: page.title, path },
    ]),
    ...(faq ? [faq] : []),
  ];

  return (
    <MarketingContainer>
      <JsonLdScript data={jsonLd} />
      <PageIntro
        eyebrow="Guide"
        title={page.title}
        description={page.description}
      />
      <article className="mt-10 max-w-3xl space-y-8">
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
            Related pages
          </h2>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm">
            {page.internalLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-[var(--color-foreground)] underline-offset-4 hover:underline"
                >
                  {link.title}
                </Link>
                <span className="text-[var(--color-muted)]">
                  {" — "}
                  {link.reason}
                </span>
              </li>
            ))}
          </ul>
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
