import Link from "next/link";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import {
  LEADERBOARD_CATEGORY_OPTIONS,
  type LeaderboardBoard,
  type LeaderboardCategoryId,
  type LeaderboardFilters,
} from "@/domain/leaderboard";

function categoryHref(
  id: LeaderboardCategoryId,
  filters: LeaderboardFilters,
): string {
  const params = new URLSearchParams({ category: id });
  if (filters.countryCode) params.set("country", filters.countryCode);
  if (filters.sport) params.set("sport", filters.sport);
  if (filters.bodyweightClassMaxKg != null) {
    params.set("classKg", String(filters.bodyweightClassMaxKg));
  }
  if (filters.verification) params.set("verification", filters.verification);
  return `/app/leaderboards?${params.toString()}`;
}

function verificationVariant(
  label: string | null,
): "neutral" | "info" | "accent" | "warning" {
  if (label === "Competition verified") return "accent";
  if (label === "Video verified") return "info";
  if (label === "Self-reported") return "warning";
  return "neutral";
}

export function LeaderboardBoardPanel({
  board,
  category,
  filters,
}: {
  board: LeaderboardBoard;
  category: LeaderboardCategoryId;
  filters: LeaderboardFilters;
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2">
        {LEADERBOARD_CATEGORY_OPTIONS.map((opt) => (
          <Link
            key={opt.id}
            href={categoryHref(opt.id, filters)}
            className={`rounded-md border px-3 py-1.5 text-sm transition ${
              category === opt.id
                ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                : "border-[var(--color-border)] text-[var(--color-muted)]"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap items-end gap-3 text-sm" method="get">
        <input type="hidden" name="category" value={category} />
        <label className="grid gap-1">
          <span className="text-xs text-[var(--color-muted)]">Country</span>
          <input
            name="country"
            defaultValue={filters.countryCode ?? ""}
            placeholder="US"
            maxLength={2}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-[var(--color-muted)]">Sport</span>
          <input
            name="sport"
            defaultValue={filters.sport ?? ""}
            placeholder="powerlifting"
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-[var(--color-muted)]">Class kg</span>
          <input
            name="classKg"
            defaultValue={filters.bodyweightClassMaxKg ?? ""}
            placeholder="83"
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-xs text-[var(--color-muted)]">Verification</span>
          <select
            name="verification"
            defaultValue={filters.verification ?? ""}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
          >
            <option value="">All</option>
            <option value="competition_verified">Competition verified</option>
            <option value="video_verified">Video verified</option>
            <option value="self_reported">Self-reported</option>
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border-strong)] px-3 py-1.5"
        >
          Apply filters
        </button>
      </form>

      <Card elevated>
        <CardHeader>
          <CardTitle className="text-xl tracking-tight">{board.title}</CardTitle>
          <CardDescription>
            Opt-in only. Verification labels are always shown for lift boards.
          </CardDescription>
        </CardHeader>

        {board.rows.length === 0 ? (
          <EmptyState
            title="No rankings yet"
            description={
              board.emptyReason ??
              "Not enough opted-in athletes with real data for this board."
            }
          />
        ) : (
          <ol className="grid gap-2">
            {board.rows.map((row) => (
              <li
                key={`${row.athleteProfileId}-${row.rank}-${row.valueLabel}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-[var(--color-border)] px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="font-[family-name:var(--font-display)] text-xl tabular-nums tracking-tight">
                    #{row.rank}
                  </span>
                  <div>
                    <p className="font-medium">{row.displayLabel}</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {row.valueLabel}
                      {row.meta ? ` · ${row.meta}` : ""}
                    </p>
                  </div>
                </div>
                {row.verificationLabel ? (
                  <Badge variant={verificationVariant(row.verificationLabel)}>
                    {row.verificationLabel}
                  </Badge>
                ) : null}
              </li>
            ))}
          </ol>
        )}
      </Card>

      <ul className="grid gap-1 text-xs text-[var(--color-muted)]">
        {board.safetyNotes.map((n, i) => (
          <li key={i}>{n}</li>
        ))}
      </ul>
    </div>
  );
}
