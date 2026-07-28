import {
  LEGENDARY_METHOD_SPORT_LABELS,
  type LegendaryMethodSport,
} from "@/domain/legendary-methods";

/**
 * Original abstract sport-category mark — no photos, logos, or trademarks.
 */
export function SportCategoryMark({
  sport,
  className,
}: {
  sport: LegendaryMethodSport;
  className?: string;
}) {
  const label = LEGENDARY_METHOD_SPORT_LABELS[sport];

  return (
    <div
      className={
        className ??
        "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]"
      }
      role="img"
      aria-label={`${label} abstract graphic`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(183,255,42,0.12),transparent_55%),linear-gradient(145deg,var(--color-surface-elevated)_0%,var(--color-background)_100%)]"
      />
      <svg
        viewBox="0 0 120 90"
        className="relative h-16 w-auto text-[var(--color-accent)] sm:h-20"
        aria-hidden
      >
        {sport === "bodybuilding" ? (
          <>
            <rect
              x="28"
              y="22"
              width="18"
              height="46"
              rx="2"
              fill="currentColor"
              opacity="0.85"
            />
            <rect
              x="52"
              y="14"
              width="16"
              height="62"
              rx="2"
              fill="currentColor"
            />
            <rect
              x="74"
              y="22"
              width="18"
              height="46"
              rx="2"
              fill="currentColor"
              opacity="0.85"
            />
          </>
        ) : null}
        {sport === "strongman" ? (
          <>
            <circle cx="60" cy="48" r="22" fill="currentColor" opacity="0.2" />
            <rect
              x="18"
              y="42"
              width="84"
              height="10"
              rx="2"
              fill="currentColor"
            />
            <circle cx="24" cy="47" r="10" fill="currentColor" />
            <circle cx="96" cy="47" r="10" fill="currentColor" />
          </>
        ) : null}
        {sport === "powerlifting" ? (
          <>
            <path
              d="M20 70 L60 18 L100 70 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinejoin="round"
            />
            <circle cx="60" cy="48" r="8" fill="currentColor" />
          </>
        ) : null}
      </svg>
      <span className="absolute bottom-3 left-3 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
        {label}
      </span>
    </div>
  );
}
