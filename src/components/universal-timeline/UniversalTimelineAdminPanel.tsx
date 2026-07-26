import type { UniversalTimelineSnapshot } from "@/domain/universal-timeline";
import { Badge } from "@/design-system";

export function UniversalTimelineAdminPanel({
  snapshot,
}: {
  snapshot: UniversalTimelineSnapshot;
}) {
  return (
    <div className="space-y-8">
      <dl className="grid gap-4 sm:grid-cols-2">
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
            Event kinds
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.kinds.length}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Kinds
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {snapshot.kinds.map((k) => (
            <Badge key={k.id} variant="neutral">
              {k.label}
            </Badge>
          ))}
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
          Athlete: <code>/app/timeline</code> · <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
