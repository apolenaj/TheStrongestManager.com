import type { WearableIntegrationSnapshot } from "@/domain/wearable-integration";

export function WearableIntegrationPanel({
  snapshot,
}: {
  snapshot: WearableIntegrationSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-3">
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
            Providers
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.providers.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Connected (live)
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.connectedCount}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Adapter registry
        </h3>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Architecture enabled: {snapshot.architectureEnabled ? "yes" : "no"}.
          Live sync flags stay off until real clients exist — stubs never invent
          samples.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-3 font-medium">Provider</th>
                <th className="py-2 pr-3 font-medium">Status</th>
                <th className="py-2 pr-3 font-medium">Live flag</th>
                <th className="py-2 font-medium">Planned kinds</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.providers.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-3">
                    <p className="font-medium">{p.label}</p>
                    <p className="mt-1 font-mono text-[10px] text-[var(--color-muted)]">
                      {p.id} · {p.platforms.join(", ")}
                    </p>
                  </td>
                  <td className="py-3 pr-3">{p.status}</td>
                  <td className="py-3 pr-3">
                    {p.liveSyncFlagOn ? "on" : "off"}
                  </td>
                  <td className="py-3 text-xs text-[var(--color-muted)]">
                    {p.plannedKinds.join(", ")}
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
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          Runbook: <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
