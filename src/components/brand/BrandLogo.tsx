import Image from "next/image";
import Link from "next/link";
import { cn } from "@/design-system/utils/cn";

/**
 * Brand lockup — silhouette + "THE STRONGEST" image only.
 * Sized to dominate the header with a subtle glow on dark surfaces.
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
      aria-label="The Strongest — Home"
      className={cn(
        "group inline-flex shrink-0 items-center justify-center transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        className,
      )}
    >
      <Image
        src="/logo-base.jpg"
        alt="The Strongest"
        width={240}
        height={240}
        priority
        className="h-14 w-auto object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.15)] md:h-20"
      />
    </Link>
  );
}
