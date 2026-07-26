import Link from "next/link";
import { Alert, Badge } from "@/design-system";
import {
  DELOAD_MIN_SESSIONS,
  DELOAD_MIN_SIGNALS_FIRED,
  type DeloadIntelligenceAnalysis,
} from "@/domain/deload-intelligence";
import { fromDeloadAnalysis } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";

export function DeloadIntelligencePanel({
  analysis,
}: {
  analysis: DeloadIntelligenceAnalysis;
}) {
  const tone =
    analysis.status === "consider"
      ? "warning"
      : analysis.status === "insufficient" ||
          analysis.status === "suppressed_recent_deload"
        ? "info"
        : "info";

  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="You decide — never auto-applied">
        {analysis.honesty[0]} {analysis.honesty[1]}
      </Alert>
      <Alert tone="info" title="Coaching cue, not diagnosis">
        {analysis.honesty[2]} {analysis.honesty[3]}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Recommendation
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={analysis.status === "consider" ? "warning" : "neutral"}
          >
            {analysis.recommendationLabel}
          </Badge>
          <ConfidenceBadge confidence={analysis.confidence} />
          <Badge variant="accent">User decides</Badge>
        </div>
        <Alert tone={tone} title={analysis.recommendationLabel}>
          You decide whether to deload — nothing is applied automatically.
        </Alert>
        <WhyAmISeeingThis view={fromDeloadAnalysis(analysis)} />
        <AiTrustChrome
          relatedType="deload_intelligence"
          relatedId={`deload:${analysis.status}`}
          correctHref="/app/adaptations"
          correctLabel="Accept / modify / decline in Adaptations"
        />
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Signals
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Window: {analysis.windowLabel}. Need ≥{DELOAD_MIN_SESSIONS} sessions
          and ≥{DELOAD_MIN_SIGNALS_FIRED} aligned stress signals (
          {analysis.sessionCount} sessions, {analysis.signalsFired} fired).
        </p>
        <ul className="grid gap-3">
          {analysis.signals.map((s) => (
            <li
              key={s.key}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{s.label}</span>
                <Badge
                  variant={
                    s.fired ? "warning" : s.available ? "neutral" : "neutral"
                  }
                >
                  {s.fired ? "Stress" : s.available ? "Quiet" : "Unavailable"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{s.detail}</p>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-sm text-[var(--color-muted)]">
        Next steps (optional):{" "}
        <Link
          href="/decision-trees/should-i-deload"
          className="text-[var(--color-accent)]"
        >
          Deload decision tree
        </Link>{" "}
        ·{" "}
        <Link href="/app/adaptations" className="text-[var(--color-accent)]">
          Adaptations
        </Link>{" "}
        ·{" "}
        <Link href="/app/recovery" className="text-[var(--color-accent)]">
          Recovery
        </Link>
        .
      </p>
    </div>
  );
}
