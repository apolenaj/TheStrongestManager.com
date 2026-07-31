import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { MarketplaceBrowse } from "@/components/marketplace/MarketplaceBrowse";
import { getMarketplacePublicState } from "@/services/marketplace/marketplace-service";

export const metadata: Metadata = {
  title: "Online Powerlifting Coach Marketplace",
  description:
    "Find online powerlifting coaching and premium 1:1 support — real coaches when published, with an honest application flow.",
  keywords: [
    "online powerlifting coach",
    "powerlifting coaching",
    "1:1 strength coach",
  ],
  alternates: { canonical: "/coaching" },
  openGraph: {
    title: "Online Powerlifting Coach Marketplace",
    description:
      "Browse coaching options and apply for 1:1 premium coaching — acceptance is never promised on submit.",
    url: "/coaching",
    type: "website",
  },
};

export default async function CoachingPage({
  searchParams,
}: {
  searchParams: Promise<{ sport?: string }>;
}) {
  const params = await searchParams;
  const state = await getMarketplacePublicState(params.sport);

  return (
    <MarketingContainer>
      <MarketplaceBrowse state={state} />
    </MarketingContainer>
  );
}
