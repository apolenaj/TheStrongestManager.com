import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ProgramMarketplaceBrowse } from "@/components/program-marketplace/ProgramMarketplaceBrowse";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { ButtonLink } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { browseProgramMarketplace } from "@/services/program-marketplace";

export const metadata: Metadata = {
  title: "Program marketplace",
  description:
    "Browse training programs by sport, goal, duration, difficulty, and equipment. Ratings from verified purchasers only.",
  alternates: { canonical: "/programs/marketplace" },
};

export default async function ProgramMarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{
    sport?: string;
    goal?: string;
    difficulty?: string;
  }>;
}) {
  if (!featureFlags.programMarketplace) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Program marketplace"
          description="The program marketplace is not enabled yet."
        />
      </MarketingContainer>
    );
  }

  const params = await searchParams;
  const view = await browseProgramMarketplace({
    sport: params.sport,
    goal: params.goal,
    difficulty: params.difficulty,
  });

  return (
    <MarketingContainer>
      <div className="mx-auto grid max-w-3xl gap-8 py-12">
        <header className="grid gap-3">
          <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
            Programs
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
            TheStrongest
          </h1>
          <p className="text-lg text-[var(--color-muted)]">
            Training program marketplace — preview, sport, goal, duration,
            difficulty, equipment. Ratings only from verified purchasers.
          </p>
          <div>
            <ButtonLink href="/app/program-marketplace" variant="secondary">
              Creator publish hub
            </ButtonLink>
          </div>
        </header>
        <ProgramMarketplaceBrowse view={view} />
      </div>
    </MarketingContainer>
  );
}
