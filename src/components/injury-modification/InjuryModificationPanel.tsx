import { Alert, Badge, Button, ButtonLink } from "@/design-system";
import {
  INJURY_DECLARATION_LABELS,
  type InjuryModificationPlan,
} from "@/domain/injury-modification";
import type { InjuryModificationView } from "@/services/injury-modification";
import {
  clearInjuryModificationAction,
  createInjuryModificationAction,
} from "@/services/injury-modification/actions";

export function InjuryModificationPanel({
  view,
}: {
  view: InjuryModificationView;
}) {
  const plan: InjuryModificationPlan = view.plan;
  const activeRecords = view.records.filter((r) => r.status === "active");

  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Not a diagnosis">
        {view.healthcareDisclaimer}
      </Alert>
      <Alert tone="info" title="User-declared limitations">
        {plan.honesty[0]} {plan.honesty[2]}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Status
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge variant={plan.active ? "warning" : "success"}>
            {plan.active
              ? "Limitation declarations active"
              : "No active declarations"}
          </Badge>
          <Badge variant="neutral">Never diagnose</Badge>
          {plan.deferToPainSafe ? (
            <Badge variant="danger">Deferring to Pain-Safe</Badge>
          ) : null}
        </div>
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {plan.explanation.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        {plan.deferToPainSafe ? (
          <ButtonLink href="/app/pain-safe-response" variant="secondary">
            Open Pain-Safe Response
          </ButtonLink>
        ) : null}
      </section>

      {!plan.deferToPainSafe && plan.suggestions.length > 0 ? (
        <section className="grid gap-4">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            System may suggest
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Optional coaching options — you choose. Never auto-applied as
            treatment.
          </p>
          <ul className="grid gap-3">
            {plan.suggestions.map((s) => (
              <li
                key={s.kind}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{s.label}</p>
                    <p className="mt-1 text-sm text-[var(--color-muted)]">
                      {s.summary}
                    </p>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {s.coachingCue}
                    </p>
                  </div>
                  {s.href ? (
                    <ButtonLink href={s.href} variant="secondary" size="sm">
                      Open
                    </ButtonLink>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            {view.healthcareDisclaimer}
          </p>
        </section>
      ) : null}

      {activeRecords.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Active declarations
          </h2>
          <ul className="grid gap-3">
            {activeRecords.map((r) => (
              <li
                key={r.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {INJURY_DECLARATION_LABELS[r.declarationKind]}
                    </p>
                    {r.affectedArea ? (
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Focus: {r.affectedArea}
                      </p>
                    ) : null}
                    {r.instructionSource ? (
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        Source noted: {r.instructionSource}
                      </p>
                    ) : null}
                    {r.notes ? (
                      <p className="mt-1 text-sm text-[var(--color-muted)]">
                        {r.notes}
                      </p>
                    ) : null}
                  </div>
                  <form action={clearInjuryModificationAction}>
                    <input
                      type="hidden"
                      name="modificationId"
                      value={r.id}
                    />
                    <Button type="submit" variant="secondary" size="sm">
                      Clear
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-[var(--color-muted)]">
            Clearing a declaration is not medical clearance —{" "}
            {view.healthcareDisclaimer}
          </p>
        </section>
      ) : null}

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Declare a limitation
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Select how you want training modified. This does not diagnose anything.
        </p>
        <form action={createInjuryModificationAction} className="grid gap-4 max-w-xl">
          <fieldset className="grid gap-3">
            <legend className="sr-only">Limitation type</legend>
            {view.declarationOptions.map((opt) => (
              <label
                key={opt.id}
                className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
              >
                <input
                  type="radio"
                  name="declarationKind"
                  value={opt.id}
                  required
                  defaultChecked={opt.id === "avoid_painful_movement"}
                  className="mt-1"
                />
                <span>
                  <span className="font-medium">{opt.label}</span>
                  <span className="mt-1 block text-sm text-[var(--color-muted)]">
                    {opt.description}
                  </span>
                </span>
              </label>
            ))}
          </fieldset>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Focus area (optional)</span>
            <input
              name="affectedArea"
              type="text"
              placeholder="e.g. overhead pressing, left knee flexion"
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">
              Professional instruction source (if applicable)
            </span>
            <input
              name="instructionSource"
              type="text"
              placeholder="e.g. PT, physician, coach"
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2"
            />
          </label>

          <label className="grid gap-1 text-sm">
            <span className="font-medium">Notes (optional)</span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Training context only — not a medical record"
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2"
            />
          </label>

          <p className="text-sm text-[var(--color-muted)]">
            {view.healthcareDisclaimer}
          </p>
          <Button type="submit">Save declaration</Button>
        </form>
      </section>
    </div>
  );
}
