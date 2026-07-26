"use client";

import { useState } from "react";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Label,
} from "@/design-system";
import {
  PROGRAM_AUDIT_EXAMPLE_PASTE,
  PROGRAM_AUDIT_FUNNEL_STEPS,
  PROGRAM_AUDIT_MAX_PASTE_CHARS,
  PROGRAM_AUDIT_PRIVACY_COPY,
  PROGRAM_AUDIT_SIGNUP_HREF,
  runFreeProgramAudit,
  type LimitedProgramAuditResult,
} from "@/domain/program-audit";

function SeverityBadge({
  severity,
}: {
  severity: "info" | "watch" | "attention";
}) {
  return <Badge variant="neutral">{severity}</Badge>;
}

export function ProgramAuditFunnel() {
  const [paste, setPaste] = useState("");
  const [ticket, setTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<LimitedProgramAuditResult | null>(null);
  const [note, setNote] = useState<string | null>(null);

  async function claimTicket() {
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/program-audit/claim", { method: "POST" });
      const json = (await res.json()) as {
        ok?: boolean;
        error?: string;
        token?: string;
        privacy?: string;
      };
      if (!res.ok || !json.ok || !json.token) {
        throw new Error(json.error ?? "Could not claim a free audit.");
      }
      setTicket(json.token);
      setNote(
        json.privacy ??
          "Ticket claimed. Paste stays in your browser for the basic audit.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed.");
    } finally {
      setPending(false);
    }
  }

  function runAudit() {
    setError(null);
    setResult(null);
    if (!ticket) {
      setError("Claim a free-audit ticket first (rate-limited).");
      return;
    }
    const out = runFreeProgramAudit(paste);
    if (!out.ok) {
      setError(out.error);
      return;
    }
    setResult(out);
    setNote(
      "Basic deterministic audit complete. Create an account to unlock detailed recommendations.",
    );
    try {
      sessionStorage.setItem(
        "ts_program_audit_summary",
        JSON.stringify({
          at: Date.now(),
          lineCount: out.lineCount,
          dayCount: out.dayCount,
          findingsShown: out.findingsShown.length,
          withheld: out.findingsWithheldCount,
        }),
      );
    } catch {
      // optional
    }
  }

  return (
    <div className="space-y-10">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PROGRAM_AUDIT_FUNNEL_STEPS.map((step, i) => (
          <li
            key={step.id}
            className="border-t border-[var(--color-border)] pt-3"
          >
            <p className="text-xs uppercase tracking-wide text-[var(--color-muted)]">
              Step {i + 1}
            </p>
            <p className="mt-1 text-sm font-medium">{step.label}</p>
            <p className="mt-1 text-xs text-[var(--color-muted)]">{step.detail}</p>
          </li>
        ))}
      </ol>

      <Alert tone="info" title="Privacy">
        {PROGRAM_AUDIT_PRIVACY_COPY}
      </Alert>

      <section className="max-w-3xl space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          1. Paste your program
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Use Day headers and prescriptions like{" "}
          <span className="font-mono text-xs">Back squat 4x5 @RPE8 80%</span>.
          Missing RPE or loads stay blank — we do not invent them.
        </p>
        <div>
          <Label htmlFor="pa-paste">Program text</Label>
          <textarea
            id="pa-paste"
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value.slice(0, PROGRAM_AUDIT_MAX_PASTE_CHARS));
              setResult(null);
            }}
            rows={14}
            className="mt-2 w-full rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-3 font-mono text-sm text-[var(--color-foreground)]"
            placeholder={PROGRAM_AUDIT_EXAMPLE_PASTE}
          />
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {paste.length} / {PROGRAM_AUDIT_MAX_PASTE_CHARS} characters
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setPaste(PROGRAM_AUDIT_EXAMPLE_PASTE);
            setResult(null);
          }}
        >
          Load example week
        </Button>
      </section>

      <section className="max-w-3xl space-y-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          2–3. Claim ticket &amp; run basic audit
        </h2>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void claimTicket()}
            loading={pending}
            disabled={pending}
          >
            Claim free audit
          </Button>
          <Button
            type="button"
            onClick={runAudit}
            disabled={pending || !ticket || !paste.trim()}
          >
            Run basic audit
          </Button>
        </div>
        {ticket ? (
          <p className="text-xs text-[var(--color-muted)]">
            Ticket ready · rate-limited per network · paste not uploaded
          </p>
        ) : null}
        {note ? (
          <p className="text-sm text-[var(--color-muted)]">{note}</p>
        ) : null}
      </section>

      {error ? (
        <Alert tone="warning" title="Could not complete">
          {error}
        </Alert>
      ) : null}

      {result ? (
        <section className="max-w-3xl space-y-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-xl">
              4. {result.headline}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              {result.summary}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted)]">
                Days
              </dt>
              <dd className="font-[family-name:var(--font-display)] text-lg">
                {result.structuralCounts.trainingDays}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted)]">
                Lines
              </dt>
              <dd className="font-[family-name:var(--font-display)] text-lg">
                {result.structuralCounts.exerciseLines}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-[var(--color-muted)]">
                Est. sets
              </dt>
              <dd className="font-[family-name:var(--font-display)] text-lg">
                {result.estimatedWeeklySets ?? "—"}
              </dd>
            </div>
          </dl>

          <Alert tone="info" title="No fake score">
            {result.programScore.reason}
          </Alert>

          <div>
            <h3 className="text-sm font-medium">Deterministic findings</h3>
            <ul className="mt-4 space-y-4">
              {result.findingsShown.map((f) => (
                <li
                  key={f.id}
                  className="border-t border-[var(--color-border)] pt-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{f.title}</p>
                    <SeverityBadge severity={f.severity} />
                    <Badge variant="neutral">deterministic</Badge>
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    {f.detail}
                  </p>
                  {f.evidence.length > 0 ? (
                    <p className="mt-1 font-mono text-xs text-[var(--color-muted)]">
                      {f.evidence.join(" · ")}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
            {result.findingsWithheldCount > 0 ? (
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                +{result.findingsWithheldCount} more finding
                {result.findingsWithheldCount === 1 ? "" : "s"} locked until
                you create an account.
              </p>
            ) : null}
          </div>

          <div>
            <p className="text-sm font-medium">Unlocked with an account</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
              {result.lockedSections.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href={PROGRAM_AUDIT_SIGNUP_HREF} size="lg">
              Create account for detailed recommendations
            </ButtonLink>
            <ButtonLink
              href="/app/training-audit"
              variant="secondary"
              size="lg"
            >
              I already have an account
            </ButtonLink>
          </div>

          <p className="text-xs text-[var(--color-muted)]">
            {result.honestyNote}
          </p>
        </section>
      ) : null}
    </div>
  );
}
