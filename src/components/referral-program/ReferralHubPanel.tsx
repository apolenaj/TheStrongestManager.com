"use client";

import { useState } from "react";
import { Alert, Badge, Button } from "@/design-system";
import type { ReferralProgramView } from "@/services/referral-program";

export function ReferralHubPanel({ view }: { view: ReferralProgramView }) {
  const [copied, setCopied] = useState(false);

  function copyInvite() {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}${view.invitePath}`;
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Not a business opportunity">
        {view.antiPyramid[0]} {view.antiPyramid[1]}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Your referral code
        </h2>
        <p className="font-mono text-2xl tracking-wide text-[var(--color-foreground)]">
          {view.code}
        </p>
        <p className="text-sm text-[var(--color-muted)] break-all">
          Invite path: {view.invitePath}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" onClick={copyInvite}>
            {copied ? "Copied" : "Copy invite link"}
          </Button>
        </div>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Possible rewards
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Architecture supports these product rewards. Defaults grant technique
          credits after the invitee finishes onboarding — not for bare signup.
        </p>
        <ul className="grid gap-3">
          {view.rewardCatalog.map((r) => (
            <li
              key={r.kind}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{r.label}</span>
                {view.defaultRewards.some((d) => d.kind === r.kind) ? (
                  <Badge variant="accent">Default</Badge>
                ) : (
                  <Badge variant="neutral">Catalog</Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {r.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Activity
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Rewarded this month: {view.stats.rewardedThisMonth} /{" "}
          {view.abuseLimits.maxRewardedPerMonth} (abuse cap). Pending
          attributions: {view.stats.attributed}.
        </p>
        {view.recent.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No referrals yet. Share your code — rewards unlock only after they
            complete onboarding.
          </p>
        ) : (
          <ul className="grid gap-2">
            {view.recent.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-sm"
              >
                <span className="text-[var(--color-muted)]">
                  {new Date(r.attributedAt).toLocaleDateString()}
                </span>
                <Badge
                  variant={
                    r.status === "rewarded"
                      ? "success"
                      : r.status === "voided"
                        ? "neutral"
                        : "accent"
                  }
                >
                  {r.statusLabel}
                  {r.voidReason ? ` · ${r.voidReason}` : ""}
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>

      {view.myAccessGrants.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Complimentary access
          </h2>
          <ul className="grid gap-2 text-sm">
            {view.myAccessGrants.map((g, i) => (
              <li key={`${g.kind}-${g.endsAt}-${i}`}>
                {g.planId} · {g.kind} · ends {new Date(g.endsAt).toLocaleDateString()}{" "}
                ({g.status})
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
        {view.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
        {view.antiPyramid.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
