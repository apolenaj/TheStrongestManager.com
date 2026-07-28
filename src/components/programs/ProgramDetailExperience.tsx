import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PublicProgramDetail, PublicProgramProduct } from "@/domain/program-catalog";
import { getProgramFamilyContent } from "@/domain/program-catalog/content";
import {
  formatMethodLabel,
  formatProgramPriceGbp,
  formatRecoveryDemand,
  formatScheduleLabel,
} from "@/domain/program-catalog/format";

type ProgramDetailExperienceProps = {
  program: PublicProgramDetail;
  siblingFree: PublicProgramProduct | null;
  siblingPaid: PublicProgramProduct | null;
};

export function ProgramDetailExperience({
  program,
  siblingFree,
  siblingPaid,
}: ProgramDetailExperienceProps) {
  const content = getProgramFamilyContent(program.familyId);
  const isFree = program.isFree;
  const compareFree = siblingFree ?? (isFree ? program : null);
  const comparePaid = siblingPaid ?? (!isFree ? program : null);
  const ctaPrimary = isFree
    ? { href: `/programs/start/${program.slug}`, label: "Start 4 weeks free" }
    : compareFree
      ? { href: `/programs/start/${compareFree.slug}`, label: "Try 4 weeks free" }
      : { href: `/programs/find-my-program`, label: "Find my program" };

  const ctaSecondary =
    !isFree
      ? {
          href: `/pricing?tab=programs`,
          label: `Buy full program · ${formatProgramPriceGbp(program.displayPrice, program.defaultCurrency)}`,
        }
      : comparePaid
        ? {
            href: `/programs/${comparePaid.slug}`,
            label: "View full program",
          }
        : null;

  const phases = content?.structure ?? [];
  const comparison =
    content?.comparisonRows ??
    ([
      {
        feature: "Duration",
        free: compareFree ? `${compareFree.durationWeeks} weeks` : "—",
        full: comparePaid ? `${comparePaid.durationWeeks} weeks` : "—",
      },
      {
        feature: "Price",
        free: "£0",
        full: comparePaid
          ? formatProgramPriceGbp(
              comparePaid.displayPrice,
              comparePaid.defaultCurrency,
            )
          : "—",
      },
    ] as const);

  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden border-b border-[var(--color-border)] bg-[radial-gradient(ellipse_at_top_left,rgba(183,255,42,0.08),transparent_55%),linear-gradient(180deg,var(--color-surface)_0%,var(--color-background)_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="animate-[fade-up_0.45s_var(--easing-standard)_both] text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {formatMethodLabel(program.methodId)}
            {program.variant === "bundle" ? " · Bundle" : null}
            {isFree ? " · Free starter" : null}
          </p>
          <h1 className="mt-4 max-w-4xl animate-[fade-up_0.5s_var(--easing-standard)_both] font-[family-name:var(--font-display)] text-4xl font-semibold uppercase leading-[1.05] tracking-[0.03em] text-[var(--color-foreground)] sm:text-5xl md:text-6xl">
            {content?.displayName ?? program.name}
          </h1>
          <p className="mt-5 max-w-2xl animate-[fade-up_0.55s_var(--easing-standard)_both] text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
            {content?.tagline ?? program.description}
          </p>

          <dl className="mt-10 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Duration", value: `${program.durationWeeks} weeks` },
              {
                label: "Price",
                value: formatProgramPriceGbp(
                  program.displayPrice,
                  program.defaultCurrency,
                ),
              },
              {
                label: "Recovery",
                value: formatRecoveryDemand(program.recoveryDemand),
              },
              {
                label: "Level",
                value: program.difficulty,
              },
            ].map((item) => (
              <div
                key={item.label}
                className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)]/80 p-4"
              >
                <dt className="text-[0.65rem] uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                  {item.label}
                </dt>
                <dd className="mt-2 text-sm font-medium capitalize text-[var(--color-foreground)]">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-4 text-sm text-[var(--color-muted)]">
            Schedules:{" "}
            {program.availableSchedules.map(formatScheduleLabel).join(" · ")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ctaPrimary.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              {ctaPrimary.label}
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </Link>
            {ctaSecondary ? (
              <Link
                href={ctaSecondary.href}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm border border-[var(--color-border-strong)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] transition-colors duration-200 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
              >
                {ctaSecondary.label}
              </Link>
            ) : null}
          </div>
          <p className="mt-4 text-xs text-[var(--color-subtle)]">
            Published launch pricing. No countdown timers or fake scarcity.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-16 px-4 sm:px-6">
        {content ? (
          <section className="grid gap-10 md:grid-cols-2">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                Who this is for
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {content.whoFor.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-[var(--color-accent)] pl-4"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                Who should not use it
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {content.whoNot.map((item) => (
                  <li
                    key={item}
                    className="border-l-2 border-[var(--color-border-strong)] pl-4"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}

        {phases.length > 0 ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              Program structure
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">
              Preview of phase intent — not a full session dump.
            </p>
            <ol className="mt-8 grid gap-4 md:grid-cols-3">
              {phases.map((phase) => (
                <li
                  key={`${phase.label}-${phase.weeks}`}
                  className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5"
                >
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                    {phase.weeks}
                  </p>
                  <p className="mt-3 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                    {phase.label}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                    {phase.intent}
                  </p>
                </li>
              ))}
            </ol>
          </section>
        ) : null}

        <section>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            Free versus full comparison
          </h2>
          <div className="mt-6 overflow-x-auto border border-[var(--color-border)]">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead className="bg-[var(--color-surface)]">
                <tr>
                  <th className="border-b border-[var(--color-border)] px-4 py-3 font-semibold text-[var(--color-foreground)]">
                    Feature
                  </th>
                  <th className="border-b border-[var(--color-border)] px-4 py-3 font-semibold text-[var(--color-foreground)]">
                    Free 4-week
                  </th>
                  <th className="border-b border-[var(--color-border)] px-4 py-3 font-semibold text-[var(--color-foreground)]">
                    Full program
                  </th>
                </tr>
              </thead>
              <tbody className="bg-[var(--color-surface-elevated)]">
                {comparison.map((row) => (
                  <tr key={row.feature}>
                    <th
                      scope="row"
                      className="border-b border-[var(--color-border)] px-4 py-3 font-medium text-[var(--color-foreground)]"
                    >
                      {row.feature}
                    </th>
                    <td className="border-b border-[var(--color-border)] px-4 py-3 text-[var(--color-muted)]">
                      {row.free}
                    </td>
                    <td className="border-b border-[var(--color-border)] px-4 py-3 text-[var(--color-muted)]">
                      {row.full}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {content?.faq?.length ? (
          <section>
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              FAQ
            </h2>
            <div className="mt-6 divide-y divide-[var(--color-border)] border border-[var(--color-border)] bg-[var(--color-surface-elevated)]">
              {content.faq.map((item) => (
                <details key={item.question} className="group p-5">
                  <summary className="cursor-pointer list-none font-medium text-[var(--color-foreground)] marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]">
                    <span className="flex items-start justify-between gap-4">
                      {item.question}
                      <span className="text-[var(--color-accent)] transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8">
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
            Ready to train with purpose
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-[var(--color-muted)]">
            Start with the free block when available, or take the full cycle when
            you already know the system fits.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ctaPrimary.href}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              {ctaPrimary.label}
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </Link>
            <Link
              href="/programs"
              className="inline-flex min-h-12 items-center justify-center border border-[var(--color-border)] px-6 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)] transition-colors duration-200 hover:text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Back to catalog
            </Link>
          </div>
          <p className="mt-5 text-sm text-[var(--color-muted)]">
            Want the educational context behind related training systems?{" "}
            <Link
              href="/legendary-methods"
              className="font-medium text-[var(--color-foreground)] underline-offset-4 hover:text-[var(--color-accent)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
            >
              Read Legendary Methods analyses
            </Link>
            {" — "}
            independent products, not athlete-endorsed plans.
          </p>
        </section>
      </div>
    </div>
  );
}
