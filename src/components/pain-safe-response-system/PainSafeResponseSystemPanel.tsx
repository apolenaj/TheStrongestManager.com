import { Alert, Badge, Button } from "@/design-system";
import {
  PAIN_SAFE_CATEGORIES,
  PAIN_SAFE_CATEGORY_LABELS,
  type PainSafeAnalysis,
} from "@/domain/pain-safe-response-system";
import {
  clearPainSafeReportAction,
  reportPainSafeSymptomAction,
} from "@/services/pain-safe-response-system/actions";

type ReportRow = {
  id: string;
  category: string;
  notes: string | null;
  createdAt: Date;
};

export function PainSafeResponseSystemPanel({
  analysis,
  reports,
}: {
  analysis: PainSafeAnalysis;
  reports: ReportRow[];
}) {
  return (
    <div className="grid gap-8">
      <Alert tone="warning" title="Safety layer — never a diagnosis">
        {analysis.honesty[0]} {analysis.honesty[3]}
      </Alert>
      <Alert tone="info" title="Qualified medical evaluation">
        {analysis.honesty[1]} {analysis.honesty[2]}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Status
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={analysis.active ? "warning" : "success"}>
            {analysis.active ? "Pain-safe mode active" : "Pain-safe mode off"}
          </Badge>
          <Badge variant="neutral">Never diagnose</Badge>
        </div>
        {analysis.active ? (
          <Alert tone="warning" title="Aggressive recommendations paused">
            {analysis.seekCareMessage}
          </Alert>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">
            Report sharp pain, neurological symptoms, or a serious injury to
            pause aggressive training recommendations.
          </p>
        )}
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {analysis.explanation.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Report a concern
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          This records a safety signal for coaching tools. It is not a medical
          intake and does not diagnose anything.
        </p>
        <form action={reportPainSafeSymptomAction} className="grid gap-3 max-w-md">
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Category</span>
            <select
              name="category"
              required
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2"
              defaultValue="sharp_pain"
            >
              {PAIN_SAFE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {PAIN_SAFE_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Notes (optional)</span>
            <textarea
              name="notes"
              rows={3}
              placeholder="Brief description — not a diagnosis"
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2"
            />
          </label>
          <Button type="submit">Report and pause aggressive advice</Button>
        </form>
      </section>

      {reports.length > 0 ? (
        <section className="grid gap-3">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
            Active reports
          </h2>
          <ul className="grid gap-3">
            {reports.map((r) => (
              <li
                key={r.id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Badge variant="warning">
                      {PAIN_SAFE_CATEGORY_LABELS[
                        r.category as keyof typeof PAIN_SAFE_CATEGORY_LABELS
                      ] ?? r.category}
                    </Badge>
                    <p className="mt-2 text-sm text-[var(--color-muted)]">
                      {r.notes?.trim() || "No notes"}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {r.createdAt.toISOString().slice(0, 10)}
                    </p>
                  </div>
                  <form action={clearPainSafeReportAction}>
                    <input type="hidden" name="reportId" value={r.id} />
                    <Button type="submit" variant="secondary">
                      Clear report
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-sm text-[var(--color-muted)]">
            Clear a report only after discussing next steps with a qualified
            professional who knows you. Clearing does not mean you are cleared
            to train hard.
          </p>
        </section>
      ) : null}
    </div>
  );
}
