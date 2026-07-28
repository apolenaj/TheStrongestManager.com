"use client";

import { cn } from "@/design-system/utils/cn";

type BrandLogoSize = "sm" | "md" | "lg";

const SIZE_MAP: Record<
  BrandLogoSize,
  { mark: string; primary: string; secondary: string; gap: string }
> = {
  sm: {
    mark: "h-4 w-[0.85rem]",
    primary: "text-[0.7rem] sm:text-[0.75rem]",
    secondary: "text-[0.55rem] sm:text-[0.58rem]",
    gap: "gap-2",
  },
  md: {
    mark: "h-[1.125rem] w-4 sm:h-5 sm:w-[1.125rem]",
    primary: "text-[0.78rem] sm:text-[0.88rem]",
    secondary: "text-[0.58rem] sm:text-[0.62rem]",
    gap: "gap-2.5",
  },
  lg: {
    mark: "h-6 w-5",
    primary: "text-[1.05rem]",
    secondary: "text-[0.7rem]",
    gap: "gap-3",
  },
};

/**
 * Ultra-minimal brand lockup — hard-edged spark + tight wordmark.
 * No curves, no ornamental frames.
 */
export function BrandLogo({
  className,
  size = "md",
  showWordmark = true,
}: {
  className?: string;
  size?: BrandLogoSize;
  showWordmark?: boolean;
}) {
  const tokens = SIZE_MAP[size];

  return (
    <span
      className={cn(
        "group/logo inline-flex flex-row items-center",
        tokens.gap,
        className,
      )}
    >
      <BrandMark className={cn(tokens.mark, "shrink-0")} />
      {showWordmark ? (
        <span className="flex min-w-0 flex-col justify-center leading-none">
          <span
            className={cn(
              "font-[family-name:var(--font-display)] font-black uppercase tracking-tighter text-white",
              tokens.primary,
            )}
          >
            The Strongest
          </span>
          <span
            className={cn(
              "mt-0.5 font-[family-name:var(--font-display)] font-medium uppercase tracking-[0.38em] text-zinc-400 transition-colors duration-200 group-hover/logo:text-red-600",
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
 * Three thick ascending diagonal slashes — pure hard geometry.
 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      className={cn(
        "origin-center text-red-600 transition-[transform,filter,color] duration-200 ease-[var(--easing-standard)]",
        "group-hover/logo:-translate-y-px group-hover/logo:text-red-500",
        "group-hover/logo:drop-shadow-[0_0_8px_rgba(220,38,38,0.55)]",
        "motion-reduce:transition-none motion-reduce:group-hover/logo:translate-y-0 motion-reduce:group-hover/logo:drop-shadow-none",
        className,
      )}
      viewBox="0 0 18 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      {/* Ascending // / — sharp rects as polygons, zero radius */}
      <polygon points="0,18 3.2,18 8.8,6 5.6,6" />
      <polygon points="5.4,18 8.6,18 14.2,6 11,6" />
      <polygon points="10.8,18 14,18 18,9.5 14.8,9.5" />
    </svg>
  );
}
