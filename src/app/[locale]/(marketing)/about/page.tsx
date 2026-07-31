import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("AboutPage");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: [
      "Joe Apolenar",
      "Josef Apolenar",
      "IPF powerlifter",
      "online powerlifting coach",
      "The Strongest",
    ],
    alternates: { canonical: "/about" },
    authors: [{ name: "Joe Apolenar" }],
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      url: "/about",
      type: "profile",
    },
  };
}

const LIFT_STATS = [
  { value: "310 kg", labelKey: "numbers.deadlift" as const },
  { value: "775 kg", labelKey: "numbers.total" as const },
  { value: "−120 kg", labelKey: "numbers.ipf_class" as const },
  { value: "290 kg", labelKey: "numbers.squat" as const },
  { value: "185 kg", labelKey: "numbers.bench" as const },
] as const;

export default function AboutPage() {
  const t = useTranslations("AboutPage");

  return (
    <article className="bg-[var(--color-background)]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(220,38,38,0.14),transparent_48%),linear-gradient(180deg,var(--color-surface)_0%,var(--color-background)_85%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-28">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-red-600">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-5 max-w-4xl font-[family-name:var(--font-display)] text-[clamp(2.6rem,7vw,5rem)] font-black uppercase leading-[0.95] tracking-tighter text-white">
            {t("hero.title_line1")}
            <br />
            {t("hero.title_line2")}
          </h1>
          <p className="mt-8 max-w-prose text-base leading-relaxed text-zinc-400 sm:text-lg">
            {t("hero.lead")}
          </p>
          <p className="mt-6 font-[family-name:var(--font-display)] text-sm font-medium uppercase tracking-[0.2em] text-white">
            {t("hero.tagline")}
          </p>
        </div>
      </section>

      <section
        aria-label={t("identity.aria")}
        className="border-b border-white/10 bg-[var(--color-surface)]"
      >
        <div className="mx-auto flex max-w-6xl flex-wrap gap-x-8 gap-y-3 px-4 py-6 text-[0.7rem] font-semibold uppercase tracking-[0.16em] text-zinc-400 sm:px-6">
          <span className="text-white">{t("identity.natural_ipf")}</span>
          <span aria-hidden className="text-white/20">
            /
          </span>
          <span>{t("identity.ice_hockey")}</span>
          <span aria-hidden className="text-white/20">
            /
          </span>
          <span>{t("identity.fighter")}</span>
          <span aria-hidden className="text-white/20">
            /
          </span>
          <span>{t("identity.fitness_coach")}</span>
        </div>
      </section>

      <section
        aria-labelledby="transformation-heading"
        className="border-b border-white/10"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-red-600">
                {t("transformation.eyebrow")}
              </p>
              <h2
                id="transformation-heading"
                className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.25rem)] font-black uppercase leading-[1.02] tracking-tighter text-white"
              >
                {t("transformation.title")}
              </h2>
              <p className="mt-3 text-sm uppercase tracking-[0.14em] text-zinc-500">
                {t("transformation.subtitle")}
              </p>
            </div>
            <div className="lg:col-span-7">
              <p className="max-w-prose text-base leading-relaxed text-zinc-400 sm:text-lg">
                {t("transformation.body1")}
              </p>
              <p className="mt-6 max-w-prose text-base leading-relaxed text-zinc-400 sm:text-lg">
                {t("transformation.body2")}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="numbers-heading"
        className="border-b border-white/10 bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-red-600">
            {t("numbers.eyebrow")}
          </p>
          <h2
            id="numbers-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.25rem)] font-black uppercase tracking-tighter text-white"
          >
            {t("numbers.title")}
          </h2>
          <p className="mt-4 max-w-prose text-base leading-relaxed text-zinc-400">
            {t("numbers.lead")}
          </p>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-5">
            {LIFT_STATS.map((stat) => (
              <li
                key={stat.labelKey}
                className="border border-white/10 bg-[var(--color-background)] px-5 py-7"
              >
                <p className="font-[family-name:var(--font-display)] text-[clamp(1.75rem,3vw,2.35rem)] font-black tracking-tighter text-red-600">
                  {stat.value}
                </p>
                <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-zinc-500">
                  {t(stat.labelKey)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        aria-labelledby="mindset-heading"
        className="border-b border-white/10"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-red-600">
            {t("mindset.eyebrow")}
          </p>
          <h2
            id="mindset-heading"
            className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.25rem)] font-black uppercase leading-[1.02] tracking-tighter text-white"
          >
            {t("mindset.title_line1")}
            <br />
            {t("mindset.title_line2")}
          </h2>

          <div className="mt-12 grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-white">
                {t("mindset.corporate_title")}
              </h3>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-zinc-400">
                {t("mindset.corporate_body")}
              </p>
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-white">
                {t("mindset.fullstack_title")}
              </h3>
              <p className="mt-4 max-w-prose text-base leading-relaxed text-zinc-400">
                {t("mindset.fullstack_body")}
              </p>
            </div>
          </div>

          <p className="mt-12 max-w-prose border-l-2 border-red-600 pl-6 text-base leading-relaxed text-zinc-300 sm:text-lg">
            {t("mindset.pullquote")}
          </p>
        </div>
      </section>

      <section
        aria-labelledby="philosophy-heading"
        className="border-b border-white/10 bg-[var(--color-surface)]"
      >
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-red-600">
            {t("philosophy.eyebrow")}
          </p>
          <h2
            id="philosophy-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(2rem,4.5vw,3.5rem)] font-black uppercase tracking-tighter text-white"
          >
            {t("philosophy.title_line1")}
            <br />
            {t("philosophy.title_line2")}
          </h2>
          <p className="mt-8 max-w-prose text-base leading-relaxed text-zinc-400 sm:text-lg">
            {t("philosophy.body")}
          </p>

          <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/program-audit"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-red-600 px-5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              {t("cta.audit")}
              <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
            </Link>
            <Link
              href="/coaching/apply"
              className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/10 px-5 text-sm font-bold uppercase tracking-[0.08em] text-white transition-colors duration-200 hover:border-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
            >
              {t("cta.coaching")}
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
