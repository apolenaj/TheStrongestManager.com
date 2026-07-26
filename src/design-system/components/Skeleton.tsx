import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils/cn";

export type SkeletonProps = HTMLAttributes<HTMLDivElement> & {
  /** Visual shape */
  variant?: "text" | "rect" | "circle";
};

export function Skeleton({
  className,
  variant = "rect",
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse bg-[var(--color-surface-elevated)]",
        variant === "text" && "h-4 w-full rounded-[var(--radius-sm)]",
        variant === "rect" && "h-24 w-full rounded-[var(--radius-md)]",
        variant === "circle" && "h-10 w-10 rounded-[var(--radius-full)]",
        className,
      )}
      {...props}
    />
  );
}

export function SkeletonBlock({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          className={index === lines - 1 ? "w-[66%]" : undefined}
        />
      ))}
    </div>
  );
}
