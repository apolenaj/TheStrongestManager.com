import type { Metadata } from "next";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { CoachMatchingPanel } from "@/components/coach-matching/CoachMatchingPanel";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { featureFlags } from "@/config/feature-flags";
import { COACH_MATCHING_HONESTY } from "@/domain/coach-matching";
import {
  matchCoaches,
  parseMatchPreferences,
} from "@/services/coach-matching";

export const metadata: Metadata = {
  title: "Find a coach",
  description:
    "Match with coaches by goal, sport, experience, budget, language, location, and coaching style.",
  alternates: { canonical: "/coaching/match" },
};

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function CoachMatchPage({ searchParams }: Props) {
  if (!featureFlags.coachMatching) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Coach matching"
          description="Matching will appear when this feature is enabled."
        />
      </MarketingContainer>
    );
  }

  const params = await searchParams;
  const submitted = Boolean(
    params.goal || params.sport || params.experience || params.coachingStyle,
  );
  const preferences = parseMatchPreferences(params);
  const view = submitted
    ? await matchCoaches(preferences)
    : {
        honesty: COACH_MATCHING_HONESTY,
        preferences,
        organic: [],
        sponsored: [],
        empty: true,
      };

  return (
    <MarketingContainer>
      <div className="mb-8">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Coaching
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
          Find a coach
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--color-muted)]">
          Top matches with clear reasons — never ranked by unpaid-vs-paid
          placement unless labeled Sponsored.
        </p>
      </div>
      <CoachMatchingPanel view={view} submitted={submitted} />
    </MarketingContainer>
  );
}
