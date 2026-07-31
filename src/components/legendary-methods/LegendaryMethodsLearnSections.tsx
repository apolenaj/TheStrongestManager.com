import Link from "next/link";

const LEARN_ITEMS = [
  {
    title: "Principles over cosplay",
    body: "Copying an elite athlete’s weekly template rarely transfers. Learning which principles drove adaptation — specificity, overload, recovery, and selection pressure — does.",
  },
  {
    title: "Sport context matters",
    body: "Bodybuilding volume, strongman event practise, and powerlifting peaking solve different problems. Filters and profiles keep those contexts distinct.",
  },
  {
    title: "Towards original programming",
    body: "Each analysis points toward The Strongest programmes that apply related principles without naming products after athletes.",
  },
] as const;

const ANALYSE_STEPS = [
  {
    step: "01",
    title: "Document the publicly available method",
    body: "Capture what can be verified from public sources — not invented routines or private coaching notes.",
  },
  {
    step: "02",
    title: "Separate facts from interpretation",
    body: "Historical documentation stays distinct from The Strongest’s independent analysis.",
  },
  {
    step: "03",
    title: "Analyse volume, intensity, specificity and recovery",
    body: "Score and discuss training demands honestly, including where evidence is mixed or limited.",
  },
  {
    step: "04",
    title: "Build a safer modern application",
    body: "Translate principles into modernised adaptations that respect recovery, technique, and individual constraints.",
  },
] as const;

export function LegendaryMethodsLearnSections() {
  return (
    <div className="space-y-16 sm:space-y-24">
      <section aria-labelledby="legendary-learn-heading">
        <h2
          id="legendary-learn-heading"
          className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl"
        >
          What you will learn
        </h2>
        <p className="legendary-prose mt-5 text-sm sm:text-base">
          The difference between copying an elite athlete and learning from their
          principles — then continuing into original programmes built for modern
          lifters.
        </p>
        <ul className="mt-8 grid gap-6 md:grid-cols-3 md:gap-8">
          {LEARN_ITEMS.map((item) => (
            <li key={item.title} className="legendary-surface p-6 sm:p-7">
              <h3 className="font-[family-name:var(--font-display)] text-lg font-bold uppercase tracking-tight text-[var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="legendary-analyse-heading">
        <h2
          id="legendary-analyse-heading"
          className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)] sm:text-3xl"
        >
          How we analyse each method
        </h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 sm:gap-8">
          {ANALYSE_STEPS.map((item) => (
            <li key={item.step} className="legendary-surface p-6">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--color-accent)]">
                Step {item.step}
              </p>
              <h3 className="mt-3 text-base font-semibold tracking-tight text-[var(--color-foreground)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                {item.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="legendary-context-heading"
        className="legendary-surface p-6 sm:p-10"
      >
        <h2
          id="legendary-context-heading"
          className="font-[family-name:var(--font-display)] text-2xl font-bold uppercase tracking-tight text-[var(--color-foreground)]"
        >
          Important context
        </h2>
        <p className="legendary-prose mt-5 text-sm sm:text-base">
          Elite athletes trained under different conditions — bodyweights,
          schedules, genetics, recovery resources, pharmacology contexts where
          reported historically, coaching staff, and competitive environments.
          A method that worked for a professional under those constraints is not
          a prescription for every lifter. Use these analyses to understand
          principles, limits, and safer modern adaptations — then choose an
          original programme that fits your life.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/programs"
            className="inline-flex min-h-11 items-center rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Explore programmes
          </Link>
          <Link
            href="/methods"
            className="inline-flex min-h-11 items-center border border-white/10 px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
          >
            Training methods knowledge base
          </Link>
        </div>
      </section>
    </div>
  );
}
