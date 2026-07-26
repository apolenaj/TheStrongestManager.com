import type { RecordingGuideVisual } from "@/domain/recording-guide";

/**
 * Top-down + side schematic of camera placement.
 * Decorative guidance only — not a biomechanical model.
 */
export function RecordingGuideDiagram({
  visual,
  label,
}: {
  visual: RecordingGuideVisual;
  label: string;
}) {
  const rad = (visual.cameraAzimuthDeg * Math.PI) / 180;
  const dist =
    visual.cameraDistance === "close"
      ? 52
      : visual.cameraDistance === "far"
        ? 78
        : 65;
  const cx = 100;
  const cy = 72;
  const camX = cx + Math.sin(rad) * dist;
  const camY = cy - Math.cos(rad) * dist * 0.55;

  const heightY =
    visual.cameraHeight === "shoulder"
      ? 28
      : visual.cameraHeight === "mid_torso"
        ? 40
        : 52;

  return (
    <svg
      viewBox="0 0 200 140"
      className="w-full max-w-sm rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]"
      role="img"
      aria-label={label}
    >
      {/* Floor line */}
      <line
        x1="20"
        y1="118"
        x2="180"
        y2="118"
        stroke="var(--color-border-strong)"
        strokeWidth="1.5"
      />

      {/* Athlete silhouette */}
      {visual.athletePose === "bench" ? (
        <g fill="var(--color-muted)" opacity="0.85">
          <rect x="70" y="78" width="60" height="10" rx="2" />
          <ellipse cx="100" cy="72" rx="22" ry="8" />
          <circle cx="78" cy="68" r="6" />
          <rect x="88" y="58" width="50" height="4" rx="1" />
        </g>
      ) : visual.athletePose === "squat" ? (
        <g fill="var(--color-muted)" opacity="0.85">
          <circle cx="100" cy="36" r="7" />
          <rect x="94" y="42" width="12" height="28" rx="3" />
          <rect x="88" y="68" width="10" height="22" rx="2" transform="rotate(18 93 79)" />
          <rect x="102" y="68" width="10" height="22" rx="2" transform="rotate(-18 107 79)" />
          <rect x="78" y="48" width="44" height="4" rx="1" />
        </g>
      ) : (
        <g fill="var(--color-muted)" opacity="0.85">
          <circle cx="100" cy="34" r="7" />
          <rect x="94" y="40" width="12" height="32" rx="3" transform="rotate(-18 100 56)" />
          <rect x="90" y="70" width="10" height="28" rx="2" />
          <rect x="104" y="72" width="10" height="26" rx="2" />
          <rect x="72" y="78" width="48" height="4" rx="1" />
        </g>
      )}

      {/* Camera */}
      <g>
        <line
          x1={cx}
          y1={cy}
          x2={camX}
          y2={camY}
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeDasharray="4 3"
          opacity="0.7"
        />
        <rect
          x={camX - 8}
          y={camY - 6}
          width="16"
          height="12"
          rx="2"
          fill="var(--color-accent)"
        />
        <circle cx={camX + 10} cy={camY} r="3" fill="var(--color-info)" />
        <text
          x={camX}
          y={camY + 22}
          textAnchor="middle"
          fill="var(--color-fg)"
          fontSize="9"
          fontFamily="system-ui, sans-serif"
        >
          Cam
        </text>
      </g>

      {/* Height cue (side strip) */}
      <g opacity="0.9">
        <line
          x1="18"
          y1="30"
          x2="18"
          y2="118"
          stroke="var(--color-border-strong)"
          strokeWidth="1"
        />
        <line
          x1="14"
          y1={heightY}
          x2="22"
          y2={heightY}
          stroke="var(--color-accent)"
          strokeWidth="2"
        />
        <text
          x="28"
          y={heightY + 3}
          fill="var(--color-muted)"
          fontSize="8"
          fontFamily="system-ui, sans-serif"
        >
          height
        </text>
      </g>

      <text
        x="100"
        y="134"
        textAnchor="middle"
        fill="var(--color-muted)"
        fontSize="9"
        fontFamily="system-ui, sans-serif"
      >
        {visual.cameraAzimuthDeg}° · {visual.cameraDistance} distance ·{" "}
        {visual.cameraHeight.replace("_", " ")}
      </text>
    </svg>
  );
}
