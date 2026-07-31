import Image from "next/image";
import Link from "next/link";
import { cn } from "@/design-system/utils/cn";

/**
 * Brand lockup — silhouette + "THE STRONGEST" image only.
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
        width={150}
        height={150}
        priority
        className="h-12 w-auto object-contain sm:h-14"
      />
    </Link>
  );
}
