"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { PrEvent } from "@/domain/pr-intelligence";
import {
  buildShareCardModel,
  defaultSelectedMetrics,
  downloadShareCardPng,
  SHARE_CARD_FORMATS,
  SHARE_METRIC_OPTIONS,
  type ShareCardFormatId,
  type ShareMetricId,
} from "@/domain/share-cards";
import { PerformanceCardPreview } from "@/components/share-cards/PerformanceCardPreview";
import { sharePrEventAction } from "@/services/pr-intelligence/actions";

export function ShareCardStudio({
  event,
  onClose,
}: {
  event: PrEvent;
  onClose?: () => void;
}) {
  const [formatId, setFormatId] =
    useState<ShareCardFormatId>("instagram_story");
  const [selected, setSelected] = useState<ShareMetricId[]>(
    defaultSelectedMetrics(),
  );
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const model = useMemo(
    () =>
      buildShareCardModel(event, {
        formatId,
        selectedMetrics: selected,
      }),
    [event, formatId, selected],
  );

  function toggleMetric(id: ShareMetricId) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function onDownload() {
    start(async () => {
      setMessage(null);
      try {
        await downloadShareCardPng(
          model,
          formatId,
          `thestrongestmanager-${formatId}.png`,
        );
        setMessage("PNG downloaded.");
      } catch {
        setMessage("Could not export PNG in this browser.");
      }
    });
  }

  function onShareLink() {
    start(async () => {
      setMessage(null);
      const result = await sharePrEventAction(event, {
        formatId,
        selectedMetrics: selected,
        card: model,
      });
      if (!result.ok || !result.path) {
        setMessage(result.error ?? "Could not create share link.");
        return;
      }
      const url = `${window.location.origin}${result.path}`;
      try {
        await navigator.clipboard.writeText(url);
        setMessage("Share link copied.");
      } catch {
        setMessage(url);
      }
    });
  }

  return (
    <Card elevated className="grid gap-6">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl tracking-tight">
            Shareable performance card
          </CardTitle>
          {onClose ? (
            <Button type="button" variant="ghost" onClick={onClose}>
              Close
            </Button>
          ) : null}
        </div>
        <CardDescription>
          Choose format and which metrics to show. Private metrics stay off until
          you opt in.
        </CardDescription>
      </CardHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <p className="text-sm font-medium text-[var(--color-fg)]">Format</p>
            <div className="flex flex-wrap gap-2">
              {SHARE_CARD_FORMATS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFormatId(f.id)}
                  className={`rounded-md border px-3 py-1.5 text-sm transition ${
                    formatId === f.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                      : "border-[var(--color-border)] text-[var(--color-muted)]"
                  }`}
                >
                  {f.label}
                  {f.optional ? " (optional)" : ""}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-sm font-medium text-[var(--color-fg)]">
              Metrics on card
            </p>
            <p className="text-xs text-[var(--color-muted)]">
              Headline and brand always appear. Everything below is opt-in.
            </p>
            <ul className="grid gap-2">
              {SHARE_METRIC_OPTIONS.map((opt) => {
                const on = selected.includes(opt.id);
                return (
                  <li key={opt.id}>
                    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1 accent-[var(--color-accent)]"
                        checked={on}
                        onChange={() => toggleMetric(opt.id)}
                      />
                      <span>
                        <span className="font-medium text-[var(--color-fg)]">
                          {opt.label}
                        </span>
                        {opt.privateByDefault ? (
                          <Badge variant="neutral" className="ml-2">
                            Private by default
                          </Badge>
                        ) : null}
                        <span className="mt-0.5 block text-xs text-[var(--color-muted)]">
                          {opt.description}
                        </span>
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={onDownload} disabled={pending}>
              Download PNG
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onShareLink}
              disabled={pending}
            >
              Copy share link
            </Button>
          </div>
          {message ? (
            <p className="text-xs text-[var(--color-muted)] break-all">
              {message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-2">
          <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Preview · {SHARE_CARD_FORMATS.find((f) => f.id === formatId)?.label}
          </p>
          <PerformanceCardPreview
            model={model}
            className="mx-auto w-full max-w-sm overflow-hidden rounded-lg border border-[var(--color-border)]"
          />
        </div>
      </div>
    </Card>
  );
}
