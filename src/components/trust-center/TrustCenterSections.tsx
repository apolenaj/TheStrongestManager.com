import Link from "next/link";
import type { TrustCenterSection } from "@/domain/trust-center";

/**
 * One purpose per section — headline, summary, points. No cards.
 */
export function TrustCenterSections({
  sections,
}: {
  sections: TrustCenterSection[];
}) {
  return (
    <div className="grid gap-16">
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className="trust-section scroll-mt-24"
          style={{ animationDelay: `${Math.min(index, 5) * 60}ms` }}
        >
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--color-accent)]">
            {String(index + 1).padStart(2, "0")}
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-foreground)] md:text-3xl">
            {section.title}
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
            {section.summary}
          </p>
          <ul className="mt-6 list-disc space-y-3 pl-5 text-sm leading-relaxed text-[var(--color-muted)] md:text-base">
            {section.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          {section.relatedHref && section.relatedLabel ? (
            <p className="mt-5 text-sm">
              <Link
                href={section.relatedHref}
                className="text-[var(--color-accent)] underline-offset-4 hover:underline"
              >
                {section.relatedLabel} →
              </Link>
            </p>
          ) : null}
        </section>
      ))}
    </div>
  );
}
