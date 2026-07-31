import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { ProgramsCatalogExperience } from "@/components/programs/ProgramsCatalogExperience";
import { listPublicProgramCatalog } from "@/services/program-catalog";

/** ISR — catalog is public and changes with seed/publish, not per-request. */
export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProgramsPage");
  return {
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: [
      "powerlifting training programs",
      "powerlifting program",
      "strength training programs",
      "elite strength systems",
      "free powerlifting program",
    ],
    alternates: { canonical: "/programs" },
    openGraph: {
      title: t("meta.ogTitle"),
      description: t("meta.ogDescription"),
      url: "/programs",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("meta.ogTitle"),
      description: t("meta.twitterDescription"),
    },
  };
}

export default async function ProgramsCatalogPage() {
  const t = await getTranslations("ProgramsPage");
  const result = await listPublicProgramCatalog({});
  const programs = result.ok ? result.programs : [];

  return (
    <div className="bg-[var(--color-background)]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_18%_0%,rgba(183,255,42,0.14),transparent_52%),radial-gradient(ellipse_at_90%_20%,rgba(239,68,68,0.08),transparent_40%),linear-gradient(180deg,#121412_0%,#070807_72%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28 lg:py-32">
          <p className="animate-[fade-up_0.4s_var(--easing-standard)_both] text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-5 max-w-5xl animate-[fade-up_0.5s_var(--easing-standard)_both] font-[family-name:var(--font-display)] text-[clamp(2.75rem,7vw,4.75rem)] font-bold uppercase leading-[0.98] tracking-tight text-[var(--color-foreground)]">
            {t("hero.title")}
          </h1>
          <p className="mt-6 max-w-2xl animate-[fade-up_0.55s_var(--easing-standard)_both] font-[family-name:var(--font-display)] text-xl font-semibold uppercase leading-snug tracking-[0.04em] text-[var(--color-accent)] sm:text-2xl">
            {t("hero.subtitle")}
          </p>
          <p className="mt-5 max-w-2xl animate-[fade-up_0.6s_var(--easing-standard)_both] text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
            {t("hero.lead")}
          </p>
        </div>
      </section>

      <div
        id="program-catalog"
        className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20"
      >
        <Suspense
          fallback={
            <p className="text-sm text-[var(--color-muted)]">{t("loading")}</p>
          }
        >
          <ProgramsCatalogExperience programs={programs} />
        </Suspense>
      </div>
    </div>
  );
}
