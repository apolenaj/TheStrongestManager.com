import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import { DashboardSideNav } from "@/components/dashboard/DashboardSideNav";
import type { DashboardView } from "@/services/dashboard/types";

const PEAK_WEEKS = 12;

type DashboardHomeProps = {
  email: string | null | undefined;
  displayName: string;
  dashboard: DashboardView | null;
};

function formatPrDate(date: Date, locale: string): string {
  return date.toLocaleDateString(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function DashboardHome({
  email,
  displayName,
  dashboard,
}: DashboardHomeProps) {
  const t = await getTranslations("Dashboard");
  const locale = await getLocale();

  const programName = dashboard?.scores.programming.statusLabel ?? null;

  const progressValue = dashboard?.scores.programming.value;
  const weekCurrent =
    progressValue != null
      ? Math.min(
          PEAK_WEEKS,
          Math.max(0, Math.round((progressValue / 100) * PEAK_WEEKS)),
        )
      : programName
        ? 1
        : 0;
  const progressPercent = Math.min(
    100,
    Math.max(0, Math.round((weekCurrent / PEAK_WEEKS) * 100)),
  );

  const prs = dashboard?.personalRecords.slice(0, 5) ?? [];
  const programHref = dashboard?.scores.programming.href ?? "/app/programs";
  const athleteFallback = t("athleteFallback");
  const showNamedWelcome =
    Boolean(displayName) &&
    displayName.toLowerCase() !== athleteFallback.toLowerCase();

  return (
    <div className="min-w-0 space-y-10 text-white">
      <header className="space-y-3 border-b border-zinc-800 pb-8">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
          {t("eyebrow")}
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,5vw,3.25rem)] font-bold uppercase leading-[1.02] tracking-tight text-white">
          {showNamedWelcome
            ? t("welcomeNamed", { name: displayName.toUpperCase() })
            : t("welcome")}
        </h1>
        {email ? (
          <p className="text-sm text-zinc-400">
            {t("signedInAs", { email })}
          </p>
        ) : null}
      </header>

      {!dashboard ? (
        <section className="border border-zinc-800 bg-zinc-950 p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.04em] text-white">
            {t("onboarding.title")}
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-400">
            {t("onboarding.body")}
          </p>
          <Link
            href="/app/onboarding"
            className="mt-5 inline-flex min-h-11 items-center justify-center bg-[var(--color-accent)] px-5 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {t("onboarding.cta")}
          </Link>
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[14rem_minmax(0,1fr)]">
        <aside className="border border-zinc-800 bg-zinc-950 p-4 lg:sticky lg:top-6 lg:self-start">
          <DashboardSideNav />
        </aside>

        <div className="grid gap-5 md:grid-cols-2">
          <section className="flex flex-col border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              {t("activeProgram.title")}
            </h2>

            {programName ? (
              <>
                <p className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-white">
                  {programName}
                </p>
                <p className="mt-2 text-sm text-zinc-400">
                  {t("activeProgram.weekProgress", {
                    current: weekCurrent,
                    total: PEAK_WEEKS,
                  })}
                </p>
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
                    <span>{t("activeProgram.progressLabel")}</span>
                    <span className="text-zinc-300">{progressPercent}%</span>
                  </div>
                  <div
                    className="h-2 overflow-hidden bg-zinc-800"
                    role="progressbar"
                    aria-valuenow={progressPercent}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={t("activeProgram.progressLabel")}
                  >
                    <div
                      className="h-full bg-[var(--color-accent)] transition-[width] duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <Link
                  href={programHref}
                  className="mt-auto pt-6 text-xs font-bold uppercase tracking-[0.1em] text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  {t("activeProgram.ctaOpen")} →
                </Link>
              </>
            ) : (
              <>
                <p className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-white">
                  {t("activeProgram.emptyTitle")}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">
                  {t("activeProgram.emptyBody")}
                </p>
                <div className="mt-6" aria-hidden>
                  <div className="mb-2 text-[0.65rem] uppercase tracking-[0.14em] text-zinc-500">
                    {t("activeProgram.weekProgress", {
                      current: 0,
                      total: PEAK_WEEKS,
                    })}
                  </div>
                  <div className="h-2 bg-zinc-800">
                    <div className="h-full w-0 bg-[var(--color-accent)]" />
                  </div>
                </div>
                <Link
                  href="/app/programs"
                  className="mt-6 inline-flex min-h-11 items-center justify-center border border-zinc-800 px-4 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  {t("activeProgram.ctaBrowse")}
                </Link>
              </>
            )}
          </section>

          <section className="flex flex-col border border-zinc-800 bg-zinc-950 p-6">
            <h2 className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-zinc-400">
              {t("recentPrs.title")}
            </h2>

            {prs.length > 0 ? (
              <ul className="mt-4 flex-1 divide-y divide-zinc-800">
                {prs.map((pr) => (
                  <li key={`${pr.liftId}-${pr.display}-${pr.recordedAt.toISOString()}`}>
                    <Link
                      href={pr.href}
                      className="flex items-baseline justify-between gap-3 py-3 transition-colors hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {pr.label}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {formatPrDate(pr.recordedAt, locale)}
                          {" · "}
                          {pr.source === "reported"
                            ? t("recentPrs.reported")
                            : t("recentPrs.observed")}
                        </p>
                      </div>
                      <p className="shrink-0 font-[family-name:var(--font-display)] text-lg font-semibold uppercase text-white">
                        {pr.display}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-zinc-400">
                  {t("recentPrs.empty")}
                </p>
                <Link
                  href="/app/progress"
                  className="mt-6 inline-flex min-h-11 items-center justify-center border border-zinc-800 px-4 text-xs font-bold uppercase tracking-[0.08em] text-white transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                >
                  {t("recentPrs.ctaLog")}
                </Link>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
