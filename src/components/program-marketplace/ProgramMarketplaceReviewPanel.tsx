"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Alert, Badge, Button } from "@/design-system";
import type { ProgramListingCard } from "@/services/program-marketplace";
import { reviewProgramListingAction } from "@/services/program-marketplace/actions";

export function ProgramMarketplaceReviewPanel({
  listings,
}: {
  listings: ProgramListingCard[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6">
      <Alert tone="warning" title="Copyright review">
        Reject unauthorized copyrighted program uploads. Publish only when
        attestation and content look legitimate.
      </Alert>
      {listings.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">No listings in queue.</p>
      ) : (
        <ul className="grid gap-3">
          {listings.map((l) => (
            <li
              key={l.id}
              className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{l.title}</span>
                <Badge variant="accent">{l.sportLabel}</Badge>
                <Badge variant="neutral">{l.statusLabel}</Badge>
              </div>
              <p className="text-sm text-[var(--color-muted)] line-clamp-2">
                {l.preview}
              </p>
              <p className="text-xs text-[var(--color-muted)]">
                By {l.creatorDisplay} · {l.difficultyLabel} · {l.durationWeeks}{" "}
                weeks
              </p>
              <div className="flex flex-wrap gap-2">
                {l.listingStatus === "pending_review" ? (
                  <>
                    <ReviewButton
                      listingId={l.id}
                      toStatus="published"
                      label="Publish"
                      pending={pending}
                      startTransition={startTransition}
                      router={router}
                    />
                    <ReviewButton
                      listingId={l.id}
                      toStatus="rejected"
                      label="Reject"
                      variant="secondary"
                      pending={pending}
                      startTransition={startTransition}
                      router={router}
                    />
                  </>
                ) : null}
                {l.listingStatus === "published" ? (
                  <ReviewButton
                    listingId={l.id}
                    toStatus="suspended"
                    label="Suspend"
                    variant="secondary"
                    pending={pending}
                    startTransition={startTransition}
                    router={router}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ReviewButton({
  listingId,
  toStatus,
  label,
  variant,
  pending,
  startTransition,
  router,
}: {
  listingId: string;
  toStatus: string;
  label: string;
  variant?: "secondary";
  pending: boolean;
  startTransition: (fn: () => void) => void;
  router: { refresh: () => void };
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          await reviewProgramListingAction(fd);
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <input type="hidden" name="toStatus" value={toStatus} />
      <Button
        type="submit"
        size="sm"
        variant={variant}
        loading={pending}
      >
        {label}
      </Button>
    </form>
  );
}
