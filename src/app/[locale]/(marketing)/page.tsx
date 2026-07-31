import type { Metadata } from "next";
import { AnalyticsBeacon } from "@/components/analytics/AnalyticsBeacon";
import { HomeAboutPreview } from "@/components/marketing/HomeAboutPreview";
import { HomeCoachingOptions } from "@/components/marketing/HomeCoachingOptions";
import { HomeCoachingProcess } from "@/components/marketing/HomeCoachingProcess";
import { HomeConversionCta } from "@/components/marketing/HomeConversionCta";
import { HomeGoalCards } from "@/components/marketing/HomeGoalCards";
import { HomeHero } from "@/components/marketing/HomeHero";
import { HomeKnowledgeHub } from "@/components/marketing/HomeKnowledgeHub";
import { HomeLegendaryMethods } from "@/components/marketing/HomeLegendaryMethods";
import { HomeMethodFinder } from "@/components/marketing/HomeMethodFinder";
import { HomePlatformPreview } from "@/components/marketing/HomePlatformPreview";
import { HomeProof } from "@/components/marketing/HomeProof";
import { HomeStrengthAuditPreview } from "@/components/marketing/HomeStrengthAuditPreview";
import { siteConfig } from "@/config/site";
import { homeCopy } from "@/lib/content/home";

/**
 * Metadata is intentionally fixed for all traffic intents (anti-cloaking).
 */
const pageTitle =
  "Online Powerlifting Coach & Program Tools | The Strongest";
const pageDescription =
  "Structured powerlifting coaching, free strength audits, technique feedback, and evidence-led training tools for serious lifters who refuse to guess.";

export const metadata: Metadata = {
  title: {
    absolute: pageTitle,
  },
  description: pageDescription,
  keywords: [
    "online powerlifting coach",
    "powerlifting program",
    "powerlifting coaching",
    "strength audit",
    "technique feedback",
    "IPF powerlifting",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "/",
    type: "website",
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
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

/**
 * Homepage funnel:
 * Phase 3 — Hero → Goals → Strength Audit Preview
 * Phase 4 — Knowledge Hub → Legendary Methods → Method Finder → Coaching → Platform → Proof
 * Phase 5 — About Josef → Coaching Options → Final CTA
 */
export default function HomePage() {
  return (
    <>
      <AnalyticsBeacon name="homepage_viewed" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd()) }}
      />
      <HomeHero />
      <HomeGoalCards />
      <HomeStrengthAuditPreview />
      <HomeKnowledgeHub />
      <HomeLegendaryMethods />
      <HomeMethodFinder />
      <HomeCoachingProcess />
      <HomePlatformPreview />
      <HomeProof />
      <HomeAboutPreview />
      <HomeCoachingOptions />
      <HomeConversionCta />
    </>
  );
}
