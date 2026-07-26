"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Label,
  Textarea,
} from "@/design-system";
import {
  decideCoachAiSuggestionAction,
  generateCoachAiSuggestionsAction,
} from "@/services/coach-ai/actions";
import type { CoachAiCopilotPanelView } from "@/services/coach-ai/coach-ai-service";
import { SUGGESTION_AUTHORSHIP_LABELS } from "@/domain/coach";
import { fromCoachAiDraft } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

function SuggestionCard({
  athleteProfileId,
  item,
  pending,
  run,
}: {
  athleteProfileId: string;
  item: CoachAiCopilotPanelView["pending"][number];
  pending: boolean;
  run: (
    action: () => Promise<{ ok: boolean; error?: string }>,
  ) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editedChange, setEditedChange] = useState(item.suggestedChange);
  const [note, setNote] = useState("");

  const isPending = item.status === "pending";

  return (
    <article className="space-y-3 border-t border-[var(--color-border)] pt-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="warning">
          {SUGGESTION_AUTHORSHIP_LABELS.ai_engine}
        </Badge>
        <Badge variant="neutral">{item.status}</Badge>
        <ConfidenceBadge confidence={item.confidence} />
        <Badge variant="info">{item.kindLabel}</Badge>
      </div>

      <h3 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
        {item.title}
      </h3>

      <div className="space-y-2 text-sm">
        <p className="text-[var(--color-muted)]">
          <span className="font-medium text-[var(--color-foreground)]">
            Suggested change ·{" "}
          </span>
          {item.editedChange ?? item.suggestedChange}
        </p>
        <WhyAmISeeingThis
          view={fromCoachAiDraft({
            why: item.why,
            supportingData: item.supportingData,
            confidence: item.confidence,
          })}
        />
        {item.decisionNote ? (
          <p className="text-[var(--color-muted)]">
            <span className="font-medium text-[var(--color-foreground)]">
              Decision note ·{" "}
            </span>
            {item.decisionNote}
          </p>
        ) : null}
        {item.events.length > 0 ? (
          <p className="text-xs text-[var(--color-subtle)]">
            Audit:{" "}
            {item.events
              .map(
                (e) =>
                  `${e.eventType} (${new Date(e.createdAt).toLocaleString()})`,
              )
              .join(" · ")}
          </p>
        ) : null}
      </div>

      {isPending ? (
        <div className="space-y-3">
          <div>
            <Label htmlFor={`note-${item.id}`}>Decision note (optional)</Label>
            <Textarea
              id={`note-${item.id}`}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="Why you accept, edit, or reject…"
            />
          </div>

          {editing ? (
            <div className="space-y-2">
              <Label htmlFor={`edit-${item.id}`}>Edited change</Label>
              <Textarea
                id={`edit-${item.id}`}
                value={editedChange}
                onChange={(e) => setEditedChange(e.target.value)}
                rows={3}
                className="mt-1"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={pending}
                  onClick={() =>
                    run(() => {
                      const fd = new FormData();
                      fd.set("suggestionId", item.id);
                      fd.set("athleteProfileId", athleteProfileId);
                      fd.set("decision", "edit");
                      fd.set("editedChange", editedChange);
                      fd.set("decisionNote", note);
                      return decideCoachAiSuggestionAction(fd);
                    })
                  }
                >
                  Save edit as coach decision
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pending}
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                disabled={pending}
                onClick={() =>
                  run(() => {
                    const fd = new FormData();
                    fd.set("suggestionId", item.id);
                    fd.set("athleteProfileId", athleteProfileId);
                    fd.set("decision", "accept");
                    fd.set("decisionNote", note);
                    return decideCoachAiSuggestionAction(fd);
                  })
                }
              >
                Accept
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={pending}
                onClick={() => setEditing(true)}
              >
                Edit
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={pending}
                onClick={() =>
                  run(() => {
                    const fd = new FormData();
                    fd.set("suggestionId", item.id);
                    fd.set("athleteProfileId", athleteProfileId);
                    fd.set("decision", "reject");
                    fd.set("decisionNote", note);
                    return decideCoachAiSuggestionAction(fd);
                  })
                }
              >
                Reject
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

export function CoachAiCopilotPanel({
  athleteProfileId,
  view,
}: {
  athleteProfileId: string;
  view: CoachAiCopilotPanelView;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run(
    action: () => Promise<{ ok: boolean; error?: string; createdCount?: number }>,
  ) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        setError(result.error ?? "Something went wrong.");
        return;
      }
      if (result.createdCount != null) {
        setMessage(
          result.createdCount === 0
            ? "No new drafts — signals may be thin."
            : `Generated ${result.createdCount} suggestion(s).`,
        );
      } else {
        setMessage("Decision recorded.");
      }
      router.refresh();
    });
  }

  return (
    <section id="ai-copilot" className="scroll-mt-24 space-y-6">
      <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--color-foreground)]">
        AI Copilot
      </h2>

      <Alert tone="warning" title="AI never replaces your decision">
        {view.honesty[0]} {view.honesty[2]} Decisions are logged for review —
        they never auto-retrain production AI.
      </Alert>

      {error ? (
        <Alert tone="danger" title="Could not complete">
          {error}
        </Alert>
      ) : null}
      {message ? (
        <Alert tone="success" title="Updated">
          {message}
        </Alert>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          run(() => generateCoachAiSuggestionsAction(fd));
        }}
      >
        <input type="hidden" name="athleteProfileId" value={athleteProfileId} />
        <Button type="submit" disabled={pending}>
          Generate AI suggestions
        </Button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Pending (Accept · Edit · Reject)
        </h3>
        {view.pending.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            No pending AI suggestions. Generate drafts when you want a second
            look at week summary, performance changes, program drafts, or
            missing data.
          </p>
        ) : (
          <div className="space-y-4">
            {view.pending.map((item) => (
              <SuggestionCard
                key={item.id}
                athleteProfileId={athleteProfileId}
                item={item}
                pending={pending}
                run={run}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-[var(--color-foreground)]">
          Decision history
        </h3>
        {view.decided.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">
            Accept, edit, or reject a suggestion to build an audit trail.
          </p>
        ) : (
          <div className="space-y-4">
            {view.decided.map((item) => (
              <SuggestionCard
                key={item.id}
                athleteProfileId={athleteProfileId}
                item={item}
                pending={pending}
                run={run}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
