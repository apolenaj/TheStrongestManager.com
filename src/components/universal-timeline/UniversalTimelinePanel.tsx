import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import {
  TIMELINE_EVENT_KINDS,
  TIMELINE_EVENT_KIND_LABELS,
  type TimelineEventKind,
  type TimelineViewModel,
} from "@/domain/universal-timeline";

function formatWhen(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function toggleHref(
  current: TimelineEventKind[],
  kind: TimelineEventKind,
): string {
  const set = new Set(current);
  if (set.has(kind)) set.delete(kind);
  else set.add(kind);
  const next = TIMELINE_EVENT_KINDS.filter((k) => set.has(k));
  if (next.length === 0) return "/app/timeline";
  return `/app/timeline?kinds=${next.join(",")}`;
}

export function UniversalTimelinePanel({
  view,
}: {
  view: TimelineViewModel;
}) {
  const active = view.filters.kinds;

  return (
    <div className="space-y-8">
      <Alert tone="info" title="Logged history only">
        {view.honesty[0]}
      </Alert>

      <section aria-labelledby="timeline-filters">
        <h2
          id="timeline-filters"
          className="mb-3 font-[family-name:var(--font-display)] text-lg font-semibold"
        >
          Filters
        </h2>
        <p className="mb-3 text-sm text-[var(--color-muted)]">
          Toggle event types. Empty selection shows everything.{" "}
          <Link
            href="/app/timeline"
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
          >
            Clear filters
          </Link>
        </p>
        <ul className="flex flex-wrap gap-2">
          {TIMELINE_EVENT_KINDS.map((kind) => {
            const on = active.length === 0 || active.includes(kind);
            const count = view.countsByKind[kind];
            return (
              <li key={kind}>
                <Link
                  href={toggleHref(active, kind)}
                  className={`inline-flex items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-1.5 text-sm transition-colors ${
                    active.includes(kind)
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-foreground)]"
                      : on && active.length === 0
                        ? "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] hover:border-[var(--color-accent)]/40"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] hover:border-[var(--color-accent)]/40"
                  }`}
                >
                  {TIMELINE_EVENT_KIND_LABELS[kind]}
                  <span className="tabular-nums text-xs text-[var(--color-muted)]">
                    {count}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="timeline-events">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2
            id="timeline-events"
            className="font-[family-name:var(--font-display)] text-lg font-semibold"
          >
            History
          </h2>
          <p className="text-xs text-[var(--color-muted)]">
            Showing {view.events.length}
            {view.totalBeforeFilter !== view.events.length
              ? ` of ${view.totalBeforeFilter}`
              : ""}{" "}
            events
          </p>
        </div>

        {view.events.length === 0 ? (
          <EmptyState
            title="No timeline events yet"
            description="Complete a workout, log a PR, upload technique, save a program version, add competition prep, log bodyweight, or receive a coach note — history appears here when it exists."
          />
        ) : (
          <ol className="relative space-y-0 border-l border-[var(--color-border)] pl-6">
            {view.events.map((event) => (
              <li key={event.id} className="relative pb-8 last:pb-0">
                <span
                  className="absolute -left-[1.55rem] top-1.5 h-3 w-3 rounded-full border-2 border-[var(--color-accent)] bg-[var(--color-background)]"
                  aria-hidden
                />
                <Card>
                  <CardHeader className="mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">
                        {TIMELINE_EVENT_KIND_LABELS[event.kind]}
                      </Badge>
                      {event.meta ? (
                        <Badge variant="info">{event.meta}</Badge>
                      ) : null}
                      <time
                        dateTime={event.occurredAt}
                        className="text-xs text-[var(--color-muted)]"
                      >
                        {formatWhen(event.occurredAt)}
                      </time>
                    </div>
                    <CardTitle>
                      {event.href ? (
                        <Link
                          href={event.href}
                          className="hover:text-[var(--color-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-focus)]"
                        >
                          {event.title}
                        </Link>
                      ) : (
                        event.title
                      )}
                    </CardTitle>
                    <CardDescription>{event.summary}</CardDescription>
                  </CardHeader>
                </Card>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
