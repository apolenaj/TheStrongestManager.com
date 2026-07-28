import type { LegendaryMethodCategory } from "@/domain/legendary-methods";

/**
 * Original abstract card artwork — barbell / plate / volume geometry only.
 * Never faces, bodies, logos, or trademarks.
 */
export function LegendaryMethodCardArt({
  category,
  title,
  compact = false,
}: {
  category: LegendaryMethodCategory;
  title: string;
  /** Tighter crop for homepage editorial cards. */
  compact?: boolean;
}) {
  const shortLabel =
    title.trim().length > 48 ? `${title.trim().slice(0, 45)}…` : title.trim();

  return (
    <div
      className={
        compact
          ? "relative aspect-[16/8] w-full overflow-hidden border-b border-white/10 bg-[var(--color-surface)] [content-visibility:auto] [contain-intrinsic-size:320px_160px]"
          : "relative aspect-[16/10] w-full overflow-hidden border-b border-white/10 bg-[var(--color-surface)] [content-visibility:auto] [contain-intrinsic-size:320px_200px]"
      }
      role="img"
      aria-label={`Abstract ${shortLabel || category} training graphic`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_-10%,rgba(183,255,42,0.18),transparent_55%),radial-gradient(ellipse_at_100%_115%,rgba(255,255,255,0.05),transparent_60%),linear-gradient(155deg,var(--color-surface-elevated)_0%,var(--color-background)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_-10%,rgba(183,255,42,0.3),transparent_55%)] opacity-0 transition-opacity duration-300 motion-reduce:transition-none group-hover:opacity-100 group-focus-within:opacity-100"
      />
      <svg
        viewBox="0 0 320 200"
        width={320}
        height={200}
        className="absolute inset-0 h-full w-full text-[var(--color-accent)] transition-colors duration-300 motion-reduce:transition-none group-hover:text-[var(--color-accent-hover)]"
        aria-hidden
        focusable="false"
      >
        {category === "bodybuilding" ? <BodybuildingMotif /> : null}
        {category === "strongman" ? <StrongmanMotif /> : null}
        {category === "powerlifting" ? <PowerliftingMotif /> : null}
        {category === "training-system" ? <TrainingSystemMotif /> : null}
      </svg>
      <div aria-hidden className="legendary-card-sheen" />
    </div>
  );
}

function BodybuildingMotif() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2.5">
      {/* Volume bars */}
      <rect x="36" y="48" width="18" height="104" fill="currentColor" opacity="0.2" />
      <rect x="64" y="72" width="18" height="80" fill="currentColor" opacity="0.35" />
      <rect x="92" y="40" width="18" height="112" fill="currentColor" opacity="0.55" />
      <rect x="120" y="56" width="18" height="96" fill="currentColor" opacity="0.4" />
      <rect x="148" y="32" width="18" height="120" fill="currentColor" opacity="0.7" />
      {/* Plate silhouette stack */}
      <ellipse cx="230" cy="100" rx="54" ry="54" opacity="0.25" />
      <ellipse cx="230" cy="100" rx="40" ry="40" opacity="0.45" />
      <ellipse cx="230" cy="100" rx="24" ry="24" fill="currentColor" opacity="0.35" stroke="none" />
      <line x1="176" y1="100" x2="284" y2="100" strokeWidth="4" />
      {/* Rep dots */}
      {[0, 1, 2, 3, 4].map((i) => (
        <circle
          key={i}
          cx={48 + i * 22}
          cy={168}
          r="4"
          fill="currentColor"
          stroke="none"
          opacity={0.35 + i * 0.12}
        />
      ))}
    </g>
  );
}

function StrongmanMotif() {
  return (
    <g fill="currentColor" stroke="currentColor">
      <circle cx="88" cy="100" r="34" fill="none" strokeWidth="5" opacity="0.55" />
      <circle cx="232" cy="100" r="34" fill="none" strokeWidth="5" opacity="0.55" />
      <rect x="88" y="92" width="144" height="16" rx="2" stroke="none" />
      <circle cx="88" cy="100" r="12" stroke="none" opacity="0.85" />
      <circle cx="232" cy="100" r="12" stroke="none" opacity="0.85" />
      {/* Atlas load rings */}
      <circle cx="160" cy="100" r="48" fill="none" strokeWidth="2" opacity="0.25" />
      <path
        d="M40 150 Q160 170 280 150"
        fill="none"
        strokeWidth="2"
        opacity="0.35"
      />
    </g>
  );
}

function PowerliftingMotif() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="3">
      {/* Strength triangle */}
      <path d="M60 150 L160 40 L260 150 Z" opacity="0.7" />
      <circle cx="160" cy="110" r="10" fill="currentColor" stroke="none" />
      {/* Barbell */}
      <line x1="48" y1="168" x2="272" y2="168" strokeWidth="4" />
      <rect x="40" y="156" width="16" height="24" fill="currentColor" stroke="none" opacity="0.8" />
      <rect x="264" y="156" width="16" height="24" fill="currentColor" stroke="none" opacity="0.8" />
      <rect x="58" y="160" width="10" height="16" fill="currentColor" stroke="none" opacity="0.45" />
      <rect x="252" y="160" width="10" height="16" fill="currentColor" stroke="none" opacity="0.45" />
      {/* Intensity graph */}
      <polyline
        points="70,130 110,118 150,90 190,100 230,70"
        strokeWidth="2.5"
        opacity="0.5"
      />
    </g>
  );
}

function TrainingSystemMotif() {
  return (
    <g fill="none" stroke="currentColor" strokeWidth="2.5">
      {/* Conjugate / system nodes */}
      <circle cx="80" cy="70" r="18" opacity="0.7" />
      <circle cx="160" cy="50" r="18" opacity="0.7" />
      <circle cx="240" cy="70" r="18" opacity="0.7" />
      <circle cx="120" cy="130" r="18" opacity="0.55" />
      <circle cx="200" cy="130" r="18" opacity="0.55" />
      <line x1="95" y1="80" x2="145" y2="58" opacity="0.45" />
      <line x1="175" y1="58" x2="225" y2="80" opacity="0.45" />
      <line x1="90" y1="85" x2="110" y2="115" opacity="0.45" />
      <line x1="230" y1="85" x2="210" y2="115" opacity="0.45" />
      <line x1="138" y1="130" x2="182" y2="130" opacity="0.45" />
      {/* Wave volume pattern */}
      <path
        d="M40 170 C80 150, 100 190, 140 170 S200 150, 240 170 S300 190, 300 170"
        opacity="0.4"
      />
    </g>
  );
}
