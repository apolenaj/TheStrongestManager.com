import type { Metadata } from "next";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";

export const metadata: Metadata = {
  title: "Checkout canceled",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ orderId?: string }>;
};

export default async function CheckoutCancelPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const orderId = params.orderId?.trim();

  return (
    <MarketingContainer>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-muted)]">
        Checkout
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
        Checkout canceled
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
        No charge was completed. One-time program purchases stay separate from
        platform subscriptions — nothing was activated.
        {orderId ? " You can restart checkout anytime from Pricing → Programs." : null}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/pricing?tab=programs"
          className="inline-flex min-h-12 items-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)]"
        >
          Return to programs
        </Link>
        <Link
          href="/programs"
          className="inline-flex min-h-12 items-center border border-[var(--color-border)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)]"
        >
          Browse catalog
        </Link>
      </div>
    </MarketingContainer>
  );
}
