import Link from "next/link";
import { Alert, Badge, EmptyState } from "@/design-system";
import {
  PROGRAM_MARKETPLACE_DIFFICULTIES,
  PROGRAM_MARKETPLACE_DIFFICULTY_LABELS,
  PROGRAM_MARKETPLACE_GOALS,
  PROGRAM_MARKETPLACE_GOAL_LABELS,
  PROGRAM_MARKETPLACE_SPORTS,
  PROGRAM_MARKETPLACE_SPORT_LABELS,
} from "@/domain/program-marketplace";
import type { ProgramMarketplaceBrowseView } from "@/services/program-marketplace";
import { ComingSoon } from "@/components/ui/ComingSoon";

export function ProgramMarketplaceBrowse({
  view,
}: {
  view: ProgramMarketplaceBrowseView;
}) {
  if (view.showComingSoon) {
    return (
      <div className="grid gap-6">
        <ComingSoon
          title="Program marketplace"
          description="Training programs will appear here when approved creators publish listings that pass copyright review. None are listed yet."
          reason="We never invent marketplace programs or fake ratings."
        />
        <Alert tone="info" title="How it works">
          Browse by sport, goal, duration, difficulty, and equipment. Ratings
          come only from verified purchasers. Platform commission is ledgered
          as an estimate — not a live bank payout.
        </Alert>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {view.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Verified ratings only">
        {view.honesty[1]} Platform commission architecture uses a ledger
        estimate ({view.honesty[2]}).
      </Alert>

      <form className="flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="grid gap-1">
          <span className="text-xs text-[var(--color-muted)]">Sport</span>
          <select
            name="sport"
            defaultValue={view.filters.sport ?? ""}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          >
            <option value="">All sports</option>
            {PROGRAM_MARKETPLACE_SPORTS.map((s) => (
              <option key={s} value={s}>
                {PROGRAM_MARKETPLACE_SPORT_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-[var(--color-muted)]">Goal</span>
          <select
            name="goal"
            defaultValue={view.filters.goal ?? ""}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          >
            <option value="">All goals</option>
            {PROGRAM_MARKETPLACE_GOALS.map((g) => (
              <option key={g} value={g}>
                {PROGRAM_MARKETPLACE_GOAL_LABELS[g]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-[var(--color-muted)]">Difficulty</span>
          <select
            name="difficulty"
            defaultValue={view.filters.difficulty ?? ""}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          >
            <option value="">All levels</option>
            {PROGRAM_MARKETPLACE_DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {PROGRAM_MARKETPLACE_DIFFICULTY_LABELS[d]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-3 py-2"
        >
          Filter
        </button>
      </form>

      {view.listings.length === 0 ? (
        <EmptyState
          title="No programs match this filter"
          description="Try clearing filters — we do not invent filler listings."
        />
      ) : (
        <ul className="grid gap-4">
          {view.listings.map((listing) => (
            <li key={listing.id}>
              <Link
                href={`/programs/marketplace/${listing.id}`}
                className="block rounded-[var(--radius-md)] border border-[var(--color-border)] p-5 transition hover:border-[var(--color-accent)]"
              >
                <div className="flex flex-wrap gap-2">
                  <Badge variant="accent">{listing.sportLabel}</Badge>
                  <Badge variant="neutral">{listing.goalLabel}</Badge>
                  <Badge variant="neutral">{listing.difficultyLabel}</Badge>
                  <Badge variant="neutral">
                    {listing.durationWeeks} weeks
                  </Badge>
                </div>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl">
                  {listing.title}
                </h2>
                <p className="mt-2 text-sm text-[var(--color-muted)] line-clamp-3">
                  {listing.preview}
                </p>
                <p className="mt-3 text-sm text-[var(--color-muted)]">
                  By {listing.creatorDisplay}
                  {listing.ratingCount > 0
                    ? ` · ${listing.averageStars}★ (${listing.ratingCount} verified)`
                    : " · No verified ratings yet"}
                </p>
                <p className="mt-2 text-sm font-medium">
                  ${(listing.priceCents / 100).toFixed(2)} {listing.currency}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
