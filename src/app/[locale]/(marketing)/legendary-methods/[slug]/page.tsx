import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
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
import { resolveLegendaryProfile } from "@/domain/legendary-methods/resolve-profile";
import { resolveLocale } from "@/domain/legendary-methods/localized";
import { articleJsonLd, breadcrumbJsonLd } from "@/domain/seo";
import { absoluteUrl } from "@/config/site";

type LegendaryMethodDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
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
  const { slug, locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const published = getLegendaryMethodDetail(slug);
  if (published) {
    const resolved = resolveLegendaryProfile(published, locale);
    const canonical = resolved.seo.canonicalPath;
    const modified =
      published.lastReviewedAt ?? published.updatedAt ?? published.publishedAt;
    const social = legendaryMethodsSocialMetadata({
      title: resolved.seo.title,
      description: resolved.seo.description,
      path: canonical,
      type: "article",
      publishedTime: published.publishedAt,
      modifiedTime: modified,
    });
    return {
      title: resolved.seo.title,
      description: resolved.seo.description,
      keywords: resolved.seo.keywords,
      alternates: { canonical },
      ...social,
      authors: [{ name: "Josef" }, { name: "The Strongest editorial team" }],
      robots: { index: true, follow: true },
    };
  }

  const draft = getLegendaryMethodBySlug(slug);
  if (!draft || !canServeLegendaryMethodProfile(draft.status)) {
    const t = await getTranslations("LegendaryMethods.notFound");
    return { title: t("title"), robots: { index: false, follow: false } };
  }

  const resolvedDraft = resolveLegendaryProfile(draft, locale);
  return {
    title: resolvedDraft.seo.title,
    description: resolvedDraft.seo.description,
    robots: { index: false, follow: false },
  };
}

export default async function LegendaryMethodDetailPage({
  params,
}: LegendaryMethodDetailPageProps) {
  const { slug, locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const t = await getTranslations("LegendaryMethods");
  const published = getLegendaryMethodDetail(slug);
  const draft = getLegendaryMethodBySlug(slug);
  const profile = published ?? draft;

  if (!profile || !canServeLegendaryMethodProfile(profile.status)) {
    notFound();
  }

  const resolved = resolveLegendaryProfile(profile, locale);
  const isPublished = profile.status === "published";
  const dateModified =
    profile.lastReviewedAt ?? profile.updatedAt ?? profile.publishedAt;
  const jsonLd = isPublished
    ? [
        articleJsonLd({
          headline: resolved.profileTitle,
          description: resolved.summary || resolved.seo.description,
          path: resolved.seo.canonicalPath,
          datePublished: profile.publishedAt,
          dateModified,
          image: absoluteUrl(LEGENDARY_METHODS_OG_IMAGE_PATH),
        }),
        breadcrumbJsonLd([
          { name: t("profile.home"), path: "/" },
          { name: t("profile.library"), path: "/legendary-methods" },
          { name: resolved.athleteName, path: resolved.seo.canonicalPath },
        ]),
      ]
    : null;

  return (
    <div className="bg-[var(--color-background)]">
      {jsonLd ? <JsonLdScript data={jsonLd} /> : null}
      <MarketingContainer className="py-16 sm:py-24">
        <LegendaryProfileOpenedBeacon slug={resolved.slug} />
        {!isPublished ? (
          <p
            className="mb-8 border border-white/10 bg-[var(--color-surface)] px-4 py-3 text-sm leading-relaxed text-[var(--color-muted)]"
            role="status"
          >
            {t("profile.draftPreview")}
          </p>
        ) : null}
        <LegendaryMethodProfileTemplate profile={resolved} />
      </MarketingContainer>
    </div>
  );
}
