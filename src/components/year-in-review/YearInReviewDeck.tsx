"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/design-system";
import {
  YEAR_IN_REVIEW_CARD_LABELS,
  type YearInReviewReport,
} from "@/domain/year-in-review";
import {
  createYearInReviewShareAction,
  type YearInReviewActionState,
} from "@/services/year-in-review/actions";
import "@/components/year-in-review/year-in-review.css";

const initial: YearInReviewActionState = { ok: false };

/**
 * Annual report card deck — high energy, original “iron almanac” look.
 * Not a streaming-app clone.
 */
export function YearInReviewDeck({
  report,
  sharePath,
}: {
  report: YearInReviewReport;
  sharePath: string | null;
}) {
  const [index, setIndex] = useState(0);
  const [state, action, pending] = useActionState(
    createYearInReviewShareAction,
    initial,
  );
  const latestShare = state.sharePath ?? sharePath;
  const card = report.cards[index]!;
  const total = report.cards.length;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, total - 1));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [total]);

  return (
    <div className="yir-root space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="yir-kicker">Iron Almanac</p>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {report.yearLabel} · {report.athleteDisplayName}
          </p>
        </div>
        <form action={action} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="year" value={report.yearKey} />
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? "Creating…" : "Share cards"}
          </Button>
        </form>
      </div>

      {state.error ? (
        <p className="text-sm text-[var(--color-warning)]">{state.error}</p>
      ) : null}
      {latestShare ? (
        <p className="text-sm text-[var(--color-muted)]">
          Share link:{" "}
          <Link
            href={latestShare}
            className="yir-link underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {latestShare}
          </Link>
        </p>
      ) : null}

      <div
        className="yir-stage flex flex-col justify-between p-6 sm:p-10"
        role="region"
        aria-roledescription="carousel"
        aria-label="Year in Review cards"
      >
        <div className="relative z-[1]">
          <p className="yir-kicker">
            {YEAR_IN_REVIEW_CARD_LABELS[card.kind]} · {index + 1}/{total}
          </p>
          <p className="yir-headline mt-6" key={card.id}>
            {card.headline}
          </p>
          {card.subline ? (
            <p className="yir-sub mt-5">{card.subline}</p>
          ) : null}
          {card.empty ? (
            <p className="mt-4 text-sm text-[var(--yir-steel)]">
              Nothing invented here — log more to fill this card next year.
            </p>
          ) : null}
          {card.stats.length > 0 ? (
            <ul className="mt-8 max-w-md space-y-3">
              {card.stats.map((s) => (
                <li key={`${s.label}-${s.value}`} className="yir-stat">
                  <p className="yir-stat-label">{s.label}</p>
                  <p className="yir-stat-value">{s.value}</p>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className="relative z-[1] mt-10 space-y-4">
          <div
            className="yir-progress"
            role="progressbar"
            aria-valuenow={index + 1}
            aria-valuemin={1}
            aria-valuemax={total}
            aria-label="Card progress"
          >
            <span style={{ width: `${((index + 1) / total) * 100}%` }} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIndex((i) => Math.max(i - 1, 0))}
              disabled={index === 0}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
              disabled={index >= total - 1}
            >
              Next
            </Button>
          </div>
          <p className="text-xs text-[var(--yir-steel)]">
            Arrow keys or space to advance.
          </p>
        </div>
      </div>

      <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--color-muted)]">
        {report.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
