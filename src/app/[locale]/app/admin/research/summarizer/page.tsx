import Link from "next/link";
import { ResearchSummarizerForm } from "@/components/research-summarizer/ResearchSummarizerForm";
import { ResearchSummarizerReviewQueue } from "@/components/research-summarizer/ResearchSummarizerReviewQueue";
import { Alert } from "@/design-system";
import { RESEARCH_SUMMARIZER_HONESTY } from "@/domain/research-summarizer";
import { requireAdmin } from "@/services/admin/require-admin";
import { getResearchSummarizerQueue } from "@/services/research-summarizer";
import { featureFlags } from "@/config/feature-flags";

export default async function AdminResearchSummarizerPage() {
  await requireAdmin();

  if (!featureFlags.aiResearchSummarizer) {
    return (
      <Alert tone="warning" title="AI Research Summarizer off">
        Enable NEXT_PUBLIC_FF_AI_RESEARCH_SUMMARIZER to use this workflow.
      </Alert>
    );
  }

  const queue = await getResearchSummarizerQueue();
  const drafts = queue.ok ? queue.drafts : [];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-sm text-[var(--color-muted)]">
          <Link href="/app/admin/research" className="text-[var(--color-accent)]">
            ← Research Library import
          </Link>
        </p>
        <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl">
          AI Research Summarizer
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {RESEARCH_SUMMARIZER_HONESTY[0]} {RESEARCH_SUMMARIZER_HONESTY[1]}
        </p>
      </div>

      <section className="space-y-4">
        <h3 className="font-[family-name:var(--font-display)] text-xl">
          1. Summarize verified input
        </h3>
        <ResearchSummarizerForm />
      </section>

      <section className="space-y-4">
        <h3 className="font-[family-name:var(--font-display)] text-xl">
          2. Human review before publication
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          {RESEARCH_SUMMARIZER_HONESTY[3]}
        </p>
        <ResearchSummarizerReviewQueue drafts={drafts} />
      </section>
    </div>
  );
}
