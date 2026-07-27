"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Alert } from "@/design-system";
import { PricingExperience } from "@/components/marketing/PricingExperience";
import { formatProgramPriceGbp } from "@/domain/program-catalog/format";
import {
  startProgramCheckoutAction,
  type ProgramCheckoutActionState,
} from "@/services/program-commerce/actions";
import type { PricingTierView } from "@/services/billing/billing-service";
import type { ProgramPricingCard } from "@/services/program-commerce/checkout-service";
import { cn } from "@/design-system/utils/cn";

const TABS = [
  { id: "programs", label: "Programs" },
  { id: "platform", label: "Platform" },
  { id: "coaching", label: "Coaching" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const checkoutInitial: ProgramCheckoutActionState = { ok: false };

function ProgramBuyButton({
  productId,
  enabled,
}: {
  productId: string;
  enabled: boolean;
}) {
  const [state, action, pending] = useActionState(
    startProgramCheckoutAction,
    checkoutInitial,
  );

  if (!enabled) {
    return (
      <p className="text-xs text-[var(--color-muted)]">
        One-time checkout opens when Stripe Price ids are configured for this
        program.
      </p>
    );
  }

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="productId" value={productId} />
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 w-full items-center justify-center rounded-sm bg-[var(--color-accent)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)] transition-colors hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
      >
        {pending ? "Starting checkout…" : "Buy one-time"}
      </button>
      {state.error ? (
        <p role="alert" className="text-xs text-[var(--color-danger)]">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function PricingHub({
  platformView,
  freeCtaLabel,
  programs,
  programHonesty,
  programsCheckoutEnabled,
}: {
  platformView: PricingTierView;
  freeCtaLabel?: string;
  programs: ProgramPricingCard[];
  programHonesty: readonly string[];
  programsCheckoutEnabled: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tabParam = searchParams.get("tab");
  const initialTab: TabId =
    tabParam === "platform" || tabParam === "coaching" || tabParam === "programs"
      ? tabParam
      : "programs";
  const [tab, setTab] = useState<TabId>(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const platformOnly = useMemo(
    () => ({
      ...platformView,
      tiers: platformView.tiers.filter((t) => t.plan.id !== "elite_coaching"),
    }),
    [platformView],
  );

  function selectTab(next: TabId) {
    setTab(next);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", next);
    router.replace(`/pricing?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-10">
      <div
        role="tablist"
        aria-label="Pricing sections"
        className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-3"
      >
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => selectTab(item.id)}
              className={cn(
                "min-h-11 px-4 text-xs font-bold uppercase tracking-[0.12em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]",
                active
                  ? "border-b-2 border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-foreground)]",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "programs" ? (
        <div role="tabpanel" className="space-y-6">
          <Alert tone="info" title="One-time program purchases">
            Training systems and the Complete Method Collection are single
            payments. They are not platform subscriptions and do not renew.
          </Alert>
          {!programsCheckoutEnabled ? (
            <Alert tone="warning" title="Program checkout not live yet">
              List prices come from ProgramProduct. Stripe Checkout starts only
              when the billing flag and Stripe Price ids are configured.
            </Alert>
          ) : null}
          <ul className="grid gap-6 md:grid-cols-2">
            {programs.map((program) => (
              <li
                key={program.id}
                className="flex flex-col border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5"
              >
                <div className="flex flex-wrap items-baseline gap-2">
                  <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
                    {program.name}
                  </h2>
                  {program.isBundle ? (
                    <span className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--color-accent)]">
                      Bundle
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-[var(--color-muted)]">
                  {program.description}
                </p>
                <p className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--color-foreground)]">
                  {formatProgramPriceGbp(
                    program.displayPrice,
                    program.defaultCurrency,
                  )}
                </p>
                <p className="mt-1 text-xs text-[var(--color-subtle)]">
                  {program.durationWeeks} weeks · one-time
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <ProgramBuyButton
                      productId={program.id}
                      enabled={program.checkoutReady}
                    />
                  </div>
                  <Link
                    href={`/programs/${program.slug}`}
                    className="inline-flex min-h-11 items-center justify-center border border-[var(--color-border)] px-4 text-xs font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)]"
                  >
                    Details
                  </Link>
                </div>
              </li>
            ))}
          </ul>
          <ul className="space-y-1 text-xs text-[var(--color-subtle)]">
            {programHonesty.map((line) => (
              <li key={line}>· {line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {tab === "platform" ? (
        <div role="tabpanel">
          <Alert tone="info" title="Recurring platform subscriptions">
            Free, Pro, and Performance are SaaS plans. They are separate from
            one-time program purchases above.
          </Alert>
          <div className="mt-6">
            <PricingExperience
              view={platformOnly}
              freeCtaLabel={freeCtaLabel}
            />
          </div>
        </div>
      ) : null}

      {tab === "coaching" ? (
        <div role="tabpanel" className="space-y-6">
          <Alert tone="info" title="Human coaching">
            1:1 coaching is application-based. It is not a self-serve Stripe
            subscription or a program SKU checkout.
          </Alert>
          <div className="border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold uppercase tracking-[0.03em] text-[var(--color-foreground)]">
              Premium coaching
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
              Work directly with a coach on programming, technique, and meet
              prep. Pricing is scoped during application — not sold as a
              recurring platform tier on this page.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/coaching/apply"
                className="inline-flex min-h-12 items-center rounded-sm bg-[var(--color-accent)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-accent-foreground)]"
              >
                Apply for coaching
              </Link>
              <Link
                href="/coaching"
                className="inline-flex min-h-12 items-center border border-[var(--color-border)] px-5 text-sm font-bold uppercase tracking-[0.08em] text-[var(--color-foreground)]"
              >
                Coaching overview
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
