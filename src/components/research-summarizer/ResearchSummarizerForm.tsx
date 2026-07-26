"use client";

import { useActionState } from "react";
import {
  Alert,
  Button,
  Input,
  Label,
  Select,
  Textarea,
} from "@/design-system";
import {
  summarizeVerifiedPaperAction,
  type SummarizeActionState,
} from "@/services/research-summarizer/actions";
import {
  RESEARCH_LIBRARY_CATEGORIES,
  RESEARCH_LIBRARY_CATEGORY_LABELS,
} from "@/domain/research-library";
import {
  RESEARCH_SUMMARIZER_OUTPUT_LABELS,
  type ResearchSummarizerOutputField,
} from "@/domain/research-summarizer";

const initial: SummarizeActionState = { ok: false };

const FIELD_ORDER = Object.keys(
  RESEARCH_SUMMARIZER_OUTPUT_LABELS,
) as ResearchSummarizerOutputField[];

export function ResearchSummarizerForm() {
  const [state, action, pending] = useActionState(
    summarizeVerifiedPaperAction,
    initial,
  );

  return (
    <div className="grid gap-6">
      <Alert tone="warning" title="Citation from verified input only">
        Paste a real citation label and paper text. The summarizer never
        invents DOIs, titles, or citations from model memory. AI drafts stay
        private until a human review approves them.
      </Alert>

      <form action={action} className="grid gap-4">
        <div>
          <Label htmlFor="citationLabel">Citation (required)</Label>
          <Input
            id="citationLabel"
            name="citationLabel"
            className="mt-1"
            placeholder="Author et al. (Year). Title. Journal, vol(issue), pages."
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="citationUrl">Citation URL (optional)</Label>
            <Input
              id="citationUrl"
              name="citationUrl"
              className="mt-1"
              placeholder="https://doi.org/…"
            />
          </div>
          <div>
            <Label htmlFor="category">Category (optional)</Label>
            <Select id="category" name="category" defaultValue="" className="mt-1">
              <option value="">—</option>
              {RESEARCH_LIBRARY_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {RESEARCH_LIBRARY_CATEGORY_LABELS[c]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="title">Title (verified)</Label>
            <Input id="title" name="title" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="authors">Authors (verified)</Label>
            <Input id="authors" name="authors" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="year">Year (verified)</Label>
            <Input id="year" name="year" className="mt-1" />
          </div>
        </div>
        <div>
          <Label htmlFor="abstractOrText">Verified abstract / paper text</Label>
          <Textarea
            id="abstractOrText"
            name="abstractOrText"
            rows={10}
            className="mt-1 font-mono text-xs"
            placeholder="Paste text you verified from the paper (abstract or body)."
            required
          />
        </div>
        <Button type="submit" loading={pending}>
          Generate AI draft
        </Button>
      </form>

      {state.error ? (
        <Alert tone="danger" title="Summarize failed">
          {state.error}
        </Alert>
      ) : null}

      {state.ok && state.fields ? (
        <Alert tone="success" title="AI draft (not published)">
          <p className="text-sm">{state.message}</p>
          <p className="mt-2 text-sm">
            Draft ID: <code>{state.draftId}</code> · Status:{" "}
            <code>{state.status}</code>
          </p>
          <p className="mt-1 text-sm">
            Citation (verified input): {state.citationLabel}
          </p>
          <dl className="mt-3 grid gap-2 text-sm">
            {FIELD_ORDER.map((key) => (
              <div key={key}>
                <dt className="font-medium text-[var(--color-foreground)]">
                  {RESEARCH_SUMMARIZER_OUTPUT_LABELS[key]}
                </dt>
                <dd className="text-[var(--color-muted)]">{state.fields?.[key]}</dd>
              </div>
            ))}
          </dl>
        </Alert>
      ) : null}
    </div>
  );
}
