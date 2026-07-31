import Link from "next/link";
import { useTranslations } from "next-intl";

const LEARN_KEYS = ["principles", "sport", "original"] as const;
const STEP_KEYS = ["1", "2", "3", "4"] as const;

export function LegendaryMethodsLearnSections() {
  const t = useTranslations("LegendaryMethods.learn");

  return (
    <div className="space-y-16 sm:space-y-24">
      <section aria-labelledby="legendary-learn-heading">
        <h2
          id="legendary-learn-heading"
          className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl"
        >
          {t("heading")}
        </h2>
        <p className="legendary-prose mt-5 text-sm sm:text-base">{t("lead")}</p>
        <ul className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
          {LEARN_KEYS.map((key) => (
            <li key={key} className="legendary-surface p-6 sm:p-7">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-[var(--color-foreground)]">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                {t(`items.${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="legendary-analyse-heading">
        <h2
          id="legendary-analyse-heading"
          className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl"
        >
          {t("analyseHeading")}
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8">
          {STEP_KEYS.map((step) => (
            <li key={step} className="legendary-surface p-6">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                {t("stepLabel", { step: step.padStart(2, "0") })}
              </p>
              <h3 className="mt-3 text-base font-semibold tracking-tight text-[var(--color-foreground)]">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {t(`steps.${step}.body`)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="legendary-context-heading"
        className="legendary-surface p-6 sm:p-10"
      >
        <h2
          id="legendary-context-heading"
          className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)]"
        >
          {t("contextHeading")}
        </h2>
        <p className="legendary-prose mt-5 text-sm sm:text-base">
          {t("contextBody")}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/programs"
            className="inline-flex min-h-11 items-center rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {t("explorePrograms")}
          </Link>
          <Link
            href="/methods"
            className="inline-flex min-h-11 items-center border border-white/10 px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {t("methodsKb")}
          </Link>
        </div>
      </section>
    </div>
  );
}
