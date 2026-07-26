import { HomeSection } from "@/components/marketing/HomeSection";
import { homeCopy } from "@/lib/content/home";

export function HomeFaq() {
  return (
    <HomeSection
      id="faq"
      eyebrow="FAQ"
      title="Common questions"
      description="What ships today, what waits on configuration, and what we refuse to invent."
    >
      <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
        {homeCopy.faq.map((item) => (
          <details
            key={item.question}
            className="group py-4 open:pb-5"
          >
            <summary className="cursor-pointer list-none font-[family-name:var(--font-display)] text-base font-semibold text-[var(--color-foreground)] marker:content-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)] [&::-webkit-details-marker]:hidden">
              <span className="flex items-start justify-between gap-4">
                {item.question}
                <span
                  aria-hidden
                  className="mt-0.5 shrink-0 text-[var(--color-accent)] transition-transform duration-[var(--duration-fast)] group-open:rotate-45"
                >
                  +
                </span>
              </span>
            </summary>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)] sm:text-base">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </HomeSection>
  );
}
