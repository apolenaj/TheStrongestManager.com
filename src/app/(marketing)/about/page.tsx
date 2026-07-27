import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaPlaceholder } from "@/components/marketing/MediaPlaceholder";
import { aboutJosefCopy } from "@/lib/content/home-value";
import { homeCopy } from "@/lib/content/home";

export const metadata: Metadata = {
  title: "About Josef — Online Powerlifting Coach",
  description:
    "Meet Josef: online powerlifting coaching built from competitive IPF standards and professional performance systems — not theory alone.",
  keywords: [
    "online powerlifting coach",
    "powerlifting coach",
    "IPF coaching",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Josef — Online Powerlifting Coach",
    description: aboutJosefCopy.preview,
    url: "/about",
    type: "profile",
  },
};

export default function AboutPage() {
  return (
    <article className="border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
          About
        </p>
        <h1 className="mt-4 max-w-3xl font-[family-name:var(--font-display)] text-[clamp(2.2rem,5vw,4rem)] font-bold uppercase leading-[1.05] tracking-[0.02em] text-[var(--color-foreground)]">
          {aboutJosefCopy.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-muted)]">
          {aboutJosefCopy.preview}
        </p>

        <div className="mt-14 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <MediaPlaceholder
              label="Josef profile photography placeholder"
              className="aspect-[4/5] w-full border border-[var(--color-border)]"
            />
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-subtle)]">
              Founder · {homeCopy.brand}
            </p>
          </div>

          <div className="space-y-6 lg:col-span-7">
            {homeCopy.about.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 40)}
                className="text-base leading-relaxed text-[var(--color-muted)] sm:text-[1.05rem]"
              >
                {paragraph}
              </p>
            ))}
            <p className="border-t border-[var(--color-border)] pt-6 text-sm font-medium text-[var(--color-foreground)]">
              {homeCopy.about.closing}
            </p>

            <ul className="mt-8 space-y-3 border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
              {aboutJosefCopy.bullets.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-[var(--color-foreground)]"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <div className="flex flex-col gap-3 pt-4 sm:flex-row">
              <Link
                href="/program-audit"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-all duration-300 hover:bg-[var(--color-accent-hover)]"
              >
                Get your free strength audit
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} aria-hidden />
              </Link>
              <Link
                href="/coaching/apply"
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-[var(--color-border)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] transition-all duration-300 hover:border-[var(--color-accent)]"
              >
                Apply for coaching
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
