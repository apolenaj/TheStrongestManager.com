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
  EXERCISE_COMPARE_MIN,
  EXERCISE_FATIGUE_BAND_LABELS,
} from "@/domain/exercise-comparison";
import type { ExerciseComparisonView } from "@/domain/exercise-comparison";
import { buildExerciseSharePath } from "@/domain/exercise-comparison";

export function ExerciseCompareExperience({
  options,
  initialSlugs,
  view,
}: {
  options: Array<{ slug: string; name: string }>;
  initialSlugs: string[];
  view: ExerciseComparisonView;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [slotA, setSlotA] = useState(initialSlugs[0] ?? "");
  const [slotB, setSlotB] = useState(initialSlugs[1] ?? "");
  const [copied, setCopied] = useState(false);

  const canCompare = useMemo(() => {
    return Boolean(slotA && slotB && slotA !== slotB);
  }, [slotA, slotB]);

  function applyCompare() {
    if (!canCompare) return;
    startTransition(() => {
      router.push(buildExerciseSharePath([slotA, slotB]));
    });
  }

  async function copyShareLink() {
    if (!view.sharePath || view.exercises.length < EXERCISE_COMPARE_MIN) return;
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
    "/compare/exercises/romanian-deadlift-vs-stiff-leg-deadlift";

  return (
    <div className={pending ? "space-y-8 opacity-70" : "space-y-8"}>
      <Alert tone="info" title="Qualitative comparison only">
        Purpose, technique, muscles, fatigue, programming, and who should choose
        which — no invented superiority scores.
      </Alert>

      <section className="space-y-4 border-t border-[var(--color-border)] pt-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              Select two exercises
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              Allowlisted pairs open an SEO page; other pairs stay shareable but
              noindex.
            </p>
          </div>
          <ButtonLink href={exampleHref} variant="secondary" size="md">
            Example: RDL vs stiff-leg
          </ButtonLink>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="exercise-a">Exercise A</Label>
            <Select
              id="exercise-a"
              className="min-h-12"
              value={slotA}
              onChange={(e) => setSlotA(e.target.value)}
            >
              <option value="">Choose…</option>
              {options.map((opt) => (
                <option
                  key={opt.slug}
                  value={opt.slug}
                  disabled={opt.slug === slotB}
                >
                  {opt.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="exercise-b">Exercise B</Label>
            <Select
              id="exercise-b"
              className="min-h-12"
              value={slotB}
              onChange={(e) => setSlotB(e.target.value)}
            >
              <option value="">Choose…</option>
              {options.map((opt) => (
                <option
                  key={opt.slug}
                  value={opt.slug}
                  disabled={opt.slug === slotA}
                >
                  {opt.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
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
          {view.exercises.length >= EXERCISE_COMPARE_MIN ? (
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

      {view.exercises.length >= EXERCISE_COMPARE_MIN ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-[family-name:var(--font-display)] text-2xl">
              {view.title}
            </h2>
            {view.seoPair ? (
              <Badge variant="accent">SEO pair</Badge>
            ) : (
              <Badge variant="neutral">Shareable · noindex</Badge>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {view.exercises.map((ex) => (
              <div
                key={ex.slug}
                className="border-t border-[var(--color-border)] pt-4"
              >
                <Link
                  href={`/exercises/${ex.slug}`}
                  className="font-[family-name:var(--font-display)] text-lg font-semibold underline-offset-4 hover:underline"
                >
                  {ex.name}
                </Link>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {ex.description}
                </p>
                <p className="mt-2 font-mono text-xs text-[var(--color-muted)]">
                  {ex.movementPattern} · {ex.primaryMuscles.join(", ")}
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {view.rows.map((row) => (
              <article
                key={row.dimensionId}
                className="space-y-3 border-t border-[var(--color-border)] pt-4"
              >
                <div>
                  <h3 className="font-medium">{row.label}</h3>
                  <p className="text-xs text-[var(--color-muted)]">
                    {row.description}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {row.cells.map((cell) => (
                    <div
                      key={`${row.dimensionId}-${cell.slug}`}
                      className="text-sm"
                    >
                      <p className="font-medium">
                        <Link
                          href={`/exercises/${cell.slug}`}
                          className="underline-offset-4 hover:underline"
                        >
                          {cell.name}
                        </Link>
                        {cell.bandLabel ? (
                          <span className="ml-2 font-mono text-xs text-[var(--color-muted)]">
                            {cell.bandLabel}
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-[var(--color-muted)]">
                        {cell.primary}
                      </p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <p className="text-xs text-[var(--color-muted)]">
            Fatigue bands ({Object.values(EXERCISE_FATIGUE_BAND_LABELS).join(", ")})
            are readable contrast labels, not lab scores.
          </p>
        </section>
      ) : null}
    </div>
  );
}
