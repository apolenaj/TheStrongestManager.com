import type { HTMLAttributes } from "react";
import { cn } from "@/design-system/utils/cn";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  /** Soft depth for primary panels */
  elevated?: boolean;
};

export function Card({
  className,
  padded = true,
  elevated = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)]",
        elevated && "shadow-[var(--shadow-panel)]",
        padded && "p-[var(--space-5)] sm:p-[var(--space-6)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mb-[var(--space-4)]", className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-foreground)]",
        className,
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "mt-1.5 text-sm leading-relaxed text-[var(--color-muted)]",
        className,
      )}
      {...props}
    >
      {children}
    </p>
  );
}
