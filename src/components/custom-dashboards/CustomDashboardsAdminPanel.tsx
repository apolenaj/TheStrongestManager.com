import type { CustomDashboardsSnapshot } from "@/domain/custom-dashboards";
import { Badge } from "@/design-system";

export function CustomDashboardsAdminPanel({
  snapshot,
}: {
  snapshot: CustomDashboardsSnapshot;
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
            Focuses
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.focuses.length}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Smart defaults (above fold)
        </h3>
        <ul className="mt-3 space-y-3 text-sm text-[var(--color-muted)]">
          {snapshot.focuses.map((f) => (
            <li key={f.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {f.label}
              </span>
              <div className="mt-1 flex flex-wrap gap-1">
                {f.aboveFold.map((w) => (
                  <Badge key={w} variant="neutral">
                    {w}
                  </Badge>
                ))}
              </div>
              <p className="mt-1 text-xs">{f.description}</p>
            </li>
          ))}
        </ul>
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
          Storage: <code>{snapshot.storageKey}</code> ·{" "}
          <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
