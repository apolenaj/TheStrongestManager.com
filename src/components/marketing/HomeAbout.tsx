import {
  Building2,
  CircuitBoard,
  Scale,
  ShieldCheck,
} from "lucide-react";
import { MediaPlaceholder } from "@/components/marketing/MediaPlaceholder";
import { homeCopy } from "@/lib/content/home";

const HIGHLIGHTS = [
  {
    icon: Building2,
    title: "Retail & logistics",
    body: "Leading large operations where precision, pace, and accountability decide outcomes.",
  },
  {
    icon: CircuitBoard,
    title: "IT & systems",
    body: "Deep technology background — processes are measured, tuned, and scaled.",
  },
  {
    icon: ShieldCheck,
    title: "Management psychology",
    body: "Pressure, people, and decisions: discipline that holds when the situation is uncomfortable.",
  },
  {
    icon: Scale,
    title: "IPF powerlifting",
    body: "Competition standards without compromise — the same logic as business results.",
  },
] as const;

export function HomeAbout() {
  const { about } = homeCopy;

  return (
    <section
      id="about"
      aria-labelledby="home-about-heading"
      className="relative scroll-mt-24 border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_50%,rgba(183,255,42,0.06),transparent_45%)]"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {about.eyebrow}
          </p>
          <h2
            id="home-about-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3rem)] font-semibold uppercase leading-[1.1] tracking-[0.02em] text-[var(--color-foreground)]"
          >
            {about.title}
          </h2>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <MediaPlaceholder
              label="Profile photography placeholder"
              className="aspect-[4/5] w-full border border-[var(--color-border)] transition-all duration-300 hover:border-[color-mix(in_srgb,var(--color-accent)_30%,transparent)]"
              iconClassName="h-10 w-10"
            />
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              Founder · The Strongest
            </p>
          </div>

          <div className="flex flex-col justify-center border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-7 sm:p-10 lg:col-span-7">
            {about.paragraphs.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="mt-5 text-base leading-relaxed text-[var(--color-muted)] first:mt-0 sm:text-[1.05rem] sm:leading-relaxed"
              >
                {paragraph}
              </p>
            ))}
            <p className="mt-8 border-t border-[var(--color-border)] pt-6 text-sm font-medium tracking-tight text-[var(--color-foreground)]">
              {about.closing}
            </p>
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="group border border-[var(--color-border)] bg-[var(--color-background)]/60 p-5 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)] hover:bg-white/[0.03]"
              >
                <Icon
                  className="h-5 w-5 text-[var(--color-accent)] transition-transform duration-300 group-hover:scale-110"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <h3 className="mt-4 font-[family-name:var(--font-display)] text-base font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.body}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
