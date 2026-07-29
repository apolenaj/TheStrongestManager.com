import Link from "next/link";
import { cn } from "@/design-system/utils/cn";

/**
 * Geometric double-bicep silhouette + aggressive stacked wordmark.
 * SVG polygon points are intentional — do not alter.
 */
export function BrandLogo({
  className,
  onNavigate,
}: {
  className?: string;
  /** e.g. close mobile drawer after home navigation */
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/"
      onClick={onNavigate}
      aria-label="The Strongest Manager — Home"
      className={cn(
        "group flex min-w-0 flex-row items-center gap-3 transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        className,
      )}
    >
      {/* The Geometric Double-Bicep Silhouette */}
      <div className="flex h-10 w-10 flex-shrink-0 text-white sm:h-12 sm:w-12">
        <svg
          viewBox="0 0 100 100"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="h-full w-full"
          aria-hidden
          focusable="false"
        >
          {/* Head (Geometric/Spartan block) */}
          <polygon points="45,22 55,22 53,4 47,4" />
          {/* Massive V-Taper Torso & Flexing Arms */}
          <polygon points="42,95 28,55 12,55 5,35 22,15 32,32 43,32 45,25 55,25 57,32 68,32 78,15 95,35 88,55 72,55 58,95" />
        </svg>
      </div>

      {/* The Aggressive Typography */}
      <div className="flex flex-col justify-center">
        <span className="font-[family-name:var(--font-display)] text-xl font-black uppercase leading-none tracking-tighter text-white sm:text-2xl">
          The Strongest
        </span>
        <span className="mt-1 font-[family-name:var(--font-display)] text-[0.65rem] font-bold uppercase leading-tight tracking-[0.3em] text-zinc-400 sm:text-xs">
          Manager
        </span>
      </div>
    </Link>
  );
}
