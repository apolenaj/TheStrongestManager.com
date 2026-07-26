"use client";

import { useActionState } from "react";
import { Alert, Badge, Button, Input, Label } from "@/design-system";
import {
  AFFILIATE_PARTNER_TYPES,
  AFFILIATE_PARTNER_TYPE_LABELS,
} from "@/domain/affiliate-system";
import {
  applyAffiliateAction,
  type AffiliateActionState,
} from "@/services/affiliate-system/actions";
import type { AffiliateHubView } from "@/services/affiliate-system";
import { AffiliateDisclosureBanner } from "@/components/affiliate-system/AffiliateDisclosureBanner";

const initial: AffiliateActionState = { ok: false };

export function AffiliateHubPanel({ view }: { view: AffiliateHubView }) {
  const [state, action, pending] = useActionState(applyAffiliateAction, initial);

  return (
    <div className="grid gap-8">
      <AffiliateDisclosureBanner
        lines={view.disclosure}
        short={view.disclosureShort}
      />

      {view.partner ? (
        <>
          <section className="grid gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              Your partner profile
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium">{view.partner.displayName}</span>
              <Badge variant="accent">{view.partner.partnerTypeLabel}</Badge>
              <Badge
                variant={
                  view.partner.status === "active" ? "success" : "neutral"
                }
              >
                {view.partner.statusLabel}
              </Badge>
            </div>
            <p className="text-sm text-[var(--color-muted)]">
              Tracking code:{" "}
              <span className="font-mono text-[var(--color-foreground)]">
                {view.partner.trackingCode || "—"}
              </span>
            </p>
            <p className="text-sm text-[var(--color-muted)] break-all">
              Landing (disclosure required): {view.partner.landingPath}
            </p>
            {view.partner.status === "pending" ? (
              <Alert tone="info" title="Pending activation">
                Staff must activate your partner profile before public tracking
                works. Commission ledger rows appear after attributed
                conversions.
              </Alert>
            ) : null}
          </section>

          <section className="grid gap-3">
            <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
              Tracking
            </h2>
            <ul className="grid gap-2 text-sm text-[var(--color-muted)]">
              <li>Clicks: {view.stats.clicks}</li>
              <li>Conversions: {view.stats.conversions}</li>
              <li>
                Commission pending: $
                {(view.stats.commissionPendingCents / 100).toFixed(2)} (ledger
                estimate)
              </li>
              <li>
                Commission accrued: $
                {(view.stats.commissionAccruedCents / 100).toFixed(2)}
              </li>
            </ul>
          </section>

          {view.recentCommissions.length > 0 ? (
            <section className="grid gap-2">
              <h3 className="text-sm font-medium">Recent commission ledger</h3>
              <ul className="grid gap-2 text-sm">
                {view.recentCommissions.map((c) => (
                  <li
                    key={c.id}
                    className="flex flex-wrap justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
                  >
                    <span>${(c.amountCents / 100).toFixed(2)}</span>
                    <Badge variant="neutral">{c.statusLabel}</Badge>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : (
        <section className="grid gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Apply as creator, coach, or partner
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Applications start as pending. You must acknowledge disclosure
            before applying — partnerships are never shown publicly without it.
          </p>
          {state.error ? (
            <Alert tone="danger" title="Could not apply">
              {state.error}
            </Alert>
          ) : null}
          {state.message ? (
            <Alert tone="success" title="Submitted">
              {state.message}
            </Alert>
          ) : null}
          <form action={action} className="grid max-w-md gap-4">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                name="displayName"
                required
                maxLength={80}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="slug">Public slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="my-handle"
                maxLength={48}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="partnerType">Partner type</Label>
              <select
                id="partnerType"
                name="partnerType"
                required
                defaultValue=""
                className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
              >
                <option value="" disabled>
                  Select type
                </option>
                {AFFILIATE_PARTNER_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {AFFILIATE_PARTNER_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                name="disclosureAcknowledged"
                value="true"
                required
                className="mt-1"
              />
              <span>
                I acknowledge the affiliate disclosure above and understand
                commission ledger entries are estimates, not guaranteed payouts.
              </span>
            </label>
            <Button type="submit" loading={pending}>
              Apply
            </Button>
          </form>
        </section>
      )}

      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
        {view.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
