import type { Metadata } from "next";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export const metadata: Metadata = {
  title: "Checkout success",
  robots: { index: false, follow: false },
};

type PageProps = {
  searchParams: Promise<{ orderId?: string; session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();
  const orderId = params.orderId?.trim();

  let orderStatus: string | null = null;
  let productName: string | null = null;
  let entitled = false;

  if (session?.user?.id && orderId) {
    const order = await prisma.programOrder.findFirst({
      where: { id: orderId, userId: session.user.id },
      select: {
        status: true,
        product: { select: { name: true } },
        entitlements: { select: { id: true }, take: 1 },
      },
    });
    if (order) {
      orderStatus = order.status;
      productName = order.product.name;
      entitled = order.entitlements.length > 0 || order.status === "paid";
    }
  }

  return (
    <MarketingContainer>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]">
        Checkout
      </p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-4xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
        Payment received
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
        {productName
          ? `Thanks — ${productName} checkout completed.`
          : "Thanks — your one-time program checkout completed."}{" "}
        Access is granted by the verified Stripe webhook, not by this page alone.
        {orderStatus ? ` Order status: ${orderStatus}.` : null}
        {entitled
          ? " Your entitlement is on file."
          : " If the library is empty for a minute, refresh after the webhook lands."}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/app/programs"
          className="inline-flex min-h-12 items-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)]"
        >
          My Programs
        </Link>
        <Link
          href="/pricing?tab=programs"
          className="inline-flex min-h-12 items-center border border-[var(--color-border)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)]"
        >
          Back to pricing
        </Link>
      </div>
    </MarketingContainer>
  );
}
