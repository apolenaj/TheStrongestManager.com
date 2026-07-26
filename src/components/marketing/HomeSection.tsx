import type { ReactNode } from "react";
import { cn } from "@/design-system/utils/cn";

type HomeSectionProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  /** Full-bleed surface behind the section */
  tone?: "default" | "surface";
};

export function HomeSection({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
  tone = "default",
}: HomeSectionProps) {
  return (
    <section
      id={id}
      className={cn(
        tone === "surface" && "bg-[var(--color-surface)]",
        className,
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 md:py-28">
        <div className="max-w-2xl">
          {eyebrow ? (
            <p className="ui-eyebrow">{eyebrow}</p>
          ) : null}
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-[-0.02em] text-[var(--color-foreground)] sm:text-4xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 text-base leading-relaxed text-[var(--color-muted)] sm:text-lg sm:leading-relaxed">
              {description}
            </p>
          ) : null}
        </div>
        {children ? <div className="mt-12">{children}</div> : null}
      </div>
    </section>
  );
}
