import type { GdprReadinessSnapshot } from "@/domain/gdpr-readiness";

function statusLabel(status: string): string {
  if (status === "ready") return "Ready";
  if (status === "partial") return "Partial";
  if (status === "planned") return "Planned";
  if (status === "legal_review_required") return "Legal review required";
  return status;
}

export function GdprReadinessPanel({
  snapshot,
}: {
  snapshot: GdprReadinessSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Engine
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.engineVersion}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Ready
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.ready}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Partial / planned
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.partial} / {snapshot.counts.planned}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Legal review
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.legalReviewRequired}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Legal surfaces — draft for review
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {snapshot.legalReviewBanner}
        </p>
        <ul className="mt-3 space-y-1 text-sm text-[var(--color-muted)]">
          {snapshot.legalSurfaces.map((s) => (
            <li key={s.path}>
              <a
                href={s.path}
                className="font-medium text-[var(--color-accent)] hover:underline"
              >
                {s.title}
              </a>{" "}
              <span className="font-mono text-xs">{s.path}</span> —{" "}
              {s.reviewStatus.replaceAll("_", " ")}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Workflows
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Area</th>
                <th className="py-2 pr-4 font-medium">Workflow</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.workflows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4 text-[var(--color-muted)]">
                    {row.area.replaceAll("_", " ")}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {row.detail}
                    </p>
                  </td>
                  <td className="py-3">{statusLabel(row.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Processing activities (product inventory)
        </h3>
        <ul className="mt-3 space-y-3 text-sm text-[var(--color-muted)]">
          {snapshot.processingActivities.map((a) => (
            <li key={a.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {a.purpose}
              </span>
              <span className="mt-1 block text-xs">
                {a.categories} · {a.legalBasisNote}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Retention intentions
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          {snapshot.retentionIntentions.map((r) => (
            <li key={r.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {r.asset}
              </span>
              — {r.intention}
            </li>
          ))}
        </ul>
      </section>

      <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
        {snapshot.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="text-xs text-[var(--color-muted)]">
        Runbook: <code>{snapshot.docPath}</code>
      </p>
    </div>
  );
}
