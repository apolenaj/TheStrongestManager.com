"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  ButtonLink,
} from "@/design-system";
import type { BillingInterval } from "@/domain/billing";
import type { PricingTierView } from "@/services/billing/billing-service";

export function PricingExperience({
  view,
  freeCtaLabel,
}: {
  view: PricingTierView;
  freeCtaLabel?: string;
}) {
  const [interval, setInterval] = useState<BillingInterval>(
    view.intervalDefault,
  );

  return (
    <div className="space-y-10">
      <Alert tone="info" title="Plans and limits">
        {view.honesty[0]} Monthly is the default; annual is optional. Cancel
        anytime — see the cancellation section below.
      </Alert>

      {!view.checkoutEnabled ? (
        <Alert tone="warning" title="Self-serve checkout is not live">
          Plan prices are from the catalog for planning. Paid upgrade buttons do
          not charge a card until Stripe keys, price IDs, and a ready billing
          adapter are configured. Free accounts still work.
        </Alert>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm text-[var(--color-muted)]">Billing interval</p>
        <div
          role="group"
          aria-label="Billing interval"
          className="inline-flex rounded-[var(--radius-sm)] border border-[var(--color-border)] p-1"
        >
          <button
            type="button"
            className={
              interval === "monthly"
                ? "rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-foreground)]"
                : "rounded-[var(--radius-sm)] px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }
            onClick={() => setInterval("monthly")}
            aria-pressed={interval === "monthly"}
          >
            Monthly
          </button>
          <button
            type="button"
            className={
              interval === "annual"
                ? "rounded-[var(--radius-sm)] bg-[var(--color-accent)] px-4 py-2 text-sm font-medium text-[var(--color-accent-foreground)]"
                : "rounded-[var(--radius-sm)] px-4 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            }
            onClick={() => setInterval("annual")}
            aria-pressed={interval === "annual"}
          >
            Annual
          </button>
        </div>
        <p className="text-xs text-[var(--color-muted)]">
          Monthly is the default. Annual is optional.
        </p>
      </div>

      <ul className="grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
        {view.tiers.map((tier) => {
          const priceLabel =
            interval === "annual"
              ? tier.annualLabel ?? tier.monthlyLabel
              : tier.monthlyLabel;
          const showSavings =
            interval === "annual" && tier.annualSavingsLabel;

          return (
            <li
              key={tier.plan.id}
              className="flex flex-col border-t border-[var(--color-border)] pt-5"
            >
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-[var(--color-foreground)]">
                  {tier.plan.name}
                </h2>
                {tier.plan.highlightLabel ? (
                  <Badge variant="neutral">{tier.plan.highlightLabel}</Badge>
                ) : null}
                {!tier.plan.purchasable && tier.plan.id !== "free" ? (
                  <Badge variant="info">Optional future</Badge>
                ) : null}
              </div>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                {tier.plan.tagline}
              </p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-3xl tabular-nums text-[var(--color-foreground)]">
                {priceLabel ?? "—"}
              </p>
              {showSavings ? (
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {tier.annualSavingsLabel}
                </p>
              ) : null}
              {interval === "annual" &&
              tier.monthlyLabel &&
              tier.plan.monthly ? (
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Monthly list price: {tier.monthlyLabel}
                </p>
              ) : null}

              <section className="mt-6">
                <h3 className="text-sm font-medium text-[var(--color-foreground)]">
                  Features
                </h3>
                <ul className="mt-2 space-y-1.5 text-sm">
                  {tier.plan.features.map((f) => (
                    <li
                      key={f.id}
                      className={
                        f.included
                          ? "text-[var(--color-foreground)]"
                          : "text-[var(--color-muted)] line-through decoration-[var(--color-border-strong)]"
                      }
                    >
                      {f.included ? "✓ " : "– "}
                      {f.label}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="mt-5">
                <h3 className="text-sm font-medium text-[var(--color-foreground)]">
                  Limits
                </h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
                  {tier.limitsSummary.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>

              <div className="mt-auto pt-6">
                {tier.cta.enabled ? (
                  <ButtonLink
                    href={tier.cta.href}
                    variant={tier.plan.id === "pro" ? "primary" : "secondary"}
                    size="md"
                    className="w-full"
                  >
                    {tier.plan.id === "free" && freeCtaLabel
                      ? freeCtaLabel
                      : tier.cta.label}
                  </ButtonLink>
                ) : (
                  <p className="rounded-[var(--radius-sm)] border border-[var(--color-border)] px-4 py-3 text-center text-sm text-[var(--color-muted)]">
                    {tier.cta.label}
                  </p>
                )}
                <p className="mt-2 text-xs text-[var(--color-muted)]">
                  {tier.cta.hint}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <section className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          {view.cancellation.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {view.cancellation.body}
        </p>
        <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-[var(--color-muted)]">
          {view.cancellation.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Billing provider: {view.provider.label} ({view.provider.status}).{" "}
          {view.provider.note}{" "}
          <Link href="/signup" className="text-[var(--color-accent)]">
            Create a free account
          </Link>
        </p>
      </section>
    </div>
  );
}
