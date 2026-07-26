import { Alert, Badge, Button, ButtonLink } from "@/design-system";
import { summarizeCoachNotesFormAction } from "@/services/coaching-notes-intelligence/actions";
import type { CoachingNotesIntelligenceView } from "@/services/coaching-notes-intelligence";

export function CoachingNotesIntelligencePanel({
  view,
}: {
  view: CoachingNotesIntelligenceView;
}) {
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            {view.athleteDisplayName ?? "Athlete"}
          </h2>
          <p className="text-sm text-[var(--color-muted)]">
            Sources always shown: Coach note · AI summary
          </p>
        </div>
        <ButtonLink
          href={`/app/coach/${view.athleteProfileId}#notes`}
          variant="secondary"
          size="sm"
        >
          Open workspace notes
        </ButtonLink>
      </div>

      <Alert tone="info" title="Privacy">
        {view.honesty[2]}
      </Alert>

      <form action={summarizeCoachNotesFormAction} className="flex flex-wrap gap-3">
        <input
          type="hidden"
          name="athleteProfileId"
          value={view.athleteProfileId}
        />
        <Button type="submit">Generate AI summary</Button>
        <span className="self-center text-sm text-[var(--color-muted)]">
          Private notes are never included.
        </span>
      </form>

      {view.summaries.length > 0 ? (
        <section className="grid gap-3">
          <h3 className="font-semibold">AI summaries</h3>
          <ul className="grid gap-3">
            {view.summaries.map((s) => (
              <li
                key={s.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-sm"
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="info">{s.sourceLabel}</Badge>
                  <span className="text-[var(--color-muted)]">
                    {new Date(s.createdAt).toLocaleString()}
                  </span>
                </div>
                <pre className="whitespace-pre-wrap font-sans">{s.body}</pre>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-3">
        <h3 className="font-semibold">Coach notes</h3>
        {view.notes.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No coach notes yet.</p>
        ) : (
          <ul className="grid gap-3">
            {view.notes.map((n) => (
              <li
                key={n.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 text-sm"
              >
                <div className="mb-2 flex flex-wrap gap-2">
                  <Badge variant="accent">{n.sourceLabel}</Badge>
                  {n.isPrivate ? (
                    <Badge variant="warning">Private</Badge>
                  ) : null}
                  {n.section ? (
                    <Badge variant="neutral">{n.section}</Badge>
                  ) : null}
                  <span className="text-[var(--color-muted)]">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p>{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
