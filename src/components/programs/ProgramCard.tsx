import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/design-system/utils/cn";
import type { PublicProgramProduct } from "@/domain/program-catalog";
import {
  formatMethodLabel,
  formatProgramPriceGbp,
  formatRecoveryDemand,
  formatScheduleLabel,
} from "@/domain/program-catalog/format";

export type ProgramCardModel = {
  familyId: string;
  name: string;
  description: string;
  methodId: string | null;
  difficulty: string;
  recoveryDemand: string;
  availableSchedules: string[];
  paid: PublicProgramProduct | null;
  free: PublicProgramProduct | null;
};

type ProgramCardProps = {
  model: ProgramCardModel;
  className?: string;
  style?: CSSProperties;
};

export function ProgramCard({ model, className, style }: ProgramCardProps) {
  const primary = model.paid ?? model.free;
  if (!primary) return null;

  const durationLabel = model.paid
    ? `${model.paid.durationWeeks} weeks`
    : `${model.free!.durationWeeks} weeks`;
  const priceLabel = model.paid
    ? formatProgramPriceGbp(model.paid.displayPrice, model.paid.defaultCurrency)
    : "Free";

  return (
    <article
      style={style}
      className={cn(
        "group flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 transition-[border-color,transform,background-color] duration-[var(--duration-normal)] ease-[var(--easing-standard)] hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--color-accent)_35%,var(--color-border))] hover:bg-[var(--color-surface-overlay)]",
        className,
      )}
    >
      <div className="flex flex-wrap items-center gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-muted)]">
        <span>{formatMethodLabel(model.methodId)}</span>
        <span aria-hidden className="text-[var(--color-border-strong)]">
          /
        </span>
        <span className="text-[var(--color-foreground)]">{model.difficulty}</span>
      </div>

      <h3 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
        <Link
          href={`/programs/${primary.slug}`}
          className="transition-colors duration-200 hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
        >
          {model.name}
        </Link>
      </h3>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
        {model.description}
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-5 text-sm">
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
            Duration
          </dt>
          <dd className="mt-1 text-[var(--color-foreground)]">{durationLabel}</dd>
        </div>
        <div>
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
            Price
          </dt>
          <dd className="mt-1 text-[var(--color-foreground)]">{priceLabel}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
            Recovery
          </dt>
          <dd className="mt-1 text-[var(--color-foreground)]">
            {formatRecoveryDemand(model.recoveryDemand)}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
            Schedules
          </dt>
          <dd className="mt-1 text-[var(--color-muted)]">
            {model.availableSchedules.map(formatScheduleLabel).join(" · ")}
          </dd>
        </div>
      </dl>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {model.free ? (
          <Link
            href={`/programs/start/${model.free.slug}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Try 4 weeks free
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </Link>
        ) : null}
        {model.paid ? (
          <Link
            href={`/programs/${model.paid.slug}`}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-sm border border-[var(--color-border-strong)] px-4 text-center text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
              !model.free &&
                "border-transparent bg-[var(--color-accent)] text-[var(--color-accent-foreground)] hover:bg-[var(--color-accent-hover)] hover:text-[var(--color-accent-foreground)]",
            )}
          >
            View program
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
          </Link>
        ) : null}
      </div>
    </article>
  );
}
