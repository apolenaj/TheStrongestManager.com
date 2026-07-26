"use client";

import { useActionState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import {
  LIFT_KEYS,
  LIFT_KEY_LABELS,
  type LiftVerificationBadge,
} from "@/domain/verified-lift";
import type { VerifiedLiftClaimView } from "@/services/verified-lift";
import {
  createVerifiedLiftAction,
  submitLiftReviewAction,
  type VerifiedLiftActionState,
} from "@/services/verified-lift/actions";

const initial: VerifiedLiftActionState = { ok: false };

function BadgeRow({ badges }: { badges: LiftVerificationBadge[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <Badge key={b.id} variant={b.variant} title={b.description}>
          {b.label}
        </Badge>
      ))}
    </div>
  );
}

export function VerifiedLiftClaimForm({
  techniqueOptions,
}: {
  techniqueOptions: Array<{ id: string; label: string }>;
}) {
  const [state, action, pending] = useActionState(
    createVerifiedLiftAction,
    initial,
  );

  return (
    <Card elevated>
      <CardHeader>
        <CardTitle>Log a lift claim</CardTitle>
        <CardDescription>
          Start self-reported. Attach video + metadata, then request review.
          Officially verified is competition-only after approval.
        </CardDescription>
      </CardHeader>

      <form action={action} className="grid gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Lift</span>
            <select
              name="liftKey"
              required
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
              defaultValue="squat"
            >
              {LIFT_KEYS.map((k) => (
                <option key={k} value={k}>
                  {LIFT_KEY_LABELS[k]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Custom label</span>
            <input
              name="liftLabel"
              placeholder="Optional"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Load (kg)</span>
            <input
              name="loadKg"
              type="number"
              step="0.5"
              min="1"
              required
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Reps</span>
            <input
              name="reps"
              type="number"
              min="1"
              max="100"
              defaultValue={1}
              required
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Performed on</span>
            <input
              name="performedAt"
              type="date"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Bodyweight (kg)</span>
            <input
              name="bodyweightKg"
              type="number"
              step="0.1"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--color-muted)]">Video evidence</span>
          <select
            name="techniqueAnalysisId"
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            defaultValue=""
          >
            <option value="">None — self-reported only</option>
            {techniqueOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Meet name</span>
            <input
              name="meetName"
              placeholder="Competition path"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Meet date</span>
            <input
              name="meetDate"
              type="date"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Federation</span>
            <input
              name="federation"
              placeholder="e.g. IPF"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Equipment</span>
            <input
              name="equipment"
              placeholder="Raw / wraps / …"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          <span className="text-[var(--color-muted)]">Note</span>
          <textarea
            name="athleteNote"
            rows={2}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
          />
        </label>

        {state.error ? (
          <p className="text-sm text-[var(--color-score-critical)]">
            {state.error}
          </p>
        ) : null}
        {state.message ? (
          <p className="text-sm text-[var(--color-score-excellent)]">
            {state.message}
          </p>
        ) : null}

        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save claim"}
        </Button>
      </form>
    </Card>
  );
}

function ClaimReviewActions({ claim }: { claim: VerifiedLiftClaimView }) {
  const [state, action, pending] = useActionState(
    submitLiftReviewAction,
    initial,
  );

  if (claim.reviewStatus === "pending_review") {
    return (
      <p className="text-sm text-[var(--color-muted)]">Awaiting manual review.</p>
    );
  }
  if (claim.reviewStatus === "revoked") return null;
  if (!claim.hasVideoEvidence) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Attach a technique video to request review.
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="claimId" value={claim.id} />
      <label className="grid gap-1 text-sm">
        <span className="text-[var(--color-muted)]">Review target</span>
        <select
          name="reviewTarget"
          className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2 py-1.5"
          defaultValue="video_submitted"
        >
          <option value="video_submitted">Video submitted</option>
          <option value="competition_verified">Competition verified</option>
        </select>
      </label>
      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Submitting…" : "Submit for review"}
      </Button>
      {state.error ? (
        <p className="w-full text-sm text-[var(--color-score-critical)]">
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p className="w-full text-sm text-[var(--color-score-excellent)]">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

export function VerifiedLiftClaimsList({
  claims,
}: {
  claims: VerifiedLiftClaimView[];
}) {
  if (claims.length === 0) {
    return (
      <EmptyState
        title="No lift claims yet"
        description="Log a self-reported lift to start. Video and competition verification require evidence and review."
      />
    );
  }

  return (
    <ul className="grid gap-4">
      {claims.map((claim) => (
        <li key={claim.id}>
          <Card elevated>
            <CardHeader>
              <BadgeRow badges={claim.badges} />
              <CardTitle className="mt-2 font-[family-name:var(--font-display)] text-xl tracking-tight">
                {claim.liftLabel} · {claim.loadKg} kg × {claim.reps}
              </CardTitle>
              <CardDescription>
                {claim.displayLabel}
                {claim.isOfficiallyVerified
                  ? " — criteria met"
                  : " — not officially verified unless competition criteria + approval"}
              </CardDescription>
            </CardHeader>
            <div className="grid gap-2 text-sm text-[var(--color-muted)]">
              {claim.metadata.performedAt ? (
                <p>Performed: {claim.metadata.performedAt}</p>
              ) : null}
              {claim.metadata.meetName ? (
                <p>
                  Meet: {claim.metadata.meetName}
                  {claim.metadata.meetDate
                    ? ` (${claim.metadata.meetDate})`
                    : ""}
                  {claim.metadata.federation
                    ? ` · ${claim.metadata.federation}`
                    : ""}
                </p>
              ) : null}
              {claim.reviewNote ? <p>Review note: {claim.reviewNote}</p> : null}
            </div>
            <div className="mt-4">
              <ClaimReviewActions claim={claim} />
            </div>
          </Card>
        </li>
      ))}
    </ul>
  );
}
