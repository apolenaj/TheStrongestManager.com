import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import { EvidenceQualityLabelChip } from "@/components/evidence-quality/EvidenceQualityBadge";
import { Alert } from "@/design-system";
import {
  EVIDENCE_QUALITY_HONESTY,
  defaultArticleEvidenceLabel,
} from "@/domain/evidence-quality";
import { featureFlags } from "@/config/feature-flags";
import { getPublicExpertArticle } from "@/services/expert-contributor";

type Props = {
  params: Promise<{ slug: string; articleSlug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, articleSlug } = await params;
  const article = await getPublicExpertArticle(slug, articleSlug);
  if (!article) return { title: "Article" };
  return {
    title: article.title,
    description: article.description,
    authors: [{ name: article.author.displayName }],
  };
}

export default async function PublicExpertArticlePage({ params }: Props) {
  const { slug, articleSlug } = await params;
  const article = await getPublicExpertArticle(slug, articleSlug);
  if (!article) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <JsonLdScript data={article.jsonLd} />
      <p className="text-sm">
        <Link
          href={`/experts/${article.author.seoSlug}`}
          className="text-[var(--color-accent)]"
        >
          ← {article.author.displayName}
        </Link>
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
        {article.title}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-muted)]">
        By {article.author.displayName}
        {article.publishedAt
          ? ` · ${new Date(article.publishedAt).toLocaleDateString()}`
          : ""}
      </p>
      {featureFlags.evidenceQualitySystem ? (
        <div className="mt-4 grid gap-3">
          <EvidenceQualityLabelChip
            label={defaultArticleEvidenceLabel()}
            showFamily
          />
          <Alert tone="info" title="Expert practice">
            Expert articles are labeled as coaching consensus by default —
            expert practice, not automatic research proof.{" "}
            {EVIDENCE_QUALITY_HONESTY[2]}{" "}
            <Link
              href="/evidence"
              className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            >
              Evidence label guide
            </Link>
          </Alert>
        </div>
      ) : null}
      <p className="mt-4 text-[var(--color-muted)]">{article.description}</p>
      <article className="prose prose-invert mt-8 max-w-none whitespace-pre-wrap text-sm leading-relaxed">
        {article.body}
      </article>
    </main>
  );
}
