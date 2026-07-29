import Link from "next/link";
import { cn } from "@/design-system/utils/cn";

/**
 * Pure typography brand lockup — no SVG mark.
 * Brutal stacked wordmark for dark headers.
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
        "group inline-flex min-w-0 flex-col items-start justify-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        className,
      )}
    >
      <span className="text-2xl font-black leading-none tracking-tighter text-white sm:text-3xl">
        THE STRONGEST
      </span>
      <span className="pt-1 text-xs font-bold leading-none tracking-[0.4em] text-red-600 transition-colors group-hover:text-red-500 sm:text-sm">
        MANAGER
      </span>
    </Link>
  );
}
