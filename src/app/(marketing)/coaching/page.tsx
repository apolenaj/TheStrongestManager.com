import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { MarketplaceBrowse } from "@/components/marketplace/MarketplaceBrowse";
import { getMarketplacePublicState } from "@/services/marketplace/marketplace-service";

export const metadata: Metadata = {
  title: "Coaching",
  description:
    "Premium human coaching marketplace for TheStrongestManager — real coaches only when published.",
  alternates: { canonical: "/coaching" },
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
