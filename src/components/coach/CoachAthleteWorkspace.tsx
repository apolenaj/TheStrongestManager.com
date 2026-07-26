"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
  Label,
  Textarea,
} from "@/design-system";
import {
  COACH_MODIFICATION_KIND_LABELS,
  COACH_MODIFICATION_KINDS,
  COACH_WORKSPACE_SECTION_LABELS,
  COACH_WORKSPACE_SECTIONS,
} from "@/domain/coach";
import {
  createCoachModificationAction,
  createCoachNoteAction,
  withdrawCoachModificationAction,
} from "@/services/coach/actions";
import { summarizeCoachNotesAction } from "@/services/coaching-notes-intelligence/actions";
import type { CoachAthleteWorkspaceView } from "@/services/coach/coach-athlete-service";
import { featureFlags } from "@/config/feature-flags";

function LockedSection({ title, reason }: { title: string; reason: string }) {
  return (
    <EmptyState
      title={`${title} locked`}
      description={reason}
    />
  );
}

export function CoachAthleteWorkspace({
  view,
  showAiCopilotNav = false,
}: {
  view: CoachAthleteWorkspaceView;
  showAiCopilotNav?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function run(
    action: () => Promise<{ ok: true } | { ok: false; error: string }>,
  ) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setMessage("Saved.");
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-10">
      <Alert tone="info" title="Coach athlete workspace">
        {view.honesty[0]} {view.honesty[1]}
      </Alert>

      <div className="flex flex-wrap gap-2">
        {view.scopeLabels.map((label) => (
          <Badge key={label} variant="info">
            {label}
          </Badge>
        ))}
      </div>

      <nav
        aria-label="Workspace sections"
        className="flex flex-wrap gap-2 border-b border-[var(--color-border)] pb-3"
      >
        {COACH_WORKSPACE_SECTIONS.map((id) => (
          <a
            key={id}
            href={`#${id}`}
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)]"
          >
            {COACH_WORKSPACE_SECTION_LABELS[id]}
          </a>
        ))}
        {showAiCopilotNav ? (
          <a
            href="#ai-copilot"
            className="text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)]"
          >
            AI Copilot
          </a>
        ) : null}
      </nav>

      {error ? (
        <Alert tone="danger" title="Could not save">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="success" title="Updated">
          {message}
        </Alert>
      ) : null}

      <section id="overview" className="scroll-mt-24 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Overview
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <CardTitle>Sessions (7d)</CardTitle>
              <CardDescription>
                {view.overview.recentSessions7d}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active program</CardTitle>
              <CardDescription>
                {view.overview.activeProgramName ?? "None assigned"}
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Human coach open</CardTitle>
              <CardDescription>
                {view.overview.openCoachSuggestions} suggestions
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>AI pending</CardTitle>
              <CardDescription>
                {view.overview.openAiSuggestions} engine suggestions
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        {view.overview.techniqueTrendLabel ? (
          <p className="text-sm text-[var(--color-muted)]">
            {view.overview.techniqueTrendLabel}
          </p>
        ) : null}
      </section>

      <section id="training" className="scroll-mt-24 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Training
        </h2>
        {view.training.locked ? (
          <LockedSection
            title="Training"
            reason="This athlete did not grant training or programs scope."
          />
        ) : view.training.sessions.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No recent training sessions to review.
          </p>
        ) : (
          <ul className="space-y-3">
            {view.training.sessions.map((s) => (
              <li
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3"
              >
                <div>
                  <p className="font-medium text-[var(--color-foreground)]">
                    {s.title}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    <Badge variant="neutral">{s.status}</Badge>
                    {s.completedAt
                      ? ` · ${new Date(s.completedAt).toLocaleString()}`
                      : ""}
                    {s.perceivedEffort != null
                      ? ` · RPE ${s.perceivedEffort}`
                      : ""}
                  </p>
                </div>
                <form
                  className="flex flex-wrap items-end gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const fd = new FormData(e.currentTarget);
                    run(() => createCoachNoteAction(fd));
                    e.currentTarget.reset();
                  }}
                >
                  <input
                    type="hidden"
                    name="athleteProfileId"
                    value={view.athleteProfileId}
                  />
                  <input type="hidden" name="section" value="training" />
                  <input type="hidden" name="relatedType" value="training_session" />
                  <input type="hidden" name="relatedId" value={s.id} />
                  <div>
                    <Label htmlFor={`comment-${s.id}`} className="sr-only">
                      Comment
                    </Label>
                    <Input
                      id={`comment-${s.id}`}
                      name="body"
                      required
                      placeholder="Leave a review comment"
                      className="min-h-10 min-w-[12rem]"
                    />
                  </div>
                  <Button type="submit" size="sm" disabled={pending}>
                    Comment
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="technique" className="scroll-mt-24 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Technique
        </h2>
        {view.technique.locked ? (
          <LockedSection
            title="Technique"
            reason="Technique summary scope was not granted."
          />
        ) : view.technique.items.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No technique analyses yet.
          </p>
        ) : (
          <ul className="space-y-3">
            {view.technique.items.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap justify-between gap-3 border-t border-[var(--color-border)] pt-3"
              >
                <div>
                  <p className="text-sm text-[var(--color-foreground)]">
                    Score {t.overallScore ?? "—"} · {t.status}
                  </p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {new Date(t.createdAt).toLocaleString()}
                    {!view.technique.mediaAllowed
                      ? " · Media hidden (scope not granted)"
                      : ""}
                  </p>
                </div>
                {t.href ? (
                  <ButtonLink href={t.href} variant="secondary" size="sm">
                    Open report
                  </ButtonLink>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="progress" className="scroll-mt-24 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Progress
        </h2>
        {view.progress.locked ? (
          <LockedSection
            title="Progress"
            reason="Training or programs scope required."
          />
        ) : view.progress.metrics.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No progress metrics in range.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {view.progress.metrics.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap justify-between gap-2 border-t border-[var(--color-border)] pt-2"
              >
                <span>
                  {m.metricKey} · {m.value}
                  {m.unit ? ` ${m.unit}` : ""}
                </span>
                <span className="text-[var(--color-muted)]">
                  {new Date(m.recordedAt).toLocaleDateString()} · {m.source}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="recovery" className="scroll-mt-24 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Recovery
        </h2>
        {view.recovery.locked ? (
          <LockedSection
            title="Recovery"
            reason="Recovery scope was not granted by the athlete."
          />
        ) : view.recovery.entries.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No recovery check-ins yet.
          </p>
        ) : (
          <ul className="space-y-2 text-sm">
            {view.recovery.entries.map((e) => (
              <li
                key={e.id}
                className="border-t border-[var(--color-border)] pt-2"
              >
                <p className="text-[var(--color-foreground)]">
                  {new Date(e.recordedAt).toLocaleString()}
                  {e.readiness != null ? ` · Readiness ${e.readiness}` : ""}
                </p>
                <p className="text-[var(--color-muted)]">
                  {[
                    e.soreness != null ? `Soreness ${e.soreness}` : null,
                    e.stress != null ? `Stress ${e.stress}` : null,
                    e.fatigue != null ? `Fatigue ${e.fatigue}` : null,
                    e.sleepHours != null ? `Sleep ${e.sleepHours}h` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Subjective fields not logged"}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="notes" className="scroll-mt-24 space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Notes
        </h2>
        {featureFlags.coachingNotesIntelligence ? (
          <Alert tone="info" title="Coaching Notes Intelligence">
            Sources are always labelled. Private notes are never used for AI
            summaries or unrelated product features.
          </Alert>
        ) : null}
        <form
          className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            run(() => createCoachNoteAction(fd));
            e.currentTarget.reset();
          }}
        >
          <input
            type="hidden"
            name="athleteProfileId"
            value={view.athleteProfileId}
          />
          <div>
            <Label htmlFor="note-section">Section</Label>
            <select
              id="note-section"
              name="section"
              defaultValue="notes"
              className="mt-1 flex h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm text-[var(--color-foreground)]"
            >
              {COACH_WORKSPACE_SECTIONS.map((s) => (
                <option key={s} value={s}>
                  {COACH_WORKSPACE_SECTION_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="note-body">Comment</Label>
            <Textarea
              id="note-body"
              name="body"
              required
              rows={3}
              className="mt-1"
              placeholder="Timestamped coach note…"
            />
          </div>
          {featureFlags.coachingNotesIntelligence ? (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isPrivate" />
              Private note (excluded from AI summaries and unrelated product
              use)
            </label>
          ) : null}
          <Button type="submit" disabled={pending}>
            Add note
          </Button>
        </form>

        {featureFlags.coachingNotesIntelligence ? (
          <form
            className="flex flex-wrap items-center gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              run(() => summarizeCoachNotesAction(fd));
            }}
          >
            <input
              type="hidden"
              name="athleteProfileId"
              value={view.athleteProfileId}
            />
            <Button type="submit" variant="secondary" disabled={pending}>
              Generate AI summary
            </Button>
            <span className="text-sm text-[var(--color-muted)]">
              Private notes are never included.
            </span>
          </form>
        ) : null}

        {view.noteSummaries.length > 0 ? (
          <ul className="space-y-3">
            {view.noteSummaries.map((s) => (
              <li
                key={s.id}
                className="border-t border-[var(--color-border)] pt-3 text-sm"
              >
                <div className="mb-1 flex flex-wrap gap-2">
                  <Badge variant="info">{s.sourceLabel}</Badge>
                  <span className="text-[var(--color-muted)]">
                    {new Date(s.createdAt).toLocaleString()}
                  </span>
                  {s.excludedPrivateCount > 0 ? (
                    <Badge variant="neutral">
                      {s.excludedPrivateCount} private excluded
                    </Badge>
                  ) : null}
                </div>
                <pre className="whitespace-pre-wrap font-sans text-[var(--color-foreground)]">
                  {s.body}
                </pre>
              </li>
            ))}
          </ul>
        ) : null}

        {view.notes.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">No coach notes yet.</p>
        ) : (
          <ul className="space-y-3">
            {view.notes.map((n) => (
              <li
                key={n.id}
                className="border-t border-[var(--color-border)] pt-3 text-sm"
              >
                <div className="mb-1 flex flex-wrap gap-2">
                  <Badge variant="accent">{n.sourceLabel}</Badge>
                  {n.isPrivate ? (
                    <Badge variant="warning">Private</Badge>
                  ) : null}
                  <Badge variant="neutral">{n.section}</Badge>
                  <span className="text-[var(--color-muted)]">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-[var(--color-foreground)]">{n.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section id="recommendations" className="scroll-mt-24 space-y-6">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
          Recommendations
        </h2>
        {!view.sectionAccess.recommendations ? (
          <LockedSection
            title="Recommendations"
            reason="Training, programs, or technique scope required."
          />
        ) : (
          <>
            <Alert tone="warning" title="Authorship separation">
              Human coach suggestions below are auditable decisions. AI engine
              and system items are labelled separately and are not coach
              decisions.
            </Alert>

            <form
              className="space-y-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                run(() => createCoachModificationAction(fd));
                e.currentTarget.reset();
              }}
            >
              <h3 className="font-medium text-[var(--color-foreground)]">
                Suggest a modification (human coach)
              </h3>
              <input
                type="hidden"
                name="athleteProfileId"
                value={view.athleteProfileId}
              />
              <div>
                <Label htmlFor="mod-kind">Kind</Label>
                <select
                  id="mod-kind"
                  name="kind"
                  defaultValue="general"
                  className="mt-1 flex h-12 w-full rounded-[var(--radius-md)] border border-[var(--color-border-strong)] bg-transparent px-3 text-sm"
                >
                  {COACH_MODIFICATION_KINDS.map((k) => (
                    <option key={k} value={k}>
                      {COACH_MODIFICATION_KIND_LABELS[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="mod-title">Title</Label>
                <Input id="mod-title" name="title" required className="mt-1 min-h-12" />
              </div>
              <div>
                <Label htmlFor="mod-body">Details</Label>
                <Textarea
                  id="mod-body"
                  name="body"
                  required
                  rows={3}
                  className="mt-1"
                />
              </div>
              <Button type="submit" disabled={pending}>
                Save suggestion
              </Button>
            </form>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--color-foreground)]">
                Human coach
              </h3>
              {view.recommendations.humanCoach.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  No coach suggestions yet.
                </p>
              ) : (
                <ul className="space-y-4">
                  {view.recommendations.humanCoach.map((m) => (
                    <li
                      key={m.id}
                      className="space-y-2 border-t border-[var(--color-border)] pt-3"
                    >
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="accent">{m.authorshipLabel}</Badge>
                        <Badge variant="neutral">{m.status}</Badge>
                        <Badge variant="info">{m.kind.replaceAll("_", " ")}</Badge>
                        <span className="text-xs text-[var(--color-muted)]">
                          {new Date(m.createdAt).toLocaleString()} ·{" "}
                          {m.eventCount} audit event
                          {m.eventCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p className="font-medium text-[var(--color-foreground)]">
                        {m.title}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">{m.body}</p>
                      {m.status === "open" ? (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            const fd = new FormData(e.currentTarget);
                            run(() => withdrawCoachModificationAction(fd));
                          }}
                        >
                          <input
                            type="hidden"
                            name="modificationId"
                            value={m.id}
                          />
                          <input
                            type="hidden"
                            name="athleteProfileId"
                            value={view.athleteProfileId}
                          />
                          <Button
                            type="submit"
                            variant="danger"
                            size="sm"
                            disabled={pending}
                          >
                            Withdraw
                          </Button>
                        </form>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--color-foreground)]">
                AI suggestions
              </h3>
              {view.recommendations.aiEngine.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  No adaptive engine suggestions.
                </p>
              ) : (
                <ul className="space-y-4">
                  {view.recommendations.aiEngine.map((a) => (
                    <li
                      key={a.id}
                      className="space-y-1 border-t border-[var(--color-border)] pt-3"
                    >
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="warning">{a.authorshipLabel}</Badge>
                        <Badge variant="neutral">{a.status}</Badge>
                        <Badge variant="info">{a.confidence}</Badge>
                        <span className="text-xs text-[var(--color-muted)]">
                          {new Date(a.createdAt).toLocaleString()} · source{" "}
                          {a.source}
                        </span>
                      </div>
                      <p className="font-medium text-[var(--color-foreground)]">
                        {a.title}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">{a.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-[var(--color-foreground)]">
                System recommendations
              </h3>
              {view.recommendations.system.length === 0 ? (
                <p className="text-sm text-[var(--color-muted)]">
                  No system recommendations.
                </p>
              ) : (
                <ul className="space-y-3">
                  {view.recommendations.system.map((r) => (
                    <li
                      key={r.id}
                      className="border-t border-[var(--color-border)] pt-3"
                    >
                      <div className="mb-1 flex flex-wrap gap-2">
                        <Badge variant="neutral">{r.authorshipLabel}</Badge>
                        <Badge variant="info">{r.category}</Badge>
                      </div>
                      <p className="font-medium text-[var(--color-foreground)]">
                        {r.title}
                      </p>
                      <p className="text-sm text-[var(--color-muted)]">{r.body}</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </section>

      <p>
        <ButtonLink href="/app/coach" variant="secondary">
          Back to coach dashboard
        </ButtonLink>
      </p>
    </div>
  );
}
