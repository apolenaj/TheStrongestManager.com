"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Alert, Badge, Button } from "@/design-system";
import {
  activateHumanAnalysisDevPaymentAction,
  attachHumanAnalysisArtifactsAction,
  submitHumanAnalysisToQueueAction,
  type HumanAnalysisActionState,
} from "@/services/human-analysis/actions";
import type { HumanAnalysisTimelineStep } from "@/domain/human-analysis";

const initial: HumanAnalysisActionState = { ok: false };

export function HumanAnalysisOrderStatus({
  order,
  capacityMessage,
  turnaroundPromise,
  honesty,
  isDevelopment,
}: {
  order: {
    id: string;
    productName: string;
    productSku: string;
    status: string;
    statusLabel: string;
    paymentStatus: string;
    techniqueAnalysisId: string | null;
    programId: string | null;
    competitionPrepId: string | null;
    athleteNote: string | null;
    expertSummary: string | null;
    timeline: HumanAnalysisTimelineStep[];
  };
  capacityMessage: string;
  turnaroundPromise: string | null;
  honesty: readonly string[];
  isDevelopment: boolean;
}) {
  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="info">{order.statusLabel}</Badge>
        <Badge variant="neutral">{order.paymentStatus}</Badge>
        <Badge variant="neutral">{order.productName}</Badge>
      </div>

      <ol className="grid gap-2 sm:grid-cols-5">
        {order.timeline
          .filter((s) =>
            [
              "awaiting_purchase",
              "purchased",
              "awaiting_upload",
              "queued",
              "in_review",
              "report_ready",
            ].includes(s.status),
          )
          .map((step) => (
            <li
              key={step.status}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2 text-xs"
            >
              <span
                className={
                  step.state === "current"
                    ? "font-semibold text-[var(--color-accent)]"
                    : step.state === "done"
                      ? "text-[var(--color-foreground)]"
                      : "text-[var(--color-muted)]"
                }
              >
                {step.label}
              </span>
              <p className="text-[var(--color-muted)]">{step.state}</p>
            </li>
          ))}
      </ol>

      <Alert tone="info" title="Turnaround">
        {capacityMessage}
        {turnaroundPromise
          ? ` Published target: ${turnaroundPromise}`
          : " No turnaround time is promised."}
      </Alert>

      {order.status === "awaiting_purchase" ? (
        <div className="grid gap-3">
          <Alert tone="warning" title="Purchase required">
            {honesty[3]} Stripe checkout wires through the billing adapter when
            ready — this page never invents a successful charge.
          </Alert>
          {isDevelopment ? <DevPayForm orderId={order.id} /> : null}
        </div>
      ) : null}

      {order.status === "purchased" || order.status === "awaiting_upload" ? (
        <UploadAttachForm order={order} />
      ) : null}

      {(order.status === "awaiting_upload" ||
        order.status === "purchased") &&
      (order.techniqueAnalysisId ||
        order.programId ||
        order.competitionPrepId) ? (
        <QueueForm orderId={order.id} />
      ) : null}

      {order.status === "report_ready" && order.expertSummary ? (
        <section className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
          <h2 className="font-[family-name:var(--font-display)] text-lg">
            Expert report
          </h2>
          <p className="text-sm whitespace-pre-wrap">{order.expertSummary}</p>
          <p className="text-xs text-[var(--color-muted)]">{honesty[4]}</p>
        </section>
      ) : null}

      <Link
        href="/app/human-analysis"
        className="text-sm text-[var(--color-accent)] underline-offset-2 hover:underline"
      >
        All Expert Technique Review orders
      </Link>
    </div>
  );
}

function DevPayForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(
    activateHumanAnalysisDevPaymentAction,
    initial,
  );
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      {state.error ? (
        <Alert tone="danger" title="Activation failed">
          {state.error}
        </Alert>
      ) : null}
      {state.ok ? (
        <Alert tone="success" title="Dev purchase recorded">
          Payment waived for local development only.
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Activating…" : "Dev: mark purchased (local only)"}
      </Button>
    </form>
  );
}

function UploadAttachForm({
  order,
}: {
  order: {
    id: string;
    productSku: string;
    techniqueAnalysisId: string | null;
    programId: string | null;
    competitionPrepId: string | null;
    athleteNote: string | null;
  };
}) {
  const [state, action, pending] = useActionState(
    attachHumanAnalysisArtifactsAction,
    initial,
  );
  return (
    <form action={action} className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
      <input type="hidden" name="orderId" value={order.id} />
      <h2 className="font-medium">Upload / attach</h2>
      <p className="text-sm text-[var(--color-muted)]">
        Paste ids from existing Technique, Programs, or Competition prep. Upload
        new videos from{" "}
        <Link href="/app/technique" className="text-[var(--color-accent)]">
          Technique
        </Link>{" "}
        then attach here.
      </p>
      {order.productSku === "single_lift_review" ? (
        <label className="grid gap-1 text-sm">
          Technique analysis id
          <input
            name="techniqueAnalysisId"
            defaultValue={order.techniqueAnalysisId ?? ""}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            required
          />
        </label>
      ) : null}
      {order.productSku === "full_training_review" ? (
        <label className="grid gap-1 text-sm">
          Program id
          <input
            name="programId"
            defaultValue={order.programId ?? ""}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            required
          />
        </label>
      ) : null}
      {order.productSku === "competition_prep_review" ? (
        <label className="grid gap-1 text-sm">
          Competition prep id
          <input
            name="competitionPrepId"
            defaultValue={order.competitionPrepId ?? ""}
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
            required
          />
        </label>
      ) : null}
      <label className="grid gap-1 text-sm">
        Note for expert
        <textarea
          name="athleteNote"
          defaultValue={order.athleteNote ?? ""}
          rows={3}
          className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2"
        />
      </label>
      {state.error ? (
        <Alert tone="danger" title="Could not save">
          {state.error}
        </Alert>
      ) : null}
      {state.ok ? (
        <Alert tone="success" title="Saved">
          Artifacts attached.
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save attachments"}
      </Button>
    </form>
  );
}

function QueueForm({ orderId }: { orderId: string }) {
  const [state, action, pending] = useActionState(
    submitHumanAnalysisToQueueAction,
    initial,
  );
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="orderId" value={orderId} />
      {state.error ? (
        <Alert tone="danger" title="Could not queue">
          {state.error}
        </Alert>
      ) : null}
      {state.ok ? (
        <Alert tone="success" title="Queued">
          Your order is in the expert queue. Status updates here — no invented
          ETA.
        </Alert>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Queuing…" : "Submit to expert queue"}
      </Button>
    </form>
  );
}
