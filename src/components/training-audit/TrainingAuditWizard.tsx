"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  ProgressBar,
  ScoreRing,
  Textarea,
} from "@/design-system";
import {
  TRAINING_AUDIT_STAGE_LABELS,
  TRAINING_AUDIT_STAGES,
  type TrainingAuditInputMode,
  type TrainingAuditResult,
  type TrainingAuditStage,
} from "@/domain/training-audit";
import { displayableProgramScore } from "@/domain/program-score";
import { runTrainingAuditAction } from "@/services/training-audit/actions";
import { cn } from "@/design-system/utils/cn";

type ManualRow = {
  id: string;
  dayIndex: string;
  exerciseName: string;
  sets: string;
  reps: string;
  rpe: string;
  percent: string;
  loadKg: string;
};

const CSV_EXAMPLE = `day,exercise,sets,reps,rpe,percent,load_kg
1,Back squat,4,5,8,80,
1,Romanian deadlift,3,8,7,,
3,Bench press,4,5,8,80,
3,Barbell row,3,10,7,,
5,Deadlift,3,3,8.5,85,`;

const PASTE_EXAMPLE = `Day 1
Back squat 4x5 @RPE8 80%
Romanian deadlift 3x8 @RPE7

Day 3
Bench press 4x5 @RPE8
Barbell row 3x10

Day 5
Deadlift 3x3 @RPE8.5 85%`;

function emptyRow(): ManualRow {
  return {
    id: `r-${Math.random().toString(36).slice(2, 9)}`,
    dayIndex: "1",
    exerciseName: "",
    sets: "",
    reps: "",
    rpe: "",
    percent: "",
    loadKg: "",
  };
}

function numOrNull(raw: string): number | null {
  if (!raw.trim()) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export function TrainingAuditWizard({
  pdfImageEnabled,
}: {
  pdfImageEnabled: boolean;
}) {
  const [stage, setStage] = useState<TrainingAuditStage>("upload");
  const [mode, setMode] = useState<TrainingAuditInputMode>("paste");
  const [programName, setProgramName] = useState("");
  const [csv, setCsv] = useState("");
  const [paste, setPaste] = useState("");
  const [rows, setRows] = useState<ManualRow[]>([emptyRow()]);
  const [result, setResult] = useState<TrainingAuditResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const stageIndex = TRAINING_AUDIT_STAGES.indexOf(stage);
  const progress = ((stageIndex + 1) / TRAINING_AUDIT_STAGES.length) * 100;

  function analyze() {
    setError(null);
    startTransition(async () => {
      const source =
        mode === "csv"
          ? ({
              mode: "csv" as const,
              csv,
              programName: programName || undefined,
            })
          : mode === "paste"
            ? ({
                mode: "paste" as const,
                text: paste,
                programName: programName || undefined,
              })
            : ({
                mode: "manual" as const,
                programName: programName || undefined,
                lines: rows
                  .filter((r) => r.exerciseName.trim())
                  .map((r) => ({
                    dayIndex: Math.max(1, Math.round(numOrNull(r.dayIndex) ?? 1)),
                    exerciseName: r.exerciseName,
                    sets: numOrNull(r.sets),
                    reps: r.reps.trim() || null,
                    rpe: numOrNull(r.rpe),
                    percent: numOrNull(r.percent),
                    loadKg: numOrNull(r.loadKg),
                  })),
              });

      const res = await runTrainingAuditAction(source);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setResult(res.result);
      setStage("analyze");
    });
  }

  const displayScore = useMemo(
    () => (result?.programScore ? displayableProgramScore(result.programScore) : null),
    [result],
  );

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Automatic training audit</CardTitle>
          <CardDescription>
            Upload your program → Analyze → Understand → Improve. The system
            never fabricates missing sets, loads, or exercises.
          </CardDescription>
        </CardHeader>
        <ProgressBar value={progress} label="Audit progress" className="mb-4" />
        <ol className="flex flex-wrap gap-2">
          {TRAINING_AUDIT_STAGES.map((s, i) => (
            <li key={s}>
              <Badge
                variant={
                  s === stage ? "accent" : i < stageIndex ? "success" : "neutral"
                }
              >
                {i + 1}. {TRAINING_AUDIT_STAGE_LABELS[s]}
              </Badge>
            </li>
          ))}
        </ol>
      </Card>

      {stage === "upload" ? (
        <UploadStep
          mode={mode}
          setMode={setMode}
          programName={programName}
          setProgramName={setProgramName}
          csv={csv}
          setCsv={setCsv}
          paste={paste}
          setPaste={setPaste}
          rows={rows}
          setRows={setRows}
          pdfImageEnabled={pdfImageEnabled}
          pending={pending}
          error={error}
          onAnalyze={analyze}
        />
      ) : null}

      {stage === "analyze" && result ? (
        <AnalyzeStep
          result={result}
          displayScore={displayScore}
          onNext={() => setStage("understand")}
          onBack={() => setStage("upload")}
        />
      ) : null}

      {stage === "understand" && result ? (
        <UnderstandStep
          result={result}
          onNext={() => setStage("improve")}
          onBack={() => setStage("analyze")}
        />
      ) : null}

      {stage === "improve" && result ? (
        <ImproveStep
          result={result}
          onBack={() => setStage("understand")}
          onRestart={() => {
            setResult(null);
            setStage("upload");
          }}
        />
      ) : null}
    </div>
  );
}

function UploadStep(props: {
  mode: TrainingAuditInputMode;
  setMode: (m: TrainingAuditInputMode) => void;
  programName: string;
  setProgramName: (v: string) => void;
  csv: string;
  setCsv: (v: string) => void;
  paste: string;
  setPaste: (v: string) => void;
  rows: ManualRow[];
  setRows: (rows: ManualRow[]) => void;
  pdfImageEnabled: boolean;
  pending: boolean;
  error: string | null;
  onAnalyze: () => void;
}) {
  const {
    mode,
    setMode,
    programName,
    setProgramName,
    csv,
    setCsv,
    paste,
    setPaste,
    rows,
    setRows,
    pdfImageEnabled,
    pending,
    error,
    onAnalyze,
  } = props;

  return (
    <Card elevated>
      <CardHeader>
        <CardTitle>1. Upload your program</CardTitle>
        <CardDescription>
          Manual entry, CSV, or structured pasted text. Empty fields stay empty.
        </CardDescription>
      </CardHeader>

      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["paste", "Pasted text"],
            ["csv", "CSV"],
            ["manual", "Manual entry"],
            ["pdf_image", "PDF / image"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            disabled={id === "pdf_image" && !pdfImageEnabled}
            onClick={() => {
              if (id === "pdf_image" && !pdfImageEnabled) return;
              setMode(id);
            }}
            className={cn(
              "rounded-[var(--radius-md)] border px-3 py-2 text-sm",
              mode === id
                ? "border-[var(--color-accent)] bg-[var(--color-accent-muted)]"
                : "border-[var(--color-border)]",
              id === "pdf_image" && !pdfImageEnabled && "opacity-50",
            )}
          >
            {label}
            {id === "pdf_image" && !pdfImageEnabled ? " (soon)" : ""}
          </button>
        ))}
      </div>

      {mode === "pdf_image" ? (
        <Alert tone="info" title="PDF / image parsing not available">
          This path is feature-flagged until a real parser ships. Use CSV, paste,
          or manual entry — we will not invent exercises from an upload.
        </Alert>
      ) : (
        <>
          <div className="mb-4 grid gap-2">
            <Label htmlFor="audit-name">Program name (optional)</Label>
            <Input
              id="audit-name"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g. My 4-day strength block"
            />
          </div>

          {mode === "csv" ? (
            <div className="grid gap-2">
              <Label htmlFor="audit-csv">CSV</Label>
              <Textarea
                id="audit-csv"
                rows={10}
                value={csv}
                onChange={(e) => setCsv(e.target.value)}
                placeholder={CSV_EXAMPLE}
                className="font-mono text-xs"
              />
              <p className="text-xs text-[var(--color-muted)]">
                Columns: day, exercise, sets, reps, rpe, percent, load_kg —
                omit values you do not have.
              </p>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCsv(CSV_EXAMPLE)}
              >
                Load example CSV
              </Button>
            </div>
          ) : null}

          {mode === "paste" ? (
            <div className="grid gap-2">
              <Label htmlFor="audit-paste">Structured text</Label>
              <Textarea
                id="audit-paste"
                rows={12}
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                placeholder={PASTE_EXAMPLE}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setPaste(PASTE_EXAMPLE)}
              >
                Load example paste
              </Button>
            </div>
          ) : null}

          {mode === "manual" ? (
            <div className="grid gap-3">
              {rows.map((row, idx) => (
                <div
                  key={row.id}
                  className="grid gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 sm:grid-cols-7"
                >
                  <Input
                    aria-label={`Day row ${idx + 1}`}
                    placeholder="Day"
                    value={row.dayIndex}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, dayIndex: e.target.value };
                      setRows(next);
                    }}
                  />
                  <Input
                    className="sm:col-span-2"
                    aria-label={`Exercise row ${idx + 1}`}
                    placeholder="Exercise"
                    value={row.exerciseName}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, exerciseName: e.target.value };
                      setRows(next);
                    }}
                  />
                  <Input
                    placeholder="Sets"
                    value={row.sets}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, sets: e.target.value };
                      setRows(next);
                    }}
                  />
                  <Input
                    placeholder="Reps"
                    value={row.reps}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, reps: e.target.value };
                      setRows(next);
                    }}
                  />
                  <Input
                    placeholder="RPE"
                    value={row.rpe}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = { ...row, rpe: e.target.value };
                      setRows(next);
                    }}
                  />
                  <Input
                    placeholder="% / kg"
                    value={row.percent || row.loadKg}
                    onChange={(e) => {
                      const next = [...rows];
                      next[idx] = {
                        ...row,
                        percent: e.target.value,
                        loadKg: "",
                      };
                      setRows(next);
                    }}
                  />
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setRows([...rows, emptyRow()])}
              >
                Add row
              </Button>
            </div>
          ) : null}

          {error ? (
            <Alert tone="danger" title="Cannot analyze" className="mt-4">
              {error}
            </Alert>
          ) : null}

          <div className="mt-6">
            <Button type="button" size="lg" disabled={pending} onClick={onAnalyze}>
              {pending ? "Analyzing…" : "Analyze program"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

function AnalyzeStep({
  result,
  displayScore,
  onNext,
  onBack,
}: {
  result: TrainingAuditResult;
  displayScore: number | null;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <Card elevated>
      <CardHeader>
        <CardTitle>2. Analyze</CardTitle>
        <CardDescription>
          Structural pass over {result.understanding.lineCount} imported
          line(s) — nothing invented beyond what you provided.
        </CardDescription>
      </CardHeader>
      <div className="flex flex-wrap items-start gap-6">
        {displayScore != null ? (
          <ScoreRing value={displayScore} label="Program Score" />
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            {result.programScore?.explanation ??
              "Program Score not available from this import."}
          </p>
        )}
        <div className="min-w-0 flex-1 space-y-2 text-sm text-[var(--color-muted)]">
          <p>{result.understanding.summary}</p>
          <p>
            Findings detected: {result.findings.length} · Parse warnings:{" "}
            {result.draft.parseWarnings.length}
          </p>
          {result.draft.parseWarnings.slice(0, 3).map((w) => (
            <p key={w} className="text-xs">
              {w}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          Understand findings
        </Button>
      </div>
    </Card>
  );
}

function UnderstandStep({
  result,
  onNext,
  onBack,
}: {
  result: TrainingAuditResult;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="grid gap-4">
      <Card elevated>
        <CardHeader>
          <CardTitle>3. Understand</CardTitle>
          <CardDescription>{result.understanding.headline}</CardDescription>
        </CardHeader>
        <p className="text-sm text-[var(--color-muted)]">
          {result.understanding.summary}
        </p>
      </Card>

      {result.findings.map((f) => (
        <Card key={f.id}>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={
                  f.severity === "attention"
                    ? "warning"
                    : f.severity === "watch"
                      ? "info"
                      : "neutral"
                }
              >
                {f.code.replaceAll("_", " ")}
              </Badge>
              <Badge variant="neutral">{f.severity}</Badge>
            </div>
            <CardTitle className="text-base">{f.title}</CardTitle>
            <CardDescription>{f.detail}</CardDescription>
          </CardHeader>
          <ul className="grid gap-1 text-xs text-[var(--color-muted)]">
            {f.evidence.map((e) => (
              <li key={e}>Evidence: {e}</li>
            ))}
          </ul>
        </Card>
      ))}

      {result.missingInformation.length > 0 ? (
        <p className="text-xs text-[var(--color-muted)]">
          Missing (not fabricated): {result.missingInformation.join("; ")}.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" onClick={onNext}>
          See improvements
        </Button>
      </div>
    </div>
  );
}

function ImproveStep({
  result,
  onBack,
  onRestart,
}: {
  result: TrainingAuditResult;
  onBack: () => void;
  onRestart: () => void;
}) {
  return (
    <Card elevated>
      <CardHeader>
        <CardTitle>4. Improve</CardTitle>
        <CardDescription>
          Suggestions only — nothing is auto-written into Programs.
        </CardDescription>
      </CardHeader>
      <ul className="grid gap-3 text-sm text-[var(--color-fg)]">
        {result.improvements.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-[var(--color-muted)]">
        {result.honesty[0]}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button type="button" variant="ghost" onClick={onRestart}>
          Audit another program
        </Button>
        <ButtonLink href="/app/program-review" variant="secondary">
          Open program review
        </ButtonLink>
        <ButtonLink href="/app/programs" variant="primary">
          Go to Programs
        </ButtonLink>
      </div>
      <p className="mt-3 text-xs text-[var(--color-muted)]">
        Prefer a deeper review of an assigned program?{" "}
        <Link href="/app/program-review" className="underline">
          AI Program Review
        </Link>
      </p>
    </Card>
  );
}
