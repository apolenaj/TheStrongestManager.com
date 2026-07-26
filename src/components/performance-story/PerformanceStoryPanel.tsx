"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import type { PerformanceStory } from "@/domain/performance-story";
import {
  createPerformanceStoryShareAction,
  type PerformanceStoryActionState,
} from "@/services/performance-story/actions";

const initial: PerformanceStoryActionState = { ok: false };

export function PerformanceStoryPanel({
  story,
  athleteDisplayName,
  sharePath,
}: {
  story: PerformanceStory;
  athleteDisplayName: string;
  sharePath: string | null;
}) {
  const [state, action, pending] = useActionState(
    createPerformanceStoryShareAction,
    initial,
  );
  const latestShare = state.sharePath ?? sharePath;

  return (
    <div className="space-y-8">
      <Alert tone="info" title="No fake causation">
        {story.causalityCaveat}
      </Alert>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="ui-eyebrow text-[var(--color-subtle)]">
            {athleteDisplayName}
          </p>
          <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
            {story.yearLabel}
          </h2>
        </div>
        <form action={action} className="flex flex-wrap items-center gap-2">
          <input type="hidden" name="year" value={story.yearKey} />
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? "Creating…" : "Create shareable yearly review"}
          </Button>
        </form>
      </div>

      {state.error ? (
        <Alert tone="warning" title="Share failed">
          {state.error}
        </Alert>
      ) : null}

      {latestShare ? (
        <Alert tone="success" title="Share link ready">
          <Link
            href={latestShare}
            className="text-[var(--color-accent)] underline-offset-2 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            {latestShare}
          </Link>
        </Alert>
      ) : null}

      {story.yearlyHighlights.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Yearly review highlights</CardTitle>
            <CardDescription>
              Compact facts for sharing — still not causal claims.
            </CardDescription>
          </CardHeader>
          <ul className="space-y-2 px-1 pb-1 text-sm">
            {story.yearlyHighlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </Card>
      ) : null}

      {story.chapters.length === 0 ? (
        <EmptyState
          title="Not enough logged story yet"
          description="Complete sessions, log lift loads, technique scores, or bodyweight in this year — chapters appear from real history only."
        />
      ) : (
        <ol className="space-y-6">
          {story.chapters.map((ch) => (
            <li key={ch.monthKey}>
              <Card>
                <CardHeader className="mb-2">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="accent">{ch.monthLabel}</Badge>
                    <Badge variant="neutral">{ch.monthKey}</Badge>
                  </div>
                  <CardTitle>{ch.monthLabel}</CardTitle>
                </CardHeader>
                <ul className="space-y-2 px-1 pb-1 text-base text-[var(--color-foreground)]">
                  {ch.lines.map((line) => (
                    <li key={`${ch.monthKey}-${line.kind}-${line.text}`}>
                      {line.text}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          ))}
        </ol>
      )}

      {story.quietMonths.length > 0 ? (
        <p className="text-xs text-[var(--color-muted)]">
          Quiet months (no notable logged signal):{" "}
          {story.quietMonths.join(", ")}.
        </p>
      ) : null}

      <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--color-muted)]">
        {story.honesty.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
