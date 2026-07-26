import type { EventDrivenSnapshot } from "@/domain/event-driven";
import type { getDomainEventQueueStats } from "@/services/event-driven/queue";

type Snapshot = EventDrivenSnapshot & {
  queue: ReturnType<typeof getDomainEventQueueStats>;
};

export function EventDrivenPanel({ snapshot }: { snapshot: Snapshot }) {
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
            Events
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.catalog.length}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Enqueued / processed
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.queue.enqueued} / {snapshot.queue.processed}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
            Idempotent skips
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.queue.skippedIdempotent}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Domain event catalog
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Background queue delivery — handlers never block the producer request.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-muted)]">
                <th className="py-2 pr-4 font-medium">Event</th>
                <th className="py-2 pr-4 font-medium">Emit after</th>
                <th className="py-2 pr-4 font-medium">Handlers</th>
                <th className="py-2 font-medium">Why background</th>
              </tr>
            </thead>
            <tbody>
              {snapshot.catalog.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-[var(--color-border)]/60 align-top"
                >
                  <td className="py-3 pr-4">
                    <p className="font-medium">{row.label}</p>
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                      {row.name}
                    </p>
                  </td>
                  <td className="py-3 pr-4 text-xs text-[var(--color-muted)]">
                    {row.emitAfter}
                  </td>
                  <td className="py-3 pr-4 font-mono text-xs">
                    {row.handlers.join(", ")}
                  </td>
                  <td className="py-3 text-xs text-[var(--color-muted)]">
                    {row.whyBackground}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Queue architecture path
        </h3>
        <ol className="mt-4 space-y-3">
          {snapshot.queuePath.map((phase) => (
            <li key={phase.id}>
              <p className="font-medium">
                Phase {phase.phase}: {phase.title}
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {phase.detail}
              </p>
            </li>
          ))}
        </ol>
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
