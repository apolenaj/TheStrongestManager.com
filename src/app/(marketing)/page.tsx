import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { HomeHero } from "@/components/marketing/HomeHero";
import { HomePillars } from "@/components/marketing/HomePillars";
import { siteConfig } from "@/config/site";
import { homeCopy } from "@/lib/content/home";

/**
 * Metadata is intentionally fixed for all traffic intents (anti-cloaking).
 * Soft hero support may vary via ?intent= — title/description/canonical do not.
 */
const pageDescription = homeCopy.heroSupport;

export const metadata: Metadata = {
  title: {
    absolute: `${siteConfig.name} — Upload a lift. See what needs work.`,
  },
  description: pageDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: siteConfig.name,
    description: pageDescription,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: pageDescription,
  },
};

const HomeAthleteIntelligence = dynamic(() =>
  import("@/components/marketing/HomeAthleteIntelligence").then(
    (m) => m.HomeAthleteIntelligence,
  ),
);
const HomeTechnique = dynamic(() =>
  import("@/components/marketing/HomeTechnique").then((m) => m.HomeTechnique),
);
const HomeAdaptiveTraining = dynamic(() =>
  import("@/components/marketing/HomeAdaptiveTraining").then(
    (m) => m.HomeAdaptiveTraining,
  ),
);
const HomeExerciseIntelligence = dynamic(() =>
  import("@/components/marketing/HomeExerciseIntelligence").then(
    (m) => m.HomeExerciseIntelligence,
  ),
);
const HomeMethodsIntelligence = dynamic(() =>
  import("@/components/marketing/HomeMethodsIntelligence").then(
    (m) => m.HomeMethodsIntelligence,
  ),
);
const HomeAnalytics = dynamic(() =>
  import("@/components/marketing/HomeAnalytics").then((m) => m.HomeAnalytics),
);
const HomeNutrition = dynamic(() =>
  import("@/components/marketing/HomeNutrition").then((m) => m.HomeNutrition),
);
const HomeAudiences = dynamic(() =>
  import("@/components/marketing/HomeAudiences").then((m) => m.HomeAudiences),
);
const HomePricingPreview = dynamic(() =>
  import("@/components/marketing/HomePricingPreview").then(
    (m) => m.HomePricingPreview,
  ),
);
const HomeFaq = dynamic(() =>
  import("@/components/marketing/HomeFaq").then((m) => m.HomeFaq),
);
const HomeFinalCta = dynamic(() =>
  import("@/components/marketing/HomeFinalCta").then((m) => m.HomeFinalCta),
);

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: homeCopy.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    applicationCategory: "SportsApplication",
    operatingSystem: "Web",
    description: pageDescription,
    url: `https://${siteConfig.domain}`,
  };
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{
    intent?: string | string[];
    utm_campaign?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const [{ resolveHomepageCtaLabel }, { resolvePersonalizedHomepageVariant }] =
    await Promise.all([
      import("@/services/growth-experiments"),
      import("@/services/personalized-homepage"),
    ]);
  const [primaryCtaLabel, variant] = await Promise.all([
    resolveHomepageCtaLabel(),
    Promise.resolve(resolvePersonalizedHomepageVariant(params)),
  ]);

  return (
    <>
      <AnalyticsBeacon name="homepage_viewed" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }}
      />
      <HomeHero
        primaryCtaLabel={primaryCtaLabel}
        heroSupport={variant.heroSupport}
        secondaryHref={variant.secondaryHref}
        secondaryLabel={variant.secondaryLabel}
      />
      <HomePillars />
      <HomeAthleteIntelligence />
      <HomeTechnique />
      <HomeAdaptiveTraining />
      <HomeExerciseIntelligence />
      <HomeMethodsIntelligence />
      <HomeAnalytics />
      <HomeNutrition />
      <HomeAudiences />
      <HomePricingPreview />
      <HomeFaq />
      <HomeFinalCta />
    </>
  );
}
