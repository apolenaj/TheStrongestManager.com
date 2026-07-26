import Link from "next/link";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  ScoreRing,
} from "@/design-system";
import type { StrengthScoreView } from "@/services/strength/strength-score-service";
import { NOT_ENOUGH_DATA } from "@/services/dashboard/types";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";

function EvidenceBadge({
  label,
}: {
  label: "Verified" | "Estimated" | "Reported";
}) {
  const variant =
    label === "Verified" ? "success" : label === "Estimated" ? "warning" : "neutral";
  return <Badge variant={variant}>{label}</Badge>;
}

export function StrengthScorePanel({ view }: { view: StrengthScoreView }) {
  const { assessment, displayScore, formatKg } = view;
  const { result, trend, lifts, disclaimers, experienceLabel, sportContext } =
    assessment;

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Strength Score</CardTitle>
          <CardDescription>
            Level-relative strength for a {experienceLabel.toLowerCase()}{" "}
            {sportContext} context — not an elite comparison for every athlete.
          </CardDescription>
        </CardHeader>

        <div className="flex flex-wrap items-start gap-8">
          {displayScore != null ? (
            <ScoreRing
              value={displayScore}
              label="Current estimated strength"
              size={112}
            />
          ) : (
            <div className="max-w-sm">
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--color-muted)]">
                {NOT_ENOUGH_DATA}
              </p>
              <p className="mt-2 text-sm text-[var(--color-subtle)]">
                {result.missingInputs[0] ?? result.explanation}
              </p>
            </div>
          )}

          <div className="grid min-w-[14rem] gap-3 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Confidence
              </p>
              <div className="mt-1">
                <ConfidenceBadge
                  confidence={result.confidence}
                  prefix={null}
                />
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Context
              </p>
              <p className="mt-1 font-medium">
                {experienceLabel} · {sportContext}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                Bodyweight
              </p>
              <p className="mt-1 font-medium">
                {assessment.bodyweightKg != null
                  ? formatKg(assessment.bodyweightKg)
                  : "Not logged"}
              </p>
            </div>
          </div>
        </div>

        <p className="mt-4 text-sm text-[var(--color-muted)]">
          {result.explanation}
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Trend</CardTitle>
          <CardDescription>
            Recent best efforts vs the prior window.
          </CardDescription>
        </CardHeader>
        {trend ? (
          <div className="grid gap-2 text-sm">
            <p className="font-[family-name:var(--font-display)] text-2xl font-semibold">
              {trend.direction === "up"
                ? "↑"
                : trend.direction === "down"
                  ? "↓"
                  : "→"}{" "}
              {trend.percentChange > 0 ? "+" : ""}
              {trend.percentChange}%
            </p>
            <p className="text-[var(--color-muted)]">
              Recent best {formatKg(trend.recentBestKg)} vs prior{" "}
              {formatKg(trend.priorBestKg)}
            </p>
            <p className="text-xs text-[var(--color-subtle)]">
              {trend.explanation}
            </p>
            {trend.includesEstimates ? (
              <EvidenceBadge label="Estimated" />
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">{NOT_ENOUGH_DATA}</p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Best lifts</CardTitle>
          <CardDescription>
            Verified loads and Estimated 1RMs are listed separately. Estimated
            1RM is never a personal record.
          </CardDescription>
        </CardHeader>

        {lifts.length === 0 ? (
          <EmptyState
            title="No lift history yet"
            description="Log lifts on your profile. Add reps on multi-rep sets to compute an Estimated 1RM (Epley) — clearly labeled, never shown as a verified PR."
            action={
              <Link
                href="/app/profile"
                className="text-sm font-medium text-[var(--color-accent)]"
              >
                Open athlete profile →
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-[var(--color-subtle)]">
                <tr className="border-b border-[var(--color-border)]">
                  <th className="py-2 pr-3 font-medium">Lift</th>
                  <th className="py-2 pr-3 font-medium">Verified best</th>
                  <th className="py-2 pr-3 font-medium">Estimated 1RM</th>
                  <th className="py-2 pr-3 font-medium">Reported</th>
                  <th className="py-2 font-medium">Level context</th>
                </tr>
              </thead>
              <tbody>
                {lifts.map((lift) => (
                  <tr
                    key={lift.metricKey}
                    className="border-b border-[var(--color-border)] align-top"
                  >
                    <td className="py-3 pr-3 font-medium">{lift.label}</td>
                    <td className="py-3 pr-3">
                      {lift.verifiedBest ? (
                        <span className="inline-flex flex-col gap-1">
                          <span>{formatKg(lift.verifiedBest.kg)}</span>
                          <EvidenceBadge label="Verified" />
                        </span>
                      ) : (
                        <span className="text-[var(--color-subtle)]">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      {lift.estimated1rm ? (
                        <span className="inline-flex flex-col gap-1">
                          <span>{formatKg(lift.estimated1rm.kg)}</span>
                          <span className="text-xs text-[var(--color-subtle)]">
                            from {formatKg(lift.estimated1rm.fromLoadKg)} ×{" "}
                            {lift.estimated1rm.fromReps}
                          </span>
                          <EvidenceBadge label="Estimated" />
                        </span>
                      ) : (
                        <span className="text-[var(--color-subtle)]">—</span>
                      )}
                    </td>
                    <td className="py-3 pr-3">
                      {lift.reportedBest ? (
                        <span className="inline-flex flex-col gap-1">
                          <span>{formatKg(lift.reportedBest.kg)}</span>
                          <EvidenceBadge label="Reported" />
                        </span>
                      ) : (
                        <span className="text-[var(--color-subtle)]">—</span>
                      )}
                    </td>
                    <td className="py-3">
                      {lift.contextScore != null &&
                      lift.bodyweightRatio != null ? (
                        <span className="text-[var(--color-muted)]">
                          {lift.bodyweightRatio.toFixed(2)}× BW
                          <span className="block text-xs">
                            context {Math.round(lift.contextScore)} / ref{" "}
                            {lift.referenceMultiple.toFixed(2)}×
                          </span>
                        </span>
                      ) : (
                        <span className="text-[var(--color-subtle)]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to read this</CardTitle>
        </CardHeader>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {disclaimers.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
