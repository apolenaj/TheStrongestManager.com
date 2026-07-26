"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import { requestOrgPlanUpgradeAction } from "@/services/org/org-billing-actions";
import type { OrgBillingView } from "@/services/org/org-billing-service";

export function OrgBillingPanel({ view }: { view: OrgBillingView }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  return (
    <div className="space-y-8">
      <Alert tone="info" title="Centralized organization billing">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>

      <div className="flex flex-wrap gap-2">
        <ButtonLink
          href={`/app/org/${view.organization.id}`}
          variant="secondary"
          size="sm"
        >
          Back to dashboard
        </ButtonLink>
        <Badge variant="accent">{view.subscription.planName}</Badge>
        <Badge variant="neutral">{view.subscription.status}</Badge>
      </div>

      {error ? (
        <Alert tone="danger" title="Could not continue">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="success" title="Upgrade request">
          {message}
        </Alert>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Coach seats</CardTitle>
            <CardDescription>
              {view.seats.coachesUsed} / {view.seats.coachesLimitLabel}
              {view.seats.coachesAtLimit ? " · at limit" : ""}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Athlete seats</CardTitle>
            <CardDescription>
              {view.seats.athletesUsed} / {view.seats.athletesLimitLabel}
              {view.seats.athletesAtLimit ? " · at limit" : ""}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Technique usage</CardTitle>
            <CardDescription>
              {view.usage.techniqueUsed} / {view.usage.techniqueLimitLabel}
              {view.usage.techniqueAtLimit ? " · at limit" : ""}
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>
              {view.checkout.enabled ? "Ready" : "Not live"}
            </CardDescription>
          </CardHeader>
        </Card>
      </section>

      <Alert tone="warning" title="Checkout status">
        {view.checkout.message}
      </Alert>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Plan features
        </h2>
        <ul className="space-y-1 text-sm">
          {view.features.map((f) => (
            <li key={f.id} className="text-[var(--color-muted)]">
              <Badge variant={f.included ? "success" : "neutral"}>
                {f.included ? "Included" : "Not included"}
              </Badge>{" "}
              {f.label}
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Plan catalog
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Prices show only when published via env — never hard-coded B2B dollars.
        </p>
        <ul className="grid gap-4 lg:grid-cols-2">
          {view.catalog.map((plan) => (
            <li key={plan.id}>
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap gap-2">
                    {plan.isCurrent ? (
                      <Badge variant="accent">Current</Badge>
                    ) : null}
                    <Badge variant="neutral">{plan.id}</Badge>
                  </div>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.tagline}</CardDescription>
                </CardHeader>
                <div className="space-y-1 px-1 pb-3 text-sm text-[var(--color-muted)]">
                  <p>
                    Coaches {plan.maxCoachesLabel} · Athletes{" "}
                    {plan.maxAthletesLabel}
                  </p>
                  <p>Monthly: {plan.monthlyLabel}</p>
                  <p>Annual: {plan.annualLabel}</p>
                  {plan.availabilityNote ? (
                    <p className="text-xs">{plan.availabilityNote}</p>
                  ) : null}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      {view.viewer.canManage ? (
        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
            Upgrade
          </h2>
          {view.upgrades.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              You are on the highest catalog tier.
            </p>
          ) : (
            <ul className="space-y-4">
              {view.upgrades.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-wrap items-start justify-between gap-3 border-t border-[var(--color-border)] pt-3"
                >
                  <div className="space-y-1">
                    <p className="font-medium text-[var(--color-foreground)]">
                      {u.name}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {u.tagline}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {u.monthlyLabel}
                    </p>
                    {u.availabilityNote ? (
                      <p className="text-xs text-[var(--color-subtle)]">
                        {u.availabilityNote}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={pending}
                    onClick={() => {
                      setError(null);
                      setMessage(null);
                      startTransition(async () => {
                        const fd = new FormData();
                        fd.set("organizationId", view.organization.id);
                        fd.set("targetPlanId", u.id);
                        fd.set("interval", "monthly");
                        const result = await requestOrgPlanUpgradeAction(fd);
                        if (!result.ok) {
                          setError(result.error);
                          return;
                        }
                        setMessage(result.message);
                        router.refresh();
                      });
                    }}
                  >
                    {u.checkoutReady ? "Start checkout" : "Request upgrade"}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}
