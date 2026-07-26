"use client";

import { useMemo, useState } from "react";
import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Label,
  Select,
  Alert,
} from "@/design-system";
import {
  selectAttempts,
  type AttemptConfidence,
  type AttemptLift,
  type AttemptRiskPreference,
  type MeetAttemptHistoryEntry,
} from "@/domain/attempt-selector";
import type { AttemptSelectorPageData } from "@/services/attempt-selector";

const RISKS: AttemptRiskPreference[] = [
  "conservative",
  "balanced",
  "aggressive",
];

const LIFTS: AttemptLift[] = ["squat", "bench", "deadlift"];

export function AttemptSelectorPanel({
  data,
}: {
  data: AttemptSelectorPageData;
}) {
  const [lift, setLift] = useState<AttemptLift>(data.defaultLift);
  const [risk, setRisk] = useState<AttemptRiskPreference>(
    data.painSafeModeActive ? "conservative" : "balanced",
  );
  const [confidence, setConfidence] = useState<AttemptConfidence>(
    data.defaultConfidence,
  );

  const effectiveRisk: AttemptRiskPreference = data.painSafeModeActive
    ? "conservative"
    : risk;

  const ctx = data.lifts.find((l) => l.lift === lift) ?? data.lifts[0]!;

  const history: MeetAttemptHistoryEntry[] = useMemo(
    () =>
      ctx.history.map((h) => ({
        meetDate: new Date(h.meetDate),
        lift,
        openerKg: h.openerKg,
        secondKg: h.secondKg,
        thirdKg: h.thirdKg,
        bestMadeKg: h.bestMadeKg,
        missedOpener: h.missedOpener,
      })),
    [ctx.history, lift],
  );

  const result = useMemo(
    () =>
      selectAttempts({
        lift,
        recentStrength: ctx.recentStrength,
        history,
        confidence,
        goalKg: ctx.goalKg,
        risk: effectiveRisk,
      }),
    [lift, ctx.recentStrength, ctx.goalKg, history, confidence, effectiveRisk],
  );

  const anyStrength = data.lifts.some(
    (l) => l.recentStrength != null || l.goalKg != null || l.history.length > 0,
  );

  if (!anyStrength) {
    return (
      <EmptyState
        title="Not enough inputs yet"
        description="Log recent working sets for squat, bench, or deadlift, set Competition Mode target lifts, or record a prior meet best — then return here to sketch attempts."
      />
    );
  }

  return (
    <div className="grid gap-6">
      {data.painSafeModeActive && data.painSafeMessage ? (
        <Alert tone="warning" title="Pain-safe mode — aggressive attempts withheld">
          {data.painSafeMessage} Risk preference is locked to conservative.
        </Alert>
      ) : null}
      <p className="text-sm text-[var(--color-muted)]">
        Plan opener, second, and a conditional third from recent strength,
        competition history, confidence, and goal. Adjust risk preference —
        nothing here guarantees a make.
        {data.meetName ? ` Meet: ${data.meetName}.` : null}
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="attempt-lift">Lift</Label>
          <Select
            id="attempt-lift"
            value={lift}
            onChange={(e) => setLift(e.target.value as AttemptLift)}
          >
            {LIFTS.map((l) => (
              <option key={l} value={l}>
                {l === "squat" ? "Squat" : l === "bench" ? "Bench" : "Deadlift"}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="attempt-risk">Risk preference</Label>
          <Select
            id="attempt-risk"
            value={effectiveRisk}
            disabled={data.painSafeModeActive}
            onChange={(e) =>
              setRisk(e.target.value as AttemptRiskPreference)
            }
          >
            {RISKS.map((r) => (
              <option key={r} value={r}>
                {r === "conservative"
                  ? "Conservative"
                  : r === "balanced"
                    ? "Balanced"
                    : "Aggressive"}
              </option>
            ))}
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="attempt-confidence">Confidence</Label>
          <Select
            id="attempt-confidence"
            value={confidence}
            onChange={(e) =>
              setConfidence(e.target.value as AttemptConfidence)
            }
          >
            <option value="low">Low</option>
            <option value="moderate">Moderate</option>
            <option value="high">High</option>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
        <Badge variant="neutral">
          Strength:{" "}
          {ctx.recentStrength
            ? `${ctx.recentStrength.lowKg}–${ctx.recentStrength.highKg} kg`
            : "n/a"}
        </Badge>
        <Badge variant="neutral">
          Goal: {ctx.goalKg != null ? `${ctx.goalKg} kg` : "n/a"}
        </Badge>
        <Badge variant="neutral">
          History entries: {ctx.history.length}
        </Badge>
      </div>

      {!result.ok ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cannot sketch yet</CardTitle>
            <CardDescription>{result.reason}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card elevated>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="accent">{result.selection.liftLabel}</Badge>
              <Badge variant="info">{result.selection.riskLabel}</Badge>
            </div>
            <CardTitle className="mt-2 text-xl tracking-tight">
              Attempt plan
            </CardTitle>
            <CardDescription>
              Planning ceiling ≈ {result.selection.planningCeilingKg} kg — not a
              guaranteed max.
            </CardDescription>
          </CardHeader>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Opener
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight">
                {result.selection.openerKg} kg
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Second
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight">
                {result.selection.secondKg} kg
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
                Third (conditional)
              </p>
              <p className="mt-1 font-[family-name:var(--font-display)] text-3xl tracking-tight">
                {result.selection.third.lowKg === result.selection.third.highKg
                  ? `${result.selection.third.lowKg} kg`
                  : `${result.selection.third.lowKg}–${result.selection.third.highKg} kg`}
              </p>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {result.selection.third.condition}
              </p>
            </div>
          </div>

          <section className="mt-6">
            <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Strategy
            </h3>
            <ul className="mt-2 grid gap-2 text-sm">
              {result.selection.strategy.map((line, i) => (
                <li
                  key={i}
                  className="border-l-2 border-[var(--color-border)] pl-3 text-[var(--color-muted)]"
                >
                  {line}
                </li>
              ))}
            </ul>
          </section>

          <p className="mt-4 text-xs text-[var(--color-muted)]">
            {result.selection.honestyNote}
          </p>
        </Card>
      )}
    </div>
  );
}
