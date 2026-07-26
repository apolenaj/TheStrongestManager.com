import type { AccessibilityAuditSnapshot } from "@/domain/accessibility-system";

function statusLabel(status: string): string {
  if (status === "pass") return "Pass";
  if (status === "partial") return "Partial";
  if (status === "fail") return "Fail";
  return "N/A";
}

export function AccessibilityAuditPanel({
  snapshot,
}: {
  snapshot: AccessibilityAuditSnapshot;
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
            Pass
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.pass}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Partial
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.partial}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Fail
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.fail}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          WCAG audit criteria
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Surface</th>
                <th className="py-2 pr-4 font-medium">Criterion</th>
                <th className="py-2 pr-4 font-medium">WCAG</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium">Evidence</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.criteria.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4 text-[var(--color-muted)]">
                    {row.surface.replaceAll("_", " ")}
                  </td>
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {row.requirement}
                    </p>
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">{row.wcagRef}</td>
                  <td className="py-3 pr-4">{statusLabel(row.status)}</td>
                  <td className="py-3 text-xs text-[var(--color-muted)]">
                    {row.evidence}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Honesty
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
