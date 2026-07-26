import type { Metadata } from "next";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ProgramListingPreviewPanel } from "@/components/program-marketplace/ProgramListingPreviewPanel";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Alert } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { auth } from "@/auth";
import { getProgramMarketplaceListingPreview } from "@/services/program-marketplace";

type Props = { params: Promise<{ listingId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { listingId } = await params;
  return {
    title: "Program preview",
    robots: { index: false, follow: false },
    alternates: { canonical: `/programs/marketplace/${listingId}` },
  };
}

export default async function ProgramMarketplacePreviewPage({ params }: Props) {
  const { listingId } = await params;

  if (!featureFlags.programMarketplace) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Program preview"
          description="Program Marketplace is not enabled."
        />
      </MarketingContainer>
    );
  }

  const session = await auth();
  const result = await getProgramMarketplaceListingPreview({
    listingId,
    viewerUserId: session?.user?.id ?? null,
  });

  return (
    <MarketingContainer>
      <div className="mx-auto max-w-3xl py-12">
        <p className="mb-6 text-sm">
          <Link
            href="/programs/marketplace"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            ← Back to marketplace
          </Link>
        </p>
        {result.ok ? (
          <ProgramListingPreviewPanel
            listing={result.listing}
            viewerHasPurchase={result.viewerHasPurchase}
            canRate={result.canRate}
            honesty={result.honesty}
            copyrightProtection={result.copyrightProtection}
            isSignedIn={Boolean(session?.user?.id)}
          />
        ) : (
          <Alert tone="warning" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </div>
    </MarketingContainer>
  );
}
