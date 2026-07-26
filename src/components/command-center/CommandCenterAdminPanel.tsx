import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { CommandCenterSnapshot } from "@/domain/command-center";

export function CommandCenterAdminPanel({
  snapshot,
}: {
  snapshot: CommandCenterSnapshot;
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
            Sections
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.sections.length}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Default above fold
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {snapshot.defaultAboveFold.map((id) => (
            <Badge key={id} variant="accent">
              {id}
            </Badge>
          ))}
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Everything else scrolls below — users can customize.
        </p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Sections
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          {snapshot.sections.map((s) => (
            <li key={s.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {s.label}
              </span>
              <span className="ml-2 font-mono text-[10px]">{s.href}</span>
            </li>
          ))}
        </ul>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Adaptive densities</CardTitle>
          <CardDescription>
            Viewport-driven unless the athlete overrides in Customize.
          </CardDescription>
        </CardHeader>
        <div className="flex flex-wrap gap-2 px-1 pb-1">
          {snapshot.densities.map((d) => (
            <Badge key={d} variant="neutral">
              {d}
            </Badge>
          ))}
        </div>
      </Card>

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
