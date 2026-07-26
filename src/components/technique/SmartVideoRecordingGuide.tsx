"use client";

import { Badge } from "@/design-system";
import {
  RECORDING_GUIDE_ENGINE_VERSION,
  RECORDING_GUIDE_HONESTY,
  type RecordingGuide,
} from "@/domain/recording-guide";
import { RecordingGuideDiagram } from "@/components/technique/RecordingGuideDiagram";

/**
 * Exercise-specific filming guidance shown before upload.
 */
export function SmartVideoRecordingGuide({
  guide,
}: {
  guide: RecordingGuide;
}) {
  return (
    <div className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">Filming guide</Badge>
        <Badge variant="neutral">{RECORDING_GUIDE_ENGINE_VERSION}</Badge>
        <Badge variant="neutral">{guide.liftKind}</Badge>
      </div>

      <div>
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          {guide.title}
        </h3>
        <p className="mt-1 text-sm text-[var(--color-fg)]">
          {guide.recommendationSummary}
        </p>
      </div>

      <RecordingGuideDiagram
        visual={guide.visual}
        label={`${guide.title} camera placement diagram`}
      />

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Recommended camera angle
          </dt>
          <dd className="mt-1 text-[var(--color-fg)]">
            {guide.recommendedAngleLabel}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Distance
          </dt>
          <dd className="mt-1 text-[var(--color-fg)]">{guide.distance}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Height
          </dt>
          <dd className="mt-1 text-[var(--color-fg)]">{guide.height}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            What must be visible
          </dt>
          <dd className="mt-1">
            <ul className="list-disc space-y-1 pl-5 text-[var(--color-fg)]">
              {guide.mustBeVisible.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>

      <section className="grid gap-2">
        <h4 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
          Angle tradeoffs
        </h4>
        <p className="text-xs text-[var(--color-subtle)]">
          No single angle captures all metrics — pick for your goal.
        </p>
        <ul className="grid gap-2">
          {guide.angleOptions.map((opt) => (
            <li
              key={opt.angleId}
              className="border-l-2 border-[var(--color-border)] pl-3 text-sm"
            >
              <span className="font-medium text-[var(--color-fg)]">
                {opt.label}
              </span>
              <p className="text-[var(--color-muted)]">
                Best for: {opt.bestFor}
              </p>
              <p className="text-[var(--color-muted)]">
                Limited for: {opt.limitedFor}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {guide.tips.length > 0 ? (
        <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
          {guide.tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      ) : null}

      <ul className="grid gap-1 text-xs text-[var(--color-subtle)]">
        {RECORDING_GUIDE_HONESTY.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
