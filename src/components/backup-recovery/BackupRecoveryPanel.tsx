import type { BackupRecoverySnapshot } from "@/domain/backup-recovery";

function statusLabel(status: string): string {
  if (status === "documented") return "Documented";
  if (status === "partial") return "Partial";
  if (status === "planned") return "Planned";
  return status;
}

export function BackupRecoveryPanel({
  snapshot,
}: {
  snapshot: BackupRecoverySnapshot;
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
            Runbook
          </dt>
          <dd className="mt-1 font-mono text-sm">{snapshot.docPath}</dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Backup & recovery findings
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Area</th>
                <th className="py-2 pr-4 font-medium">Finding</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.findings.map((row) => (
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
