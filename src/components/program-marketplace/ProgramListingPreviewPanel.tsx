"use client";

import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Badge, Button, Label } from "@/design-system";
import type { ProgramListingCard } from "@/services/program-marketplace";
import {
  purchaseProgramListingAction,
  rateProgramListingAction,
  type ProgramMarketplaceActionState,
} from "@/services/program-marketplace/actions";
import { ReportContentControl } from "@/components/content-moderation/ReportContentControl";
import { featureFlags } from "@/config/feature-flags";

const rateInitial: ProgramMarketplaceActionState = { ok: false };

export function ProgramListingPreviewPanel({
  listing,
  viewerHasPurchase,
  canRate,
  honesty,
  copyrightProtection,
  isSignedIn,
}: {
  listing: ProgramListingCard;
  viewerHasPurchase: boolean;
  canRate: boolean;
  honesty: readonly string[];
  copyrightProtection: readonly string[];
  isSignedIn: boolean;
}) {
  const router = useRouter();
  const [purchasePending, startPurchase] = useTransition();
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null);
  const [rateState, rateAction, ratePending] = useActionState(
    rateProgramListingAction,
    rateInitial,
  );

  return (
    <div className="grid gap-8">
      <header className="grid gap-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">{listing.sportLabel}</Badge>
          <Badge variant="neutral">{listing.goalLabel}</Badge>
          <Badge variant="neutral">{listing.difficultyLabel}</Badge>
          <Badge variant="neutral">{listing.durationWeeks} weeks</Badge>
        </div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold">
          {listing.title}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          By {listing.creatorDisplay}
          {listing.ratingCount > 0
            ? ` · ${listing.averageStars}★ from ${listing.ratingCount} verified purchaser${listing.ratingCount === 1 ? "" : "s"}`
            : " · No verified ratings yet"}
        </p>
        <p className="text-lg font-medium">
          ${(listing.priceCents / 100).toFixed(2)} {listing.currency}
        </p>
      </header>

      <section className="grid gap-2">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Preview
        </h2>
        <p className="whitespace-pre-wrap text-[var(--color-muted)]">
          {listing.preview}
        </p>
        {listing.equipmentLabels.length > 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Equipment: {listing.equipmentLabels.join(" · ")}
          </p>
        ) : null}
      </section>

      <Alert tone="warning" title="Copyright">
        {copyrightProtection[0]} Listings are reviewed before publish.
      </Alert>

      {isSignedIn && featureFlags.contentModeration ? (
        <ReportContentControl
          relatedType="program_listing"
          relatedId={listing.id}
        />
      ) : null}

      {purchaseMessage ? (
        <Alert
          tone={purchaseMessage.includes("not") && purchaseMessage.includes("fail") ? "danger" : "success"}
          title="Purchase"
        >
          {purchaseMessage}
        </Alert>
      ) : null}

      {isSignedIn &&
      listing.listingStatus === "published" &&
      !viewerHasPurchase ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startPurchase(async () => {
              const result = await purchaseProgramListingAction(fd);
              if (result.ok) {
                setPurchaseMessage(result.message ?? "Purchase recorded.");
                router.refresh();
              } else {
                setPurchaseMessage(result.error ?? "Purchase failed.");
              }
            });
          }}
        >
          <input type="hidden" name="listingId" value={listing.id} />
          <Button type="submit" loading={purchasePending}>
            Record purchase (architecture stub)
          </Button>
          <p className="mt-2 text-xs text-[var(--color-muted)]">
            Live checkout is not required yet — this records a verified
            purchase so ratings and commission ledger can be tested.
          </p>
        </form>
      ) : null}

      {canRate ? (
        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Rate (verified purchaser)
          </h2>
          {rateState.error ? (
            <Alert tone="danger" title="Could not rate">
              {rateState.error}
            </Alert>
          ) : null}
          {rateState.message ? (
            <Alert tone="success" title="Rated">
              {rateState.message}
            </Alert>
          ) : null}
          <form action={rateAction} className="grid max-w-sm gap-3">
            <input type="hidden" name="listingId" value={listing.id} />
            <div>
              <Label htmlFor="stars">Stars</Label>
              <select
                id="stars"
                name="stars"
                required
                defaultValue="5"
                className="mt-1 flex h-11 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="comment">Comment (optional)</Label>
              <textarea
                id="comment"
                name="comment"
                rows={3}
                maxLength={500}
                className="mt-1 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" loading={ratePending}>
              Submit rating
            </Button>
          </form>
        </section>
      ) : null}

      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
        {honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
