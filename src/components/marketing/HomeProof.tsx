import Link from "next/link";
import { FileText, Quote, ShieldCheck } from "lucide-react";
import { proofCopy } from "@/lib/content/home-value";

const PROOF_SLOTS = [
  {
    id: "case-study",
    kind: "Case study slot",
    title: "Reserved for a verified training block review",
    body: "Publish when we have permissioned logs, dates, and measurable outcomes — not anonymous internet lore.",
    icon: FileText,
  },
  {
    id: "testimonial",
    kind: "Testimonial slot",
    title: "Reserved for a named athlete statement",
    body: "No invented names, clubs, or PRs. This card stays empty until a real athlete opts in.",
    icon: Quote,
  },
  {
    id: "standards",
    kind: "Credibility",
    title: "Standards we already hold publicly",
    body: "IPF-aware competition context, labeled technique insights, and Trust Center honesty rules — available now.",
    icon: ShieldCheck,
    href: "/trust",
  },
] as const;

export function HomeProof() {
  return (
    <section
      id="proof"
      aria-labelledby="home-proof-heading"
      className="relative border-b border-[var(--color-border)] bg-[var(--color-surface)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="max-w-3xl">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            {proofCopy.eyebrow}
          </p>
          <h2
            id="home-proof-heading"
            className="mt-4 font-[family-name:var(--font-display)] text-[clamp(1.85rem,3.8vw,3.1rem)] font-semibold uppercase leading-[1.08] tracking-[0.02em] text-[var(--color-foreground)]"
          >
            {proofCopy.title}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
            {proofCopy.description}
          </p>
        </div>

        <ul className="mt-12 grid gap-3 lg:grid-cols-3">
          {PROOF_SLOTS.map((slot) => {
            const Icon = slot.icon;
            const inner = (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center border border-[var(--color-border)] text-[var(--color-accent)]">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </span>
                  <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[var(--color-subtle)]">
                    {slot.kind}
                  </span>
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                  {slot.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                  {slot.body}
                </p>
                {"href" in slot && slot.href ? (
                  <span className="mt-6 inline-flex text-sm font-semibold text-[var(--color-accent)]">
                    Open Trust Center →
                  </span>
                ) : (
                  <span className="mt-6 inline-flex border border-dashed border-[var(--color-border)] px-3 py-2 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--color-subtle)]">
                    Placeholder · awaiting verified content
                  </span>
                )}
              </>
            );

            return (
              <li key={slot.id}>
                {"href" in slot && slot.href ? (
                  <Link
                    href={slot.href}
                    className="flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-background)] p-6 transition-all duration-300 hover:border-[color-mix(in_srgb,var(--color-accent)_35%,transparent)]"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="flex h-full flex-col border border-[var(--color-border)] bg-[var(--color-background)] p-6">
                    {inner}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
