import Link from "next/link";
import { useTranslations } from "next-intl";
import { STRENGTH_AUDIT_HREF } from "@/components/layout/site-nav";

export function HomeHero() {
  const t = useTranslations("HomePage");

  return (
    <section
      aria-labelledby="home-hero-heading"
      className="relative isolate overflow-hidden border-b border-[var(--color-border)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[var(--color-background)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_30%_0%,rgba(183,255,42,0.08)_0%,transparent_42%),radial-gradient(ellipse_at_70%_20%,rgba(24,27,24,0.9)_0%,rgba(7,8,7,0.98)_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage:
            "radial-gradient(ellipse at 40% 10%, black 12%, transparent 68%)",
        }}
      />

      <div className="mx-auto flex min-h-[min(92svh,52rem)] w-full max-w-6xl flex-col justify-center px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20">
        <p className="font-[family-name:var(--font-heading)] text-sm font-black uppercase tracking-[0.18em] text-[var(--color-accent)]">
          {t("brand_subtitle")}
        </p>

        <h1
          id="home-hero-heading"
          className="mt-6 max-w-5xl font-[family-name:var(--font-heading)] text-[clamp(2.4rem,7vw,5.25rem)] font-black uppercase leading-[1.1] tracking-normal text-[var(--color-foreground)] [text-shadow:0_2px_48px_rgba(0,0,0,0.55)]"
        >
          {t("hero_title")}
        </h1>

        <p className="mt-7 max-w-2xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
          {t("hero_description")}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={STRENGTH_AUDIT_HREF}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors duration-200 hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {t("btn_audit")}
          </Link>
          <Link
            href="/learn"
            className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[var(--color-border)] bg-white/[0.02] px-6 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] transition-colors duration-200 hover:border-[color-mix(in_srgb,var(--color-accent)_45%,transparent)] hover:bg-white/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            {t("btn_library")}
          </Link>
        </div>

        <ul className="mt-14 grid gap-3 border-t border-[var(--color-border)] pt-8 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-[var(--color-border)]">
          {(
            [
              "bullet_evidence",
              "bullet_progression",
              "bullet_coaching",
            ] as const
          ).map((key) => (
            <li
              key={key}
              className="text-sm font-medium tracking-tight text-[var(--color-muted)] sm:px-5 sm:first:pl-0 sm:last:pr-0"
            >
              <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] align-middle" />
              {t(key)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
