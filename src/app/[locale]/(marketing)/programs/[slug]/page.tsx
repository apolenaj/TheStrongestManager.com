import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getLocale, getTranslations } from "next-intl/server";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { ProgramDetailExperience } from "@/components/programs/ProgramDetailExperience";
import { PROGRAM_CATALOG_SEED } from "@/domain/program-catalog/catalog";
import { getProgramFamilyContent } from "@/domain/program-catalog/content";
import {
  getPublicProgramBySlug,
  listPublicProgramCatalog,
} from "@/services/program-catalog";

export const revalidate = 3600;

type ProgramDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return PROGRAM_CATALOG_SEED.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: ProgramDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const t = await getTranslations("ProgramsPage");
  const result = await getPublicProgramBySlug(slug);
  if (!result.ok) {
    return { title: t("meta.title") };
  }
  const content = getProgramFamilyContent(result.program.familyId, locale);
  const displayName = content?.displayName ?? result.program.name;
  const isFree = result.program.isFree;
  const title = isFree
    ? locale === "cs"
      ? `${displayName} — Powerlifting program zdarma`
      : `${displayName} — Free Powerlifting Training Program`
    : locale === "cs"
      ? `${displayName} — Powerlifting tréninkový program`
      : `${displayName} — Powerlifting Training Program`;
  const description =
    content?.tagline ??
    result.program.description ??
    (locale === "cs"
      ? `${displayName}: strukturovaný program silového trojboje s jasnou progresí.`
      : `${displayName}: a structured powerlifting training program with clear progression.`);
  const canonical = `/programs/${result.program.slug}`;
  return {
    title,
    description,
    keywords: [
      locale === "cs" ? "programy silového trojboje" : "powerlifting training programs",
      displayName.toLowerCase(),
      isFree
        ? locale === "cs"
          ? "powerlifting program zdarma"
          : "free powerlifting program"
        : locale === "cs"
          ? "placený powerlifting program"
          : "paid powerlifting program",
      locale === "cs" ? "silový tréninkový program" : "strength training program",
    ],
    alternates: { canonical },
    openGraph: {
      title: `${title} | The Strongest`,
      description,
      url: canonical,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | The Strongest`,
      description,
    },
  };
}

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;

  // Reserve static segments under /programs/*
  if (
    slug === "marketplace" ||
    slug === "find-my-program" ||
    slug === "start"
  ) {
    notFound();
  }

  const result = await getPublicProgramBySlug(slug);
  if (!result.ok) {
    notFound();
  }

  const catalog = await listPublicProgramCatalog({});
  const familyId = result.program.familyId;
  const siblings = catalog.ok
    ? catalog.programs.filter(
        (p) =>
          p.familyId &&
          p.familyId === familyId &&
          p.slug !== result.program.slug,
      )
    : [];

  const siblingFree = siblings.find((p) => p.isFree) ?? null;
  const siblingPaid = siblings.find((p) => !p.isFree) ?? null;

  return (
    <>
      <AnalyticsBeacon
        name="program_viewed"
        productSlug={result.program.slug}
        isFree={result.program.isFree}
      />
      <ProgramDetailExperience
        program={result.program}
        siblingFree={siblingFree}
        siblingPaid={siblingPaid}
      />
    </>
  );
}
