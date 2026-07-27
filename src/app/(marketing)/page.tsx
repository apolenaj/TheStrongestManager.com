import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { HomeAbout } from "@/components/marketing/HomeAbout";
import { HomeFinalCta } from "@/components/marketing/HomeFinalCta";
import { HomeHero } from "@/components/marketing/HomeHero";
import { HomePillars } from "@/components/marketing/HomePillars";
import { HomeTrainingApproach } from "@/components/marketing/HomeTrainingApproach";
import { siteConfig } from "@/config/site";
import { homeCopy } from "@/lib/content/home";

/**
 * Metadata is intentionally fixed for all traffic intents (anti-cloaking).
 * Soft hero support may vary via ?intent= — title/description/canonical do not.
 */
const pageDescription = homeCopy.heroSupport;

export const metadata: Metadata = {
  title: {
    absolute: `${homeCopy.brand} — Od hrubé síly k absolutnímu leadershipu.`,
  },
  description: pageDescription,
  alternates: { canonical: "/" },
  openGraph: {
    title: homeCopy.brand,
    description: pageDescription,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: homeCopy.brand,
    description: pageDescription,
  },
};

function orgJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: homeCopy.brand,
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
  const { resolvePersonalizedHomepageVariant } = await import(
    "@/services/personalized-homepage"
  );
  const variant = resolvePersonalizedHomepageVariant(params);

  return (
    <>
      <AnalyticsBeacon name="homepage_viewed" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }}
      />
      <HomeHero
        primaryCtaLabel={homeCopy.ctaPrimary}
        heroSupport={
          variant.intentId === "default"
            ? homeCopy.heroSupport
            : variant.heroSupport
        }
        secondaryHref="/methods"
        secondaryLabel={homeCopy.ctaSecondary}
      />
      <HomeAbout />
      <HomePillars />
      <HomeTrainingApproach />
      <HomeFinalCta />
    </>
  );
}
