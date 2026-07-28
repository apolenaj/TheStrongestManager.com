import type { ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

export function MarketingContainer({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14",
        className,
      )}
    >
      {children}
    </div>
  );
}
