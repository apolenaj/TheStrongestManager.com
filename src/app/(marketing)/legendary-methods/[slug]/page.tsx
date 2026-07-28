import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { LegendaryMethodProfileTemplate } from "@/components/legendary-methods/LegendaryMethodProfileTemplate";
import { LegendaryProfileOpenedBeacon } from "@/components/legendary-methods/LegendaryAnalytics";
import { JsonLdScript } from "@/components/seo/JsonLdScript";
import {
  LEGENDARY_METHODS_OG_IMAGE_PATH,
  allPublishedLegendaryMethodSlugs,
  canServeLegendaryMethodProfile,
  getLegendaryMethodBySlug,
  getLegendaryMethodDetail,
  legendaryMethodsSocialMetadata,
} from "@/domain/legendary-methods";
import { articleJsonLd, breadcrumbJsonLd } from "@/domain/seo";
import { absoluteUrl } from "@/config/site";

type LegendaryMethodDetailPageProps = {
  params: Promise<{ slug: string }>;
};

/**
 * Only published profiles get predictable production URLs.
 * Drafts are omitted from static params and return 404 unless
 * ALLOW_LEGENDARY_DRAFT_PREVIEW=true.
 */
export function generateStaticParams() {
  return allPublishedLegendaryMethodSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: LegendaryMethodDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const published = getLegendaryMethodDetail(slug);
  if (published) {
    const canonical = published.seo.canonicalPath;
    const modified =
      published.lastReviewedAt ?? published.updatedAt ?? published.publishedAt;
    const social = legendaryMethodsSocialMetadata({
      title: published.seo.title,
      description: published.seo.description,
      path: canonical,
      type: "article",
      publishedTime: published.publishedAt,
      modifiedTime: modified,
    });
    return {
      title: published.seo.title,
      description: published.seo.description,
      keywords: published.seo.keywords,
      alternates: { canonical },
      ...social,
      authors: [{ name: "Josef" }, { name: "The Strongest Manager editorial team" }],
      robots: { index: true, follow: true },
    };
  }

  const draft = getLegendaryMethodBySlug(slug);
  if (!draft || !canServeLegendaryMethodProfile(draft.status)) {
    return { title: "Profile not found", robots: { index: false, follow: false } };
  }

  // Drafts: noindex, no canonical (avoid duplicate URL signals).
  return {
    title: draft.seo.title,
    description: draft.seo.description,
    robots: { index: false, follow: false },
  };
}

export default async function LegendaryMethodDetailPage({
  params,
}: LegendaryMethodDetailPageProps) {
  const { slug } = await params;
  const published = getLegendaryMethodDetail(slug);
  const draft = getLegendaryMethodBySlug(slug);
  const profile = published ?? draft;

  if (!profile || !canServeLegendaryMethodProfile(profile.status)) {
    notFound();
  }

  const isPublished = profile.status === "published";
  const dateModified =
    profile.lastReviewedAt ?? profile.updatedAt ?? profile.publishedAt;
  const jsonLd = isPublished
    ? [
        articleJsonLd({
          headline: profile.profileTitle,
          description: profile.summary || profile.seo.description,
          path: profile.seo.canonicalPath,
          datePublished: profile.publishedAt,
          dateModified,
          image: absoluteUrl(LEGENDARY_METHODS_OG_IMAGE_PATH),
        }),
        breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Legendary Methods", path: "/legendary-methods" },
          { name: profile.athleteName, path: profile.seo.canonicalPath },
        ]),
      ]
    : null;

  return (
    <div className="bg-[var(--color-background)]">
      {jsonLd ? <JsonLdScript data={jsonLd} /> : null}
      <MarketingContainer>
        <LegendaryProfileOpenedBeacon slug={profile.slug} />
        {!isPublished ? (
          <p
            className="mb-6 border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-muted)]"
            role="status"
          >
            Draft preview (ALLOW_LEGENDARY_DRAFT_PREVIEW) — noindex, excluded from
            sitemap and public library cards.
          </p>
        ) : null}
        <LegendaryMethodProfileTemplate profile={profile} />
      </MarketingContainer>
    </div>
  );
}
