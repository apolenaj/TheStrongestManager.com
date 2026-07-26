"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Label,
  Select,
} from "@/design-system";
import {
  COMPARISON_DISCLAIMERS,
  COMPARE_MAX_METHODS,
  COMPARE_MIN_METHODS,
  QUALITATIVE_BAND_LABELS,
  type QualitativeBand,
} from "@/domain/methods/comparison-profiles";
import type { MethodComparisonView } from "@/domain/methods/compare";
import { buildSharePath } from "@/domain/methods/compare";

function BandBadge({ band }: { band?: QualitativeBand }) {
  if (!band) return null;
  return <Badge variant="neutral">{QUALITATIVE_BAND_LABELS[band]}</Badge>;
}

export function MethodCompareExperience({
  options,
  initialSlugs,
  view,
}: {
  options: Array<{ slug: string; name: string }>;
  initialSlugs: string[];
  view: MethodComparisonView;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [slots, setSlots] = useState<string[]>(() => {
    const base = [...initialSlugs];
    while (base.length < COMPARE_MIN_METHODS) base.push("");
    return base.slice(0, COMPARE_MAX_METHODS);
  });
  const [copied, setCopied] = useState(false);

  const canCompare = useMemo(() => {
    const selected = slots.filter(Boolean);
    return (
      selected.length >= COMPARE_MIN_METHODS &&
      new Set(selected).size === selected.length
    );
  }, [slots]);

  function setSlot(index: number, slug: string) {
    setSlots((prev) => {
      const next = [...prev];
      next[index] = slug;
      return next;
    });
  }

  function addSlot() {
    setSlots((prev) =>
      prev.length < COMPARE_MAX_METHODS ? [...prev, ""] : prev,
    );
  }

  function removeSlot(index: number) {
    setSlots((prev) => {
      if (prev.length <= COMPARE_MIN_METHODS) {
        const next = [...prev];
        next[index] = "";
        return next;
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  function applyCompare() {
    const selected = slots.filter(Boolean);
    startTransition(() => {
      router.push(buildSharePath(selected));
    });
  }

  async function copyShareLink() {
    if (!view.sharePath || view.methods.length < COMPARE_MIN_METHODS) return;
    const url = `${window.location.origin}${view.sharePath}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const exampleHref =
    "/compare?methods=daily-undulating-periodization,block-periodization";

  return (
    <div className={pending ? "space-y-8 opacity-70" : "space-y-8"}>
      <Alert tone="info" title="Qualitative comparison only">
        {COMPARISON_DISCLAIMERS[0]} No meaningless numeric totals.
      </Alert>

      <section className="space-y-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-[var(--color-foreground)]">
              Select 2–3 methods
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Shareable URL updates when you compare.
            </p>
          </div>
          <ButtonLink href={exampleHref} variant="secondary" size="md">
            Example: DUP vs Block
          </ButtonLink>
        </div>

        <div className="grid gap-3">
          {slots.map((slug, index) => (
            <div
              key={`slot-${index}`}
              className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-end"
            >
              <div>
                <Label htmlFor={`method-${index}`}>Method {index + 1}</Label>
                <Select
                  id={`method-${index}`}
                  className="min-h-12"
                  value={slug}
                  onChange={(e) => setSlot(index, e.target.value)}
                >
                  <option value="">Choose a method…</option>
                  {options.map((opt) => (
                    <option
                      key={opt.slug}
                      value={opt.slug}
                      disabled={
                        Boolean(opt.slug) &&
                        slots.includes(opt.slug) &&
                        slots[index] !== opt.slug
                      }
                    >
                      {opt.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="min-h-12"
                onClick={() => removeSlot(index)}
              >
                Clear
              </Button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {slots.length < COMPARE_MAX_METHODS ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="min-h-12"
              onClick={addSlot}
            >
              Add third method
            </Button>
          ) : null}
          <Button
            type="button"
            size="lg"
            className="min-h-12"
            disabled={!canCompare}
            loading={pending}
            onClick={applyCompare}
          >
            Compare
          </Button>
          {view.methods.length >= COMPARE_MIN_METHODS ? (
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="min-h-12"
              onClick={() => void copyShareLink()}
            >
              {copied ? "Copied link" : "Copy share link"}
            </Button>
          ) : null}
        </div>
      </section>

      {view.warnings.map((warning) => (
        <Alert key={warning} tone="warning" title="Compare note">
          {warning}
        </Alert>
      ))}

      {view.methods.length >= COMPARE_MIN_METHODS ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-2xl text-[var(--color-foreground)]">
              {view.title}
            </h2>
            <Badge variant="accent">
              {view.methods.length} methods
            </Badge>
          </div>
          <p className="text-sm text-[var(--color-subtle)]">
            Share:{" "}
            <code className="rounded bg-[var(--color-surface-elevated)] px-1.5 py-0.5 text-xs">
              {view.sharePath}
            </code>
          </p>

          {/* Mobile: stacked cards per dimension */}
          <div className="space-y-6 md:hidden">
            {view.rows.map((row) => (
              <article
                key={row.dimensionId}
                className="space-y-3 border-t border-[var(--color-border)] pt-4"
              >
                <div>
                  <h3 className="font-medium text-[var(--color-foreground)]">
                    {row.label}
                  </h3>
                  <p className="text-xs text-[var(--color-subtle)]">
                    {row.description}
                  </p>
                </div>
                <ul className="space-y-3">
                  {row.cells.map((cell) => (
                    <li
                      key={`${row.dimensionId}-${cell.slug}`}
                      className="rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                    >
                      <Link
                        href={`/methods/${cell.slug}`}
                        className="text-sm font-medium text-[var(--color-accent)]"
                      >
                        {cell.name}
                      </Link>
                      <div className="mt-1 flex flex-wrap gap-2">
                        <BandBadge band={cell.band} />
                      </div>
                      <p className="mt-2 text-sm text-[var(--color-muted)]">
                        {cell.primary}
                      </p>
                      {cell.note ? (
                        <p className="mt-1 text-xs text-[var(--color-subtle)]">
                          {cell.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="sticky left-0 bg-[var(--color-background)] py-3 pr-4 font-medium text-[var(--color-subtle)]">
                    Dimension
                  </th>
                  {view.methods.map((m) => (
                    <th
                      key={m.method.slug}
                      className="px-3 py-3 font-display text-base text-[var(--color-foreground)]"
                    >
                      <Link
                        href={`/methods/${m.method.slug}`}
                        className="hover:text-[var(--color-accent)]"
                      >
                        {m.method.name}
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {view.rows.map((row) => (
                  <tr
                    key={row.dimensionId}
                    className="border-b border-[var(--color-border)] align-top"
                  >
                    <th className="sticky left-0 bg-[var(--color-background)] py-4 pr-4 font-medium text-[var(--color-foreground)]">
                      <div>{row.label}</div>
                      <div className="mt-1 text-xs font-normal text-[var(--color-subtle)]">
                        {row.description}
                      </div>
                    </th>
                    {row.cells.map((cell) => (
                      <td key={`${row.dimensionId}-${cell.slug}`} className="px-3 py-4">
                        <div className="mb-2">
                          <BandBadge band={cell.band} />
                        </div>
                        <p className="text-[var(--color-muted)]">{cell.primary}</p>
                        {cell.note ? (
                          <p className="mt-1 text-xs text-[var(--color-subtle)]">
                            {cell.note}
                          </p>
                        ) : null}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
        {COMPARISON_DISCLAIMERS.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
