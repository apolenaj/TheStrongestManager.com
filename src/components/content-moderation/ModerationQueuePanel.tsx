"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Alert, Badge, Button } from "@/design-system";
import type {
  ContentModerationAuditView,
  ContentModerationReportView,
} from "@/services/content-moderation";
import { reviewContentReportAction } from "@/services/content-moderation/actions";

export function ModerationQueuePanel({
  reports,
  audit,
  honesty,
}: {
  reports: ContentModerationReportView[];
  audit: ContentModerationAuditView[];
  honesty: readonly string[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Unified moderation">
        Report · Review · Remove · Suspend. Every decision is audit logged.
        Empty queue means nothing is pending — we never invent reports.
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Open queue
        </h2>
        {reports.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No open reports. Community, marketplace, coach profiles, and UGC
            reports appear here when filed.
          </p>
        ) : (
          <ul className="grid gap-4">
            {reports.map((r) => (
              <li
                key={r.id}
                className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="accent">{r.targetLabel}</Badge>
                  <Badge variant="neutral">{r.statusLabel}</Badge>
                  <Badge variant="warning">{r.reasonLabel}</Badge>
                </div>
                <p className="text-sm text-[var(--color-muted)]">
                  {r.relatedType} · {r.relatedId}
                </p>
                {r.details ? (
                  <p className="text-sm whitespace-pre-wrap">{r.details}</p>
                ) : null}
                <p className="text-xs text-[var(--color-muted)]">
                  Filed {new Date(r.createdAt).toLocaleString()}
                </p>
                <div className="flex flex-wrap gap-2">
                  <StaffAction
                    reportId={r.id}
                    action="review"
                    label="Mark in review"
                    pending={pending}
                    startTransition={startTransition}
                    router={router}
                  />
                  <StaffAction
                    reportId={r.id}
                    action="remove"
                    label="Remove"
                    pending={pending}
                    startTransition={startTransition}
                    router={router}
                  />
                  <StaffAction
                    reportId={r.id}
                    action="suspend"
                    label="Suspend"
                    pending={pending}
                    startTransition={startTransition}
                    router={router}
                  />
                  <StaffAction
                    reportId={r.id}
                    action="dismiss"
                    label="Dismiss"
                    variant="secondary"
                    pending={pending}
                    startTransition={startTransition}
                    router={router}
                  />
                  <StaffAction
                    reportId={r.id}
                    action="restore"
                    label="Restore"
                    variant="secondary"
                    pending={pending}
                    startTransition={startTransition}
                    router={router}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Audit log
        </h2>
        {audit.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No audit entries yet.
          </p>
        ) : (
          <ul className="grid gap-2 text-sm">
            {audit.map((e) => (
              <li
                key={e.id}
                className="flex flex-wrap justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-3 py-2"
              >
                <span>
                  <Badge variant="neutral">{e.actionLabel}</Badge>{" "}
                  {e.target} · {e.relatedType}
                </span>
                <span className="text-[var(--color-muted)]">
                  {new Date(e.createdAt).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
        {honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

function StaffAction({
  reportId,
  action,
  label,
  variant,
  pending,
  startTransition,
  router,
}: {
  reportId: string;
  action: string;
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
          await reviewContentReportAction(fd);
          router.refresh();
        });
      }}
    >
      <input type="hidden" name="reportId" value={reportId} />
      <input type="hidden" name="action" value={action} />
      <Button type="submit" size="sm" variant={variant} loading={pending}>
        {label}
      </Button>
    </form>
  );
}
