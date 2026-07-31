import type { Metadata } from "next";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PageIntro } from "@/components/ui/PageIntro";
import { ButtonLink } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import {
  evaluateSportGoalLandingQuality,
  SPORT_GOAL_LANDINGS,
} from "@/domain/sport-goal-landings";

export const metadata: Metadata = {
  title: "Training goals",
  description:
    "High-quality sport and goal landings that link into real product features — improve deadlift, chest, powerlifting, strongman. No generic SEO filler.",
  alternates: { canonical: "/goals" },
};

export default function SportGoalsIndexPage() {
  const pages = featureFlags.sportGoalLandings
    ? SPORT_GOAL_LANDINGS.filter(
        (p) => evaluateSportGoalLandingQuality(p).passed,
      )
    : [];

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Goals"
        title="Train toward a clear goal"
        description="Each landing links into actual product features — exercises, modes, programs, technique, and Today. We refuse generic SEO filler."
      />
      <ul className="mt-10 max-w-2xl space-y-8">
        {pages.map((page) => (
          <li key={page.slug} className="border-t border-[var(--color-border)] pt-6">
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              {page.goalLabel}
            </p>
            <Link
              href={`/goals/${page.slug}`}
              className="mt-2 block font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight underline-offset-4 hover:underline"
            >
              {page.title}
            </Link>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              {page.description}
            </p>
            <div className="mt-4">
              <ButtonLink href={`/goals/${page.slug}`} variant="secondary" size="md">
                Open landing
              </ButtonLink>
            </div>
          </li>
        ))}
      </ul>
    </MarketingContainer>
  );
}
