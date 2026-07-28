"use client";

import { useId } from "react";
import { cn } from "@/design-system/utils/cn";

type BrandLogoSize = "sm" | "md" | "lg";
type BrandLogoAccent = "blood" | "hazard";

const SIZE_MAP: Record<
  BrandLogoSize,
  { icon: string; primary: string; secondary: string; gap: string }
> = {
  sm: {
    icon: "h-8 w-8",
    primary: "text-[0.72rem] leading-none sm:text-[0.8rem]",
    secondary: "text-[0.55rem] leading-none sm:text-[0.6rem]",
    gap: "gap-2.5",
  },
  md: {
    icon: "h-9 w-9 sm:h-10 sm:w-10",
    primary: "text-[0.8rem] leading-none sm:text-[0.95rem]",
    secondary: "text-[0.58rem] leading-none sm:text-[0.65rem]",
    gap: "gap-2.5 sm:gap-3",
  },
  lg: {
    icon: "h-11 w-11",
    primary: "text-[1.05rem] leading-none",
    secondary: "text-[0.7rem] leading-none",
    gap: "gap-3.5",
  },
};

const ACCENT_CLASS: Record<BrandLogoAccent, string> = {
  blood: "text-red-600 group-hover/logo:text-red-500",
  hazard: "text-yellow-400 group-hover/logo:text-yellow-300",
};

const ACCENT_GLOW: Record<BrandLogoAccent, string> = {
  blood: "group-hover/logo:drop-shadow-[0_0_12px_rgba(220,38,38,0.65)]",
  hazard: "group-hover/logo:drop-shadow-[0_0_12px_rgba(250,204,21,0.55)]",
};

/**
 * Brand lockup — elite IPF strength × professional management.
 * Blood-red (default) or hazard-yellow mark on white type for dark headers.
 */
export function BrandLogo({
  className,
  size = "md",
  showWordmark = true,
  accent = "blood",
}: {
  className?: string;
  size?: BrandLogoSize;
  showWordmark?: boolean;
  /** Aggressive social accent: blood red (default) or hazard yellow. */
  accent?: BrandLogoAccent;
}) {
  const tokens = SIZE_MAP[size];

  return (
    <span
      className={cn(
        "group/logo inline-flex min-w-0 items-center",
        tokens.gap,
        className,
      )}
    >
      <BrandMark
        className={cn(tokens.icon, "shrink-0")}
        accent={accent}
      />
      {showWordmark ? (
        <span className="min-w-0 font-[family-name:var(--font-display)] uppercase text-white">
          <span
            className={cn(
              "block font-black tracking-tighter",
              tokens.primary,
            )}
          >
            The Strongest
          </span>
          <span
            className={cn(
              "mt-1 block font-light tracking-[0.35em] text-white/90 transition-colors duration-200 group-hover/logo:text-white",
              tokens.secondary,
            )}
          >
            Manager
          </span>
        </span>
      ) : (
        <span className="sr-only">The Strongest Manager</span>
      )}
    </span>
  );
}

/**
 * Abstract mark: immovable plate/anvil foundation + ascending will-of-fire spark.
 * No literal dumbbells.
 */
export function BrandMark({
  className,
  accent = "blood",
}: {
  className?: string;
  accent?: BrandLogoAccent;
}) {
  const uid = useId().replace(/:/g, "");
  const glowId = `brand-glow-${uid}`;
  const sheenId = `brand-sheen-${uid}`;

  return (
    <svg
      className={cn(
        "origin-center transition-[transform,filter,color] duration-300 ease-[var(--easing-standard)]",
        ACCENT_CLASS[accent],
        ACCENT_GLOW[accent],
        "group-hover/logo:-translate-y-px",
        "motion-reduce:transition-none motion-reduce:group-hover/logo:translate-y-0 motion-reduce:group-hover/logo:drop-shadow-none",
        className,
      )}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient
          id={sheenId}
          x1="12"
          y1="34"
          x2="30"
          y2="6"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" stopOpacity="0.78" />
          <stop offset="1" stopColor="currentColor" stopOpacity="1" />
        </linearGradient>
        <filter
          id={glowId}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="0.6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Heavy foundation — abstract competition plate / anvil base */}
      <path
        d="M7 31.25h26v2.1H7v-2.1Z"
        fill="currentColor"
        fillOpacity="0.95"
      />
      <path
        d="M9.5 28.4h21v2.85H9.5V28.4Z"
        fill="currentColor"
        fillOpacity="0.82"
      />
      {/* Plate rim silhouette (single disc, not a dumbbell) */}
      <path
        d="M11.25 28.4c0-4.85 3.95-8.8 8.75-8.8s8.75 3.95 8.75 8.8"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="square"
        fill="none"
        opacity="0.95"
      />
      <circle
        cx="20"
        cy="24.6"
        r="2.15"
        fill="currentColor"
        fillOpacity="0.9"
      />

      {/* Ascending management line → sharp will-of-fire spark */}
      <g filter={`url(#${glowId})`}>
        <path
          d="M20 22.2V14.1"
          stroke={`url(#${sheenId})`}
          strokeWidth="1.85"
          strokeLinecap="square"
        />
        <path
          d="M20 14.1 25.6 6.35c.2-.28.62-.22.7.1l.85 3.55 3.45.2c.36.02.48.48.18.66L27.1 13.1l.95 3.35c.1.34-.28.6-.55.4L24.2 14.7l-3.35 1.15c-.34.12-.62-.24-.44-.54L22.1 12.8 20 14.1Z"
          fill={`url(#${sheenId})`}
        />
      </g>
    </svg>
  );
}
