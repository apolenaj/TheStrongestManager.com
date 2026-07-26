"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import {
  prTypeLabel,
  type PrEvent,
  type PrTimeline,
  type PrType,
} from "@/domain/pr-intelligence";
import { ShareCardStudio } from "@/components/share-cards/ShareCardStudio";

function typeVariant(
  t: PrType,
): "neutral" | "accent" | "info" | "success" | "warning" {
  if (t === "one_rm") return "accent";
  if (t === "estimated_1rm") return "info";
  if (t === "rep_pr") return "success";
  if (t === "volume_pr") return "warning";
  return "neutral";
}

function PrCard({ event }: { event: PrEvent }) {
  const [studioOpen, setStudioOpen] = useState(false);

  return (
    <div className="grid gap-3">
      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">{event.title}</Badge>
            {event.types.map((t) => (
              <Badge key={t} variant={typeVariant(t)}>
                {prTypeLabel(t)}
              </Badge>
            ))}
          </div>
          <CardTitle className="mt-2 font-[family-name:var(--font-display)] text-2xl tracking-tight">
            {event.headline}
          </CardTitle>
          <CardDescription>
            {event.exerciseLabel} ·{" "}
            {new Date(event.at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </CardDescription>
        </CardHeader>

        <ul className="grid gap-2 text-sm text-[var(--color-muted)]">
          {event.related.map((line, i) => (
            <li
              key={i}
              className="border-l-2 border-[var(--color-border)] pl-3"
            >
              {line}
            </li>
          ))}
        </ul>

        <div className="mt-4">
          <Button type="button" onClick={() => setStudioOpen((o) => !o)}>
            {studioOpen ? "Hide share card" : "Create share card"}
          </Button>
        </div>
      </Card>

      {studioOpen ? (
        <ShareCardStudio event={event} onClose={() => setStudioOpen(false)} />
      ) : null}
    </div>
  );
}

export function PrIntelligencePanel({ timeline }: { timeline: PrTimeline }) {
  if (timeline.events.length === 0) {
    return (
      <EmptyState
        title="No PRs detected yet"
        description="Log working sets (load × reps), singles, or technique analyses. We’ll classify 1RM, estimated 1RM, rep, volume, and technical PRs on a timeline."
      />
    );
  }

  const counts = timeline.countsByType;

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap gap-2 text-xs">
        {(Object.keys(counts) as PrType[]).map((t) =>
          counts[t] > 0 ? (
            <Badge key={t} variant={typeVariant(t)}>
              {prTypeLabel(t)}: {counts[t]}
            </Badge>
          ) : null,
        )}
      </div>

      <div className="grid gap-4">
        {timeline.events.map((event) => (
          <PrCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
