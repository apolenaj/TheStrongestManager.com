"use client";

import { useActionState, type ReactNode } from "react";
import { Alert, Button, ButtonLink } from "@/design-system";
import type { ConsentDashboard } from "@/services/model-improvement-consent";
import {
  revokeExpertReviewAction,
  revokeResearchVideosAction,
  setExpertReviewConsentAction,
  setResearchConsentAction,
  type ConsentActionState,
} from "@/services/model-improvement-consent/actions";

const initial: ConsentActionState = { ok: false };

function KindCard({
  title,
  summary,
  grants,
  never,
  revocable,
  revokeHow,
  statusDetail,
  active,
  children,
}: {
  title: string;
  summary: string;
  grants: string;
  never: string;
  revocable: boolean;
  revokeHow: string;
  statusDetail: string;
  active: boolean;
  children?: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
          {title}
        </h3>
        <span className="text-xs text-[var(--color-muted)]">
          {active ? "Active / opted in" : "Off / not opted in"}
        </span>
      </div>
      <p className="text-sm text-[var(--color-muted)]">{summary}</p>
      <p className="text-xs text-[var(--color-muted)]">
        <span className="font-medium text-[var(--color-foreground)]">
          Grants:
        </span>{" "}
        {grants}
      </p>
      <p className="text-xs text-[var(--color-muted)]">
        <span className="font-medium text-[var(--color-foreground)]">
          Never:
        </span>{" "}
        {never}
      </p>
      <p className="text-xs text-[var(--color-muted)]">{statusDetail}</p>
      {revocable ? (
        <p className="text-xs text-[var(--color-muted)]">
          <span className="font-medium text-[var(--color-foreground)]">
            Revoke:
          </span>{" "}
          {revokeHow}
        </p>
      ) : null}
      {children}
    </section>
  );
}

export function ModelImprovementConsentPanel({
  dashboard,
}: {
  dashboard: ConsentDashboard;
}) {
  const [expertState, expertAction, expertPending] = useActionState(
    setExpertReviewConsentAction,
    initial,
  );
  const [revokeExpertState, revokeExpertAction, revokeExpertPending] =
    useActionState(revokeExpertReviewAction, initial);
  const [researchState, researchAction, researchPending] = useActionState(
    setResearchConsentAction,
    initial,
  );
  const [revokeResearchState, revokeResearchAction, revokeResearchPending] =
    useActionState(revokeResearchVideosAction, initial);

  const service = dashboard.kinds.find((k) => k.id === "service_use")!;
  const expert = dashboard.kinds.find((k) => k.id === "expert_review")!;
  const research = dashboard.kinds.find(
    (k) => k.id === "research_model_improvement",
  )!;
  const serviceStatus = dashboard.statuses.find((s) => s.kind === "service_use")!;
  const expertStatus = dashboard.statuses.find((s) => s.kind === "expert_review")!;
  const researchStatus = dashboard.statuses.find(
    (s) => s.kind === "research_model_improvement",
  )!;

  return (
    <div className="space-y-6">
      <Alert tone="warning" title="No bundled consent">
        {dashboard.honesty[0]} Each section below is a separate choice.
      </Alert>

      <KindCard
        title={service.title}
        summary={service.summary}
        grants={service.grants}
        never={service.never}
        revocable={service.revocable}
        revokeHow={service.revokeHow}
        statusDetail={serviceStatus.detail}
        active={serviceStatus.active}
      >
        <div className="flex flex-wrap gap-2">
          <ButtonLink href="/app/technique" variant="secondary" size="sm">
            Technique videos
          </ButtonLink>
          <ButtonLink href="/app/settings" variant="secondary" size="sm">
            Delete account (bottom of Settings)
          </ButtonLink>
        </div>
      </KindCard>

      <KindCard
        title={expert.title}
        summary={expert.summary}
        grants={expert.grants}
        never={expert.never}
        revocable={expert.revocable}
        revokeHow={expert.revokeHow}
        statusDetail={expertStatus.detail}
        active={expertStatus.active}
      >
        <form action={expertAction} className="space-y-3">
          <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
            <input
              type="checkbox"
              name="optedIn"
              defaultChecked={dashboard.expertReview.accountOptIn}
              className="mt-1"
            />
            Account preference: I may allow expert review on videos I choose
            (still requires per-video opt-in — not research).
          </label>
          {expertState.error ? (
            <Alert tone="danger" title="Could not save">
              {expertState.error}
            </Alert>
          ) : null}
          {expertState.ok && expertState.message ? (
            <Alert tone="success" title="Saved">
              {expertState.message}
            </Alert>
          ) : null}
          <Button type="submit" size="sm" loading={expertPending}>
            Save expert preference
          </Button>
        </form>
        <form action={revokeExpertAction} className="space-y-2 pt-2">
          {revokeExpertState.message ? (
            <Alert tone="success" title="Revoked">
              {revokeExpertState.message}
            </Alert>
          ) : null}
          {revokeExpertState.error ? (
            <Alert tone="danger" title="Revoke failed">
              {revokeExpertState.error}
            </Alert>
          ) : null}
          <Button
            type="submit"
            variant="danger"
            size="sm"
            loading={revokeExpertPending}
          >
            Revoke expert share on all videos
          </Button>
        </form>
      </KindCard>

      <KindCard
        title={research.title}
        summary={research.summary}
        grants={research.grants}
        never={research.never}
        revocable={research.revocable}
        revokeHow={research.revokeHow}
        statusDetail={researchStatus.detail}
        active={researchStatus.active}
      >
        {!dashboard.research.moatEnabled ? (
          <Alert tone="info" title="Research consent unavailable">
            Enable modelImprovementConsent or dataMoat to change this setting.
          </Alert>
        ) : (
          <>
            <form action={researchAction} className="space-y-3">
              <label className="flex items-start gap-2 text-sm text-[var(--color-muted)]">
                <input
                  type="checkbox"
                  name="optedIn"
                  defaultChecked={dashboard.research.accountOptIn}
                  className="mt-1"
                />
                I opt in to anonymized research / model improvement (data moat).
                This does not enable expert review or public videos.
              </label>
              {researchState.error ? (
                <Alert tone="danger" title="Could not save">
                  {researchState.error}
                </Alert>
              ) : null}
              {researchState.ok && researchState.message ? (
                <Alert tone="success" title="Saved">
                  {researchState.message}
                </Alert>
              ) : null}
              <Button type="submit" size="sm" loading={researchPending}>
                Save research preference
              </Button>
            </form>
            <form action={revokeResearchAction} className="space-y-2 pt-2">
              {revokeResearchState.message ? (
                <Alert tone="success" title="Cleared">
                  {revokeResearchState.message}
                </Alert>
              ) : null}
              <Button
                type="submit"
                variant="secondary"
                size="sm"
                loading={revokeResearchPending}
              >
                Clear model-improvement flags on videos
              </Button>
            </form>
          </>
        )}
      </KindCard>

      <ul className="list-disc space-y-2 pl-5 text-xs text-[var(--color-muted)]">
        {dashboard.honesty.slice(1).map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="text-xs text-[var(--color-muted)]">
        Policy {dashboard.policyVersion}
      </p>
    </div>
  );
}
