import {
  ClipboardList,
  Gauge,
  Scale,
  Workflow,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { MediaPlaceholder } from "@/components/marketing/MediaPlaceholder";
import { homeCopy } from "@/lib/content/home";
import { cn } from "@/design-system/utils/cn";

const APPROACH_ICONS: Record<
  (typeof homeCopy.approach.items)[number]["id"],
  LucideIcon
> = {
  periodization: Workflow,
  biomechanics: Gauge,
  ipf: Scale,
  planning: ClipboardList,
};

export function HomeTrainingApproach() {
  const { approach } = homeCopy;

  return (
    <section
      id="approach"
      aria-labelledby="home-approach-heading"
      className="relative border-t border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-10 lg:items-end">
          <div className="lg:col-span-7">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[#e8c547]">
              {approach.eyebrow}
            </p>
            <h2
              id="home-approach-heading"
              className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--color-foreground)]"
            >
              {approach.title}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-[var(--color-muted)]">
              {approach.description}
            </p>
          </div>
          <MediaPlaceholder
            label="Competition platform photography placeholder"
            className="home-rise aspect-[16/10] w-full lg:col-span-5"
          />
        </div>

        <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
          {approach.items.map((item, index) => {
            const Icon = APPROACH_ICONS[item.id];
            return (
              <li
                key={item.id}
                className={cn(
                  "home-bento group relative flex flex-col border border-[var(--color-border)] bg-[#0c0c0e] p-7 sm:p-8",
                  item.span,
                )}
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex h-10 w-10 items-center justify-center border border-[var(--color-border-strong)] text-[#e8c547] transition-colors duration-[var(--duration-normal)] group-hover:border-[#e8c547]/45">
                    <Icon className="h-5 w-5 stroke-[1.5]" aria-hidden />
                  </div>
                  <span className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--color-subtle)]">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-8 font-[family-name:var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-foreground)]">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-muted)] sm:text-[0.95rem]">
                  {item.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
