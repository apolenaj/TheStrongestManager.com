import type { EnterpriseSecuritySnapshot } from "@/domain/enterprise-security";

function statusLabel(status: string): string {
  if (status === "documented") return "Documented";
  if (status === "partial") return "Partial";
  if (status === "planned") return "Planned";
  if (status === "not_claimed") return "Not claimed";
  return status;
}

export function EnterpriseSecurityPanel({
  snapshot,
}: {
  snapshot: EnterpriseSecuritySnapshot;
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
            Documented
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.documented}
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
            Certs not obtained
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.counts.notClaimed}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Compliance certifications — not claimed
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Do not tell procurement these are held. Update this list only after a
          real audit report is available.
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.certificationsNotObtained.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Control registry
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Area</th>
                <th className="py-2 pr-4 font-medium">Control</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.controls.map((row) => (
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
                    <p className="mt-1 font-mono text-[10px] text-[var(--color-muted)]">
                      {row.evidence}
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
          Honesty
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {snapshot.honesty.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Runbook: <code>{snapshot.docPath}</code>
          {snapshot.relatedDocs.map((d) => (
            <span key={d}>
              {" "}
              · <code>{d}</code>
            </span>
          ))}
        </p>
      </section>
    </div>
  );
}
