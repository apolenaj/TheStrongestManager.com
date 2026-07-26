import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/design-system/utils/cn";

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Accessible name — required when there is no visible text */
  "aria-label": string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "secondary" | "danger";
};

const sizeClass = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
} as const;

const variantClass = {
  ghost:
    "text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)]",
  secondary:
    "border border-[var(--color-border)] text-[var(--color-foreground)] hover:border-[var(--color-border-strong)]",
  danger: "text-[var(--color-danger)] hover:bg-[var(--color-score-critical-muted)]",
} as const;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    {
      className,
      size = "md",
      variant = "ghost",
      type = "button",
      children,
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center rounded-[var(--radius-sm)] transition-colors duration-[var(--duration-fast)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] disabled:pointer-events-none disabled:opacity-50",
          sizeClass[size],
          variantClass[variant],
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
