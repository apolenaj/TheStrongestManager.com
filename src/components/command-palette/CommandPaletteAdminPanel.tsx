import type { CommandPaletteSnapshot } from "@/domain/command-palette";
import { Badge } from "@/design-system";

export function CommandPaletteAdminPanel({
  snapshot,
}: {
  snapshot: CommandPaletteSnapshot;
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
            Commands
          </dt>
          <dd className="mt-1 font-[family-name:var(--font-display)] text-lg">
            {snapshot.commandCount}
          </dd>
        </div>
      </dl>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Shortcut
        </h3>
        <p className="mt-2">
          <Badge variant="accent">{snapshot.shortcutLabel}</Badge>
          <span className="ml-2 text-sm text-[var(--color-muted)]">
            Distinct from ⌘K content search
          </span>
        </p>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Example commands
        </h3>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
          {snapshot.examples.map((ex) => (
            <li key={ex.id}>
              <span className="font-medium text-[var(--color-foreground)]">
                {ex.label}
              </span>
              <span className="ml-2 font-mono text-[10px]">{ex.href}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-[family-name:var(--font-display)] text-lg">
          Categories
        </h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {snapshot.categories.map((c) => (
            <Badge key={c.id} variant="neutral">
              {c.label}
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
          Runbook: <code>{snapshot.docPath}</code>
        </p>
      </section>
    </div>
  );
}
