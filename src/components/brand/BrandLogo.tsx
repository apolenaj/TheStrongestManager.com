import Image from "next/image";
import Link from "next/link";
import { cn } from "@/design-system/utils/cn";

/**
 * Brand lockup — B&W logo with black keyed out via mix-blend-screen
 * so it sits flush on the dark navbar.
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
        className="h-14 w-auto object-contain mix-blend-screen contrast-125 brightness-110 md:h-20"
      />
    </Link>
  );
}
