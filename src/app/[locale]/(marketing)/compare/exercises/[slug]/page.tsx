import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ExerciseCompareExperience } from "@/components/exercises/ExerciseCompareExperience";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import {
  articleJsonLd,
  breadcrumbJsonLd,
  faqPageJsonLd,
} from "@/domain/seo";
import {
  allExerciseComparisonSeoSlugs,
  buildExerciseComparison,
  getExerciseComparisonSeoPair,
  listComparableExercises,
} from "@/domain/exercise-comparison";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  if (!featureFlags.exerciseComparison) return [];
  return allExerciseComparisonSeoSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const pair = getExerciseComparisonSeoPair(slug);
  if (!pair || !featureFlags.exerciseComparison) {
    return {
      title: "Comparison not found",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: pair.title,
    description: pair.description,
    alternates: { canonical: `/compare/exercises/${pair.slug}` },
    openGraph: {
      title: pair.title,
      description: pair.description,
      url: `/compare/exercises/${pair.slug}`,
      type: "article",
    },
  };
}

export default async function ExerciseCompareSeoPage({ params }: PageProps) {
  if (!featureFlags.exerciseComparison) notFound();
  const { slug } = await params;
  const pair = getExerciseComparisonSeoPair(slug);
  if (!pair) notFound();

  const view = buildExerciseComparison([pair.exerciseA, pair.exerciseB]);
  const options = listComparableExercises();
  const path = `/compare/exercises/${pair.slug}`;
  const faq = faqPageJsonLd(pair.faqs);
  const jsonLd = [
    articleJsonLd({
      headline: pair.title,
      description: pair.description,
      path,
    }),
    breadcrumbJsonLd([
      { name: "Home", path: "/" },
      { name: "Compare exercises", path: "/compare/exercises" },
      { name: pair.title, path },
    ]),
    ...(faq ? [faq] : []),
  ];

  return (
    <MarketingContainer>
      <JsonLdScript data={jsonLd} />
      <PageIntro
        eyebrow="Exercise comparison"
        title={pair.title}
        description={pair.description}
      />
      <article className="mt-8 max-w-3xl">
        <p className="text-base leading-relaxed text-[var(--color-muted)]">
          {pair.overview}
        </p>
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          Full technique pages:{" "}
          <Link
            href={`/exercises/${pair.exerciseA}`}
            className="underline-offset-4 hover:underline"
          >
            {view.exercises[0]?.name ?? pair.exerciseA}
          </Link>
          {" · "}
          <Link
            href={`/exercises/${pair.exerciseB}`}
            className="underline-offset-4 hover:underline"
          >
            {view.exercises[1]?.name ?? pair.exerciseB}
          </Link>
        </p>
      </article>
      <div className="mt-10">
        <ExerciseCompareExperience
          options={options}
          initialSlugs={[pair.exerciseA, pair.exerciseB]}
          view={view}
        />
      </div>
      {pair.faqs.length > 0 ? (
        <section className="mt-12 max-w-3xl border-t border-[var(--color-border)] pt-8">
          <h2 className="font-[family-name:var(--font-display)] text-lg">
            FAQ
          </h2>
          <dl className="mt-4 space-y-4">
            {pair.faqs.map((f) => (
              <div key={f.question}>
                <dt className="font-medium">{f.question}</dt>
                <dd className="mt-1 text-sm text-[var(--color-muted)]">
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
