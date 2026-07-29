import Image from "next/image";
import Link from "next/link";
import { cn } from "@/design-system/utils/cn";

/**
 * Classic bodybuilding lockup: silhouette + "THE STRONGEST" image,
 * with programmatic "MANAGER" wordmark beneath.
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
        "group flex min-w-0 flex-col items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        className,
      )}
    >
      <Image
        src="/logo-base.jpg"
        alt=""
        width={150}
        height={150}
        priority
        className="h-12 w-auto object-contain sm:h-14"
      />
      <span className="-mt-1.5 text-[0.65rem] font-bold uppercase leading-none tracking-[0.4em] text-red-600 transition-colors group-hover:text-red-500 sm:text-xs">
        Manager
      </span>
    </Link>
  );
}
