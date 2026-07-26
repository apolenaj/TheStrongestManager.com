"use client";

import { useActionState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import type { CoachMarketplaceWorkspace } from "@/services/marketplace";
import {
  closeInquiryAction,
  saveCoachListingAction,
  type MarketplaceActionState,
} from "@/services/marketplace/actions";

const initial: MarketplaceActionState = { ok: false };

export function CoachMarketplaceControls({
  view,
}: {
  view: CoachMarketplaceWorkspace;
}) {
  const [listState, listAction, listPending] = useActionState(
    saveCoachListingAction,
    initial,
  );
  const [closeState, closeAction, closePending] = useActionState(
    closeInquiryAction,
    initial,
  );

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Marketplace listing">
        Control availability, pricing, and specializations. Consultation
        requests arrive below — no payments are processed in this MVP.
      </Alert>

      <Card elevated>
        <CardHeader>
          <CardTitle>Listing controls</CardTitle>
          <CardDescription>
            {view.profile ? (
              <>
                Status:{" "}
                <Badge
                  variant={
                    view.profile.listingStatus === "published"
                      ? "success"
                      : "neutral"
                  }
                >
                  {view.profile.listingStatus}
                </Badge>
                {view.profile.listingStatus === "published" ? (
                  <>
                    {" "}
                    · Public: /coaching/{view.profile.slug}
                  </>
                ) : null}
              </>
            ) : (
              "Create a draft listing, then publish when ready."
            )}
          </CardDescription>
        </CardHeader>
        <form action={listAction} className="grid gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Display name</span>
            <input
              name="displayName"
              required
              defaultValue={view.profile?.displayName ?? ""}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">URL slug</span>
            <input
              name="slug"
              defaultValue={view.profile?.slug ?? ""}
              placeholder="jane-powerlifting"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Bio</span>
            <textarea
              name="bio"
              rows={3}
              defaultValue={view.profile?.bio ?? ""}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">
              Specializations / sports (comma-separated)
            </span>
            <input
              name="specializations"
              defaultValue={view.profile?.specializations.join(", ") ?? ""}
              placeholder="powerlifting, technique"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Languages</span>
            <input
              name="languages"
              defaultValue={view.profile?.languages.join(", ") ?? ""}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Experience summary</span>
            <textarea
              name="experienceSummary"
              rows={2}
              defaultValue={view.profile?.experienceSummary ?? ""}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">
              Goal tags (comma-separated)
            </span>
            <input
              name="goalTags"
              defaultValue={view.profile?.goalTags.join(", ") ?? ""}
              placeholder="competition_prep, strength, technique"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">
              Experience levels coached
            </span>
            <input
              name="experienceLevels"
              defaultValue={view.profile?.experienceLevels.join(", ") ?? ""}
              placeholder="beginner, intermediate, advanced"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Coaching styles</span>
            <input
              name="coachingStyles"
              defaultValue={view.profile?.coachingStyles.join(", ") ?? ""}
              placeholder="meet_prep, technique_focused, async_programming"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">Timezone</span>
              <input
                name="timezone"
                defaultValue={view.profile?.timezone ?? ""}
                placeholder="Europe/Berlin"
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">Location label</span>
              <input
                name="locationLabel"
                defaultValue={view.profile?.locationLabel ?? ""}
                placeholder="Berlin, DE"
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              />
            </label>
          </div>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Availability</span>
            <select
              name="availabilityStatus"
              defaultValue={view.profile?.availabilityStatus ?? "closed"}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            >
              <option value="open">Open</option>
              <option value="limited">Limited</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Availability notes</span>
            <input
              name="availabilityNotes"
              defaultValue={view.profile?.availabilityNotes ?? ""}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">Pricing label</span>
              <input
                name="pricingLabel"
                defaultValue={view.profile?.pricingLabel ?? ""}
                placeholder="Consult from $80"
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">Amount (display)</span>
              <input
                name="pricingAmount"
                type="number"
                step="1"
                defaultValue={view.profile?.pricingAmount ?? ""}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">Currency</span>
              <input
                name="pricingCurrency"
                defaultValue={view.profile?.pricingCurrency ?? "USD"}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">Period</span>
              <input
                name="pricingPeriod"
                defaultValue={view.profile?.pricingPeriod ?? "session"}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              />
            </label>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="publish"
              defaultChecked={view.profile?.listingStatus === "published"}
              className="mt-1 accent-[var(--color-accent)]"
            />
            <span>
              Publish on /coaching (uncheck to keep draft — never invents
              coaches for others)
            </span>
          </label>
          <Button type="submit" disabled={listPending}>
            {listPending ? "Saving…" : "Save listing"}
          </Button>
          {listState.error ? (
            <p className="text-sm text-[var(--color-score-critical)]">
              {listState.error}
            </p>
          ) : null}
          {listState.message ? (
            <p className="text-sm text-[var(--color-score-excellent)]">
              {listState.message}
            </p>
          ) : null}
        </form>
      </Card>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Consultation requests
        </h2>
        {view.inquiries.length === 0 ? (
          <EmptyState
            title="No requests yet"
            description="When athletes request a consultation, they appear here."
          />
        ) : (
          <ul className="grid gap-3">
            {view.inquiries.map((inq) => (
              <li key={inq.id}>
                <Card>
                  <CardHeader>
                    <Badge
                      variant={inq.status === "open" ? "warning" : "neutral"}
                    >
                      {inq.status}
                    </Badge>
                    <CardDescription>
                      {new Date(inq.createdAt).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <p className="whitespace-pre-wrap text-sm">
                    {inq.message ?? "(no message)"}
                  </p>
                  {inq.status === "open" ? (
                    <form action={closeAction} className="mt-3">
                      <input type="hidden" name="inquiryId" value={inq.id} />
                      <Button
                        type="submit"
                        size="sm"
                        variant="secondary"
                        disabled={closePending}
                      >
                        Mark closed
                      </Button>
                    </form>
                  ) : null}
                </Card>
              </li>
            ))}
          </ul>
        )}
        {closeState.message ? (
          <p className="text-sm text-[var(--color-score-excellent)]">
            {closeState.message}
          </p>
        ) : null}
      </section>
    </div>
  );
}
