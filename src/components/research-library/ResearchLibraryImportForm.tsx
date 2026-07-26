"use client";

import { useActionState } from "react";
import { Alert, Button, Label, Select, Textarea } from "@/design-system";
import {
  dryRunResearchLibraryImportAction,
  type ResearchImportActionState,
} from "@/services/research-library/actions";
import { RESEARCH_LIBRARY_IMPORT_COLUMNS } from "@/domain/research-library";

const initial: ResearchImportActionState = { ok: false };

const SAMPLE_CSV = `slug,category,citationLabel,citationUrl,summary,practicalTakeaway,limitations,evidenceLabel
example-entry,strength,"Author A, Author B. (2020). Example title. Journal Name, 12(3), 100–110.",https://doi.org/10.0000/example,Short educational summary of findings.,One concrete coaching takeaway.,Population and design limits.,limited_evidence`;

export function ResearchLibraryImportForm() {
  const [state, action, pending] = useActionState(
    dryRunResearchLibraryImportAction,
    initial,
  );

  return (
    <div className="grid gap-6">
      <Alert tone="warning" title="Citation gate">
        Rows without <code>citationLabel</code> are rejected. Dry-run never
        invents studies and does not auto-write the curated catalog.
      </Alert>

      <p className="text-sm text-[var(--color-muted)]">
        Required columns: {RESEARCH_LIBRARY_IMPORT_COLUMNS.join(", ")}. Evidence
        labels must be research family: strong_evidence, moderate_evidence, or
        limited_evidence.
      </p>

      <form action={action} className="grid gap-4">
        <div>
          <Label htmlFor="format">Format</Label>
          <Select id="format" name="format" defaultValue="csv" className="mt-1">
            <option value="csv">CSV</option>
            <option value="json">JSON array</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="payload">Payload</Label>
          <Textarea
            id="payload"
            name="payload"
            rows={12}
            className="mt-1 font-mono text-xs"
            defaultValue={SAMPLE_CSV}
            spellCheck={false}
          />
        </div>
        <Button type="submit" loading={pending}>
          Dry-run import
        </Button>
      </form>

      {state.error ? (
        <Alert tone="danger" title="Import failed">
          {state.error}
        </Alert>
      ) : null}

      {state.message ? (
        <Alert tone="success" title="Dry-run result">
          {state.message} Accepted: {state.accepted ?? 0}. Rejected:{" "}
          {state.rejected ?? 0}.
          {state.rejectionReasons && state.rejectionReasons.length > 0 ? (
            <ul className="mt-2 list-disc pl-5 text-sm">
              {state.rejectionReasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          ) : null}
        </Alert>
      ) : null}

      <details className="text-sm text-[var(--color-muted)]">
        <summary className="cursor-pointer text-[var(--color-foreground)]">
          Sample CSV (replace with a real citation before publishing)
        </summary>
        <pre className="mt-2 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-border)] p-3 text-xs">
          {SAMPLE_CSV}
        </pre>
      </details>
    </div>
  );
}
