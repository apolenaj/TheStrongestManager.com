import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/design-system/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-md)] active:translate-y-px disabled:opacity-50",
  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface)]/40 text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-elevated)] active:translate-y-px disabled:opacity-50",
  ghost:
    "bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)] active:translate-y-px disabled:opacity-50",
  danger:
    "bg-[var(--color-danger)] text-white hover:opacity-90 active:translate-y-px disabled:opacity-50",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-10 h-10 px-3 text-sm",
  md: "min-h-11 h-11 px-4 text-sm",
  lg: "min-h-12 h-12 px-5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium tracking-tight transition-[background-color,border-color,opacity,color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--easing-standard)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] disabled:pointer-events-none",
          variantClass[variant],
          sizeClass[size],
          className,
        )}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            aria-hidden
          />
        ) : null}
        {children}
      </button>
    );
  },
);
