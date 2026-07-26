import Link from "next/link";
import type { ComponentProps } from "react";
import {
  type ButtonSize,
  type ButtonVariant,
} from "@/design-system/components/Button";
import { cn } from "@/design-system/utils/cn";

const variantClass: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--color-accent)] text-[var(--color-accent-foreground)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-md)] active:translate-y-px",
  secondary:
    "border border-[var(--color-border-strong)] bg-[var(--color-surface)]/40 text-[var(--color-foreground)] hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-elevated)] active:translate-y-px",
  ghost:
    "bg-transparent text-[var(--color-muted)] hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-foreground)] active:translate-y-px",
  danger: "bg-[var(--color-danger)] text-white hover:opacity-90 active:translate-y-px",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "min-h-10 h-10 px-3 text-sm",
  md: "min-h-11 h-11 px-4 text-sm",
  lg: "min-h-12 h-12 px-5 text-base",
};

export type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-sm)] font-medium tracking-tight transition-[background-color,border-color,opacity,color,box-shadow,transform] duration-[var(--duration-fast)] ease-[var(--easing-standard)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
