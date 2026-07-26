import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import {
  FATIGUE_ALERT_LEVELS,
  FATIGUE_ALERT_LEVEL_LABELS,
  FATIGUE_ALERT_MIN_SESSIONS,
  type FatigueAlertAnalysis,
  type FatigueAlertLevel,
} from "@/domain/fatigue-alert-system";
import { fromFatigueAnalysis } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";

function badgeVariant(
  level: FatigueAlertLevel,
): "success" | "neutral" | "accent" | "warning" {
  switch (level) {
    case "normal":
      return "success";
    case "watch":
      return "neutral";
    case "elevated":
      return "accent";
    case "high_concern":
      return "warning";
  }
}

export function FatigueAlertSystemPanel({
  analysis,
}: {
  analysis: FatigueAlertAnalysis;
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Coaching awareness — not a medical claim">
        {analysis.honesty[0]} {analysis.honesty[2]}
      </Alert>
      <Alert tone="info" title="Conservative by design">
        {analysis.honesty[1]} {analysis.honesty[3]}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Current level
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={badgeVariant(analysis.level)}>
            {analysis.levelLabel}
          </Badge>
          <ConfidenceBadge confidence={analysis.confidence} />
        </div>
        <p className="text-lg font-medium text-[var(--color-foreground)]">
          {analysis.title}
        </p>
        <p className="text-sm text-[var(--color-muted)]">{analysis.summary}</p>
        <WhyAmISeeingThis view={fromFatigueAnalysis(analysis)} />
        <AiTrustChrome
          relatedType="fatigue_alert"
          relatedId={`fatigue:${analysis.level}`}
          correctHref="/app/recovery"
          correctLabel="Update recovery / session logs"
        />
        {!analysis.publishable && analysis.suppressedReason ? (
          <Alert tone="info" title="More logs help">
            {analysis.suppressedReason}
          </Alert>
        ) : null}
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Level scale
        </h2>
        <ul className="flex flex-wrap gap-2">
          {FATIGUE_ALERT_LEVELS.map((lvl) => (
            <Badge
              key={lvl}
              variant={lvl === analysis.level ? badgeVariant(lvl) : "neutral"}
            >
              {FATIGUE_ALERT_LEVEL_LABELS[lvl]}
            </Badge>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Inputs
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Window: {analysis.windowLabel}. Escalation needs ≥
          {FATIGUE_ALERT_MIN_SESSIONS} sessions and ≥2 available inputs (
          {analysis.sessionCount} sessions, {analysis.signalsAvailable}{" "}
          available).
        </p>
        <ul className="grid gap-3">
          {analysis.signals.map((s) => (
            <li
              key={s.key}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{s.label}</span>
                <Badge variant={s.fired ? "accent" : "neutral"}>
                  {s.fired ? "Shifted" : s.available ? "Steady" : "Unavailable"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{s.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-[var(--color-muted)]">
        Related:{" "}
        <Link href="/app/recovery" className="text-[var(--color-accent)]">
          Recovery
        </Link>{" "}
        ·{" "}
        <Link
          href="/app/deload-intelligence"
          className="text-[var(--color-accent)]"
        >
          Deload intelligence
        </Link>{" "}
        ·{" "}
        <Link href="/app/adaptations" className="text-[var(--color-accent)]">
          Adaptations
        </Link>
        .
      </p>
    </div>
  );
}
