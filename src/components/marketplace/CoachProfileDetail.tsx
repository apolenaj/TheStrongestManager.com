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
} from "@/design-system";
import type { PublicCoachDetail } from "@/services/marketplace";
import {
  requestConsultationAction,
  type MarketplaceActionState,
} from "@/services/marketplace/actions";
import { ReportContentControl } from "@/components/content-moderation/ReportContentControl";
import { featureFlags } from "@/config/feature-flags";

const initial: MarketplaceActionState = { ok: false };

export function CoachProfileDetail({
  coach,
}: {
  coach: PublicCoachDetail;
}) {
  const [state, action, pending] = useActionState(
    requestConsultationAction,
    initial,
  );

  return (
    <div className="grid gap-8">
      <div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="accent">{coach.availabilityStatus}</Badge>
          {coach.specializations.map((s) => (
            <Badge key={s} variant="info">
              {s}
            </Badge>
          ))}
        </div>
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight">
          {coach.displayName}
        </h1>
        {coach.bio ? (
          <p className="mt-4 text-[var(--color-muted)]">{coach.bio}</p>
        ) : null}
        {coach.experienceSummary ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Experience: {coach.experienceSummary}
          </p>
        ) : null}
        {coach.languages.length > 0 ? (
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Languages: {coach.languages.join(", ")}
          </p>
        ) : null}
        {featureFlags.contentModeration ? (
          <div className="mt-4">
            <ReportContentControl
              relatedType="coach_marketplace_profile"
              relatedId={coach.id}
            />
          </div>
        ) : null}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Pricing & availability</CardTitle>
          <CardDescription>
            Informational only — no checkout in this MVP.
          </CardDescription>
        </CardHeader>
        <p className="text-sm">
          {coach.pricing.label ||
            (coach.pricing.amountCents != null
              ? `${(coach.pricing.amountCents / 100).toFixed(0)} ${coach.pricing.currency ?? ""} / ${coach.pricing.billingPeriod ?? "session"}`
              : "Pricing on request")}
        </p>
        {coach.availability.notes ? (
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            {coach.availability.notes}
          </p>
        ) : null}
      </Card>

      {coach.credentials.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Credentials</CardTitle>
          </CardHeader>
          <ul className="grid gap-2 text-sm">
            {coach.credentials.map((c) => (
              <li key={c.id} className="flex flex-wrap items-center gap-2">
                <span>
                  {c.title}
                  {c.issuer ? ` · ${c.issuer}` : ""}
                </span>
                <Badge variant={c.isVerified ? "success" : "neutral"}>
                  {c.verificationLabel}
                </Badge>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <Alert tone="info" title="Consultation request">
        Send a request to this coach. Payments are not processed until payment
        architecture is ready.
      </Alert>

      <Card elevated>
        <CardHeader>
          <CardTitle>Request consultation</CardTitle>
          <CardDescription>
            The coach will see your message in their marketplace inbox.
          </CardDescription>
        </CardHeader>
        <form action={action} className="grid gap-3">
          <input type="hidden" name="slug" value={coach.slug} />
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--color-muted)]">Message</span>
            <textarea
              name="message"
              required
              minLength={20}
              rows={5}
              placeholder="Goals, experience, timeline…"
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            />
          </label>
          <Button type="submit" disabled={pending}>
            {pending ? "Sending…" : "Send request"}
          </Button>
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
        </form>
      </Card>
    </div>
  );
}
