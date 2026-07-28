import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";

export default function LegendaryMethodsNotFound() {
  return (
    <MarketingContainer>
      <div className="mx-auto max-w-xl py-8 text-center">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Legendary Training Methods
        </p>
        <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
          Profile not found
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
          This profile does not exist, or it is still a draft and not available
          for public viewing.
        </p>
        <Link
          href="/legendary-methods"
          className="mt-8 inline-flex min-h-11 items-center rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)]"
        >
          Browse Legendary Methods
        </Link>
      </div>
    </MarketingContainer>
  );
}
