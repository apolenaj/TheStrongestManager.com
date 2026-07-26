import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { YearInReviewDeck } from "@/components/year-in-review/YearInReviewDeck";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { ButtonLink, EmptyState } from "@/design-system";
import { featureFlags } from "@/config/feature-flags";
import { requireSession } from "@/services/auth/session";
import { getYearInReview } from "@/services/year-in-review";

export const metadata: Metadata = {
  title: "Year in Review",
  robots: { index: false, follow: false },
};

export default async function YearInReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const session = await requireSession();
  const params = await searchParams;
  const yearRaw = params.year ? Number(params.year) : undefined;
  const year =
    yearRaw != null && Number.isFinite(yearRaw) ? yearRaw : undefined;

  if (!featureFlags.yearInReview) {
    return (
      <AppPage
        eyebrow="Almanac"
        title="Year in Review"
        description="Annual athlete report with shareable cards."
      >
        <ComingSoon
          title="Year in Review"
          description="Sessions, PRs, technique, top exercises, consistency, competition — shareable cards."
          reason="Set NEXT_PUBLIC_FF_YEAR_IN_REVIEW=true to enable."
        />
      </AppPage>
    );
  }

  const view = await getYearInReview({
    userId: session.user.id,
    year,
  });

  if (!view) {
    return (
      <AppPage
        eyebrow="Almanac"
        title="Year in Review"
        description="Annual athlete report with shareable cards."
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding before Year in Review can be built."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const y = Number(view.report.yearKey);

  return (
    <AppPage
      eyebrow="Almanac"
      title="Year in Review"
      description="Your annual training ledger — high energy, honest numbers, shareable cards."
    >
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
        <ButtonLink
          href={`/app/year-in-review?year=${y - 1}`}
          variant="secondary"
          size="sm"
        >
          {y - 1}
        </ButtonLink>
        <span className="font-medium">{view.report.yearKey}</span>
        <ButtonLink
          href={`/app/year-in-review?year=${y + 1}`}
          variant="secondary"
          size="sm"
        >
          {y + 1}
        </ButtonLink>
      </div>
      <YearInReviewDeck report={view.report} sharePath={view.sharePath} />
    </AppPage>
  );
}
