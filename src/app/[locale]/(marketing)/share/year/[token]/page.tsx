import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import {
  YEAR_IN_REVIEW_CARD_LABELS,
  type YearInReviewCardKind,
} from "@/domain/year-in-review";
import { getYearInReviewShareByToken } from "@/services/year-in-review";
import "@/components/year-in-review/year-in-review.css";

type Props = { params: Promise<{ token: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Year in Review",
    robots: { index: false, follow: false },
  };
}

export default async function YearInReviewSharePage({ params }: Props) {
  const { token } = await params;
  const payload = await getYearInReviewShareByToken(token);
  if (!payload) notFound();

  return (
    <main className="yir-root mx-auto min-h-screen max-w-lg px-4 py-12">
      <p className="yir-kicker">{siteConfig.name}</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold text-[var(--color-foreground)]">
        {payload.yearLabel}
      </h1>
      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {payload.athleteDisplayName}
      </p>

      <ol className="mt-10 space-y-6">
        {payload.cards.map((card, i) => (
          <li key={`${card.kind}-${i}`} className="yir-stage p-6">
            <p className="yir-kicker relative z-[1]">
              {YEAR_IN_REVIEW_CARD_LABELS[card.kind as YearInReviewCardKind]}
            </p>
            <p className="yir-headline relative z-[1] mt-4 text-[clamp(2.5rem,10vw,4rem)]">
              {card.headline}
            </p>
            {card.subline ? (
              <p className="yir-sub relative z-[1] mt-3">{card.subline}</p>
            ) : null}
            {card.stats.length > 0 ? (
              <ul className="relative z-[1] mt-6 space-y-3">
                {card.stats.map((s) => (
                  <li key={`${s.label}-${s.value}`} className="yir-stat">
                    <p className="yir-stat-label">{s.label}</p>
                    <p className="yir-stat-value">{s.value}</p>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>

      <p className="mt-8 text-sm text-[var(--color-muted)]">
        {payload.honestyNote}
      </p>
      <p className="mt-6 text-sm">
        <Link href="/" className="yir-link underline-offset-2 hover:underline">
          {siteConfig.domain}
        </Link>
      </p>
    </main>
  );
}
