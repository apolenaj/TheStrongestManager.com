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
      <section className="relative overflow-hidden border-b border-[var(--color-border)]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(183,255,42,0.1),transparent_50%),linear-gradient(180deg,#121412_0%,#070807_70%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <p className="animate-[fade-up_0.4s_var(--easing-standard)_both] text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {t("hero.eyebrow")}
          </p>
          <h1 className="mt-4 max-w-4xl animate-[fade-up_0.5s_var(--easing-standard)_both] font-[family-name:var(--font-display)] text-4xl font-semibold uppercase leading-[1.05] tracking-[0.03em] text-[var(--color-foreground)] sm:text-5xl md:text-6xl">
            {t("hero.title")}
          </h1>
          <p className="mt-5 max-w-2xl animate-[fade-up_0.55s_var(--easing-standard)_both] text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
            {t("hero.lead")}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
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
