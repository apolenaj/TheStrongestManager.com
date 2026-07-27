import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MediaPlaceholder } from "@/components/marketing/MediaPlaceholder";
import { aboutJosefCopy } from "@/lib/content/home-value";

export function HomeAboutPreview() {
  return (
    <section
      id="about-josef"
      aria-labelledby="home-about-josef-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-background)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
          <div className="lg:col-span-5">
            <MediaPlaceholder
              label="Josef profile photography placeholder"
              className="aspect-[4/5] w-full border border-[var(--color-border)]"
              iconClassName="h-10 w-10"
            />
          </div>

          <div className="lg:col-span-7">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
              {aboutJosefCopy.eyebrow}
            </p>
            <h2
              id="home-about-josef-heading"
              className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
            >
              {aboutJosefCopy.title}
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[var(--color-muted)] sm:text-lg">
              {aboutJosefCopy.preview}
            </p>
            <ul className="mt-8 space-y-3">
              {aboutJosefCopy.bullets.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-[var(--color-foreground)]"
                >
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={aboutJosefCopy.href}
              className="mt-10 inline-flex min-h-12 items-center gap-2 text-sm font-semibold text-[var(--color-accent)] transition-colors duration-300 hover:text-[var(--color-accent-hover)]"
            >
              {aboutJosefCopy.cta}
              <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
