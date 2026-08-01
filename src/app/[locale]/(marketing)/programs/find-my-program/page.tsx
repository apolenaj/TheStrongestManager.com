import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ProgramFinderQuiz } from "@/components/programs/ProgramFinderQuiz";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("ProgramsPage.finderQuiz.page");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: [
      "powerlifting training programs",
      "find a powerlifting program",
      "program finder",
      "strength training program quiz",
    ],
    alternates: { canonical: "/programs/find-my-program" },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: "/programs/find-my-program",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("metaTitle"),
      description: t("metaDescription"),
    },
  };
}

export default async function FindMyProgramPage() {
  const t = await getTranslations("ProgramsPage.finderQuiz.page");

  return (
    <div className="bg-[var(--color-background)]">
      <section className="border-b border-[var(--color-border)] bg-[radial-gradient(ellipse_at_top,rgba(183,255,42,0.08),transparent_55%),linear-gradient(180deg,var(--color-surface)_0%,var(--color-background)_100%)]">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-4xl font-semibold uppercase leading-[1.05] tracking-[0.03em] text-[var(--color-foreground)] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
            {t("lead")}
          </p>
          <Link
            href="/programs"
            className="mt-6 inline-flex text-sm text-[var(--color-muted)] underline-offset-4 hover:text-[var(--color-foreground)] hover:underline"
          >
            {t("browseCatalog")}
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <ProgramFinderQuiz />
      </div>
    </div>
  );
}
