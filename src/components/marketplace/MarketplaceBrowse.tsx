import Link from "next/link";
import { getLocale } from "next-intl/server";
import {
  Alert,
  Badge,
  EmptyState,
} from "@/design-system";
import { MARKETPLACE_SPORT_FILTERS } from "@/domain/marketplace";
import { formatLocalizedMoney } from "@/domain/money";
import type { MarketplacePublicState } from "@/services/marketplace";
import { ComingSoon } from "@/components/ui/ComingSoon";

export async function MarketplaceBrowse({
  state,
}: {
  state: MarketplacePublicState;
}) {
  const locale = await getLocale();
  if (state.showComingSoon) {
    return (
      <div className="space-y-6">
        <ComingSoon
          title="Coaching marketplace"
          description="Human coaching listings will appear here when real coaches publish profiles, credentials, and pricing. None are listed yet."
          reason={
            state.flagEnabled
              ? "The catalog is empty until coaches publish. We do not show demo coaches."
              : "Browse stays off until coach supply and onboarding are ready."
          }
        />
        <Alert tone="info" title="How it works">
          Browse · filter by sport · view profile · request consultation.
          Payments are not processed yet — request workflow only. Later:{" "}
          {state.futureCapabilities.join(", ").replaceAll("_", " ")}.
        </Alert>
        <p className="text-sm text-[var(--color-muted)]">
          Prefer a reviewed premium engagement?{" "}
          <Link
            href="/coaching/premium"
            className="underline underline-offset-2"
          >
            Apply for premium coaching
          </Link>{" "}
          — applications do not promise acceptance.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Alert tone="info" title="Request workflow — no payments yet">
        {state.honesty[3] ?? state.honesty[1]}
      </Alert>

      <p className="text-sm text-[var(--color-muted)]">
        Looking for a reviewed premium coaching path?{" "}
        <Link
          href="/coaching/premium"
          className="underline underline-offset-2"
        >
          Apply here
        </Link>{" "}
        — acceptance is never promised.
      </p>

      <form className="flex flex-wrap items-end gap-3 text-sm" method="get">
        <label className="grid gap-1">
          <span className="text-xs text-[var(--color-muted)]">Sport</span>
          <select
            name="sport"
            defaultValue={state.sportFilter ?? ""}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          >
            <option value="">All sports</option>
            {MARKETPLACE_SPORT_FILTERS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="rounded-md border border-[var(--color-border)] px-3 py-2 text-[var(--color-foreground)]"
        >
          Filter
        </button>
      </form>

      {state.listings.length === 0 ? (
        <EmptyState
          title="No coaches match this filter"
          description="Try another sport, or clear the filter to see all published coaches."
        />
      ) : (
        <ul className="grid gap-6">
          {state.listings.map((coach) => (
            <li key={coach.id}>
              <Link
                href={`/coaching/${coach.slug}`}
                className="block rounded-[var(--radius-md)] border border-[var(--color-border)] p-5 transition hover:border-[var(--color-accent)]"
              >
                <div className="flex flex-wrap gap-2">
                  <Badge variant="accent">{coach.availabilityStatus}</Badge>
                  {coach.verifiedCredentialCount > 0 ? (
                    <Badge variant="success">
                      {coach.verifiedCredentialCount} verified credential
                      {coach.verifiedCredentialCount === 1 ? "" : "s"}
                    </Badge>
                  ) : coach.credentialCount > 0 ? (
                    <Badge variant="neutral">Credentials unverified</Badge>
                  ) : null}
                </div>
                <h2 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--color-foreground)]">
                  {coach.displayName}
                </h2>
                {coach.bio ? (
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    {coach.bio}
                  </p>
                ) : null}
                {coach.specializations.length > 0 ? (
                  <p className="mt-3 text-sm text-[var(--color-muted)]">
                    {coach.specializations.join(" · ")}
                  </p>
                ) : null}
                {coach.pricing.label || coach.pricing.amountCents != null ? (
                  <p className="mt-2 text-sm text-[var(--color-foreground)]">
                    {coach.pricing.label ??
                      (coach.pricing.amountCents != null
                        ? formatLocalizedMoney(
                            coach.pricing.amountCents,
                            coach.pricing.currency ?? "usd",
                            locale,
                          )
                        : null)}
                  </p>
                ) : (
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Pricing on request
                  </p>
                )}
                <p className="mt-3 text-sm text-[var(--color-accent)]">
                  View profile →
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
